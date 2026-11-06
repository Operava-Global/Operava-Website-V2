import express, { type Request as ExpressRequest, type Response as ExpressResponse } from 'express'
import path from 'path'
import { createServer as createViteServer } from 'vite'
import { clientConfirmationEmail, clientConfirmationText, applicantConfirmationEmail, applicantConfirmationText, type FormEnv } from './functions/lib/formCore.ts'
import { onRequestPost as formsStartHandler } from './functions/api/forms/start.ts'
import { onRequestPost as formsVerifyHandler } from './functions/api/forms/verify.ts'
import { onRequestPost as formsResendHandler } from './functions/api/forms/resend.ts'
import { onRequestPost as formsUploadHandler } from './functions/api/forms/upload.ts'
import { onRequestPost as applyHandler } from './functions/api/apply.ts'

type BridgeEnv = FormEnv & { APPLICANT_CC?: string }

function buildFormEnv(): BridgeEnv {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM || 'Operava Notification <notification-noreply@operavaglobal.com>',
    OTP_SECRET: process.env.OTP_SECRET,
    CLIENT_INBOX: process.env.CLIENT_INBOX || 'hello@operavaglobal.com',
    TALENT_INBOX: process.env.TALENT_INBOX || 'talents@operavaglobal.com',
    APPLICANT_CC: process.env.APPLICANT_CC,
  }
}

/**
 * Bridges an Express request to a Cloudflare Pages Function handler so the
 * same `functions/api/**` logic used in production also runs under the
 * local/preview Node server (which has no Pages Functions runtime).
 */
function bridgePagesFunction(
  handler: (context: { request: globalThis.Request; env: BridgeEnv }) => Promise<globalThis.Response>,
) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    try {
      const safeHost = /^[a-zA-Z0-9.-]+(:\d+)?$/.test(req.headers.host || '') ? req.headers.host : 'localhost'
      const url = `http://${safeHost}${req.originalUrl}`
      const headers = new Headers()
      const skipHeaders = new Set(['content-length', 'host', 'connection', 'transfer-encoding'])
      for (const [key, value] of Object.entries(req.headers)) {
        if (skipHeaders.has(key.toLowerCase())) continue
        if (typeof value === 'string') headers.set(key, value)
        else if (Array.isArray(value)) headers.set(key, value.join(', '))
      }
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
      const body = hasBody
        ? Buffer.isBuffer(req.body)
          ? req.body
          : JSON.stringify(req.body ?? {})
        : undefined
      const webRequest = new globalThis.Request(url, { method: req.method, headers, body })
      const response = await handler({ request: webRequest, env: buildFormEnv() })
      res.status(response.status)
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'content-length') return
        res.setHeader(key, value)
      })
      res.send(Buffer.from(await response.arrayBuffer()))
    } catch (err) {
      console.error('forms bridge error', err)
      res.status(500).json({ error: 'Unable to process this request.' })
    }
  }
}

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

function clean(value: unknown, max = 2000): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
}

function parseList(value?: string): string[] {
  if (!value) return []
  return value
    .split(/[,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => EMAIL_RE.test(item))
}

function uniqueEmails(list: string[], exclude: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of list) {
    if (!item || item === exclude || seen.has(item)) continue
    seen.add(item)
    out.push(item)
  }
  return out
}

async function startServer() {
  const app = express()
  const PORT = 3000

  app.use(express.json())

  app.post('/api/forms/start', bridgePagesFunction(formsStartHandler))
  app.post('/api/forms/verify', bridgePagesFunction(formsVerifyHandler))
  app.post('/api/forms/resend', bridgePagesFunction(formsResendHandler))
  app.post(
    '/api/forms/upload',
    express.raw({ type: () => true, limit: '10mb' }),
    bridgePagesFunction(formsUploadHandler),
  )
  app.post('/api/apply', bridgePagesFunction(applyHandler))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.post('/api/inquiry', async (req, res) => {
    try {
      const body = req.body || {}
      if (clean(body.website, 80)) {
        res.json({ ok: true, referenceId: 'OPV-FILTERED' })
        return
      }
      const kind = clean(body.kind, 40)
      const isCareer = kind === 'career' || kind === 'ai-career'
      const allowed = ['contact', 'service', 'ai-consultation', 'career', 'ai-career']
      if (!allowed.includes(kind)) {
        res.status(400).json({ error: 'Unknown inquiry type.' })
        return
      }
      const name = clean(body.name, 120)
      const email = clean(body.email, 180).toLowerCase()
      if (name.length < 2 || !EMAIL_RE.test(email)) {
        res.status(400).json({ error: 'Name and a valid email are required.' })
        return
      }
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        res.status(503).json({ error: 'Email delivery is not configured yet.' })
        return
      }
      const clientInbox = process.env.CLIENT_INBOX || 'hello@operavaglobal.com'
      const talentInbox = process.env.TALENT_INBOX || 'talents@operavaglobal.com'
      const from = process.env.RESEND_FROM || 'Operava Notification <notification-noreply@operavaglobal.com>'
      const ticketId = `OPV-${Math.floor(100000 + Math.random() * 900000)}`
      const service = clean(body.service, 160)
      const role = clean(body.role, 180)
      const notes = clean(body.notes || body.description, 4000)
      const bccList = uniqueEmails(
        isCareer
          ? [talentInbox]
          : [clientInbox],
        email,
      )
      const subject = isCareer
        ? `Ticket #${ticketId} — career application received`
        : `Ticket #${ticketId} — consultation request received`
      const rows = [
        { label: 'Email', value: email },
        { label: 'Phone', value: clean(body.phone, 40) },
        { label: 'Country / Location', value: clean(body.country, 80) },
        { label: 'Company / Organization', value: clean(body.company, 160) },
        { label: 'Inquiry Category', value: kind },
        { label: 'Service Interested In', value: service },
        { label: 'Project Requirements', value: notes },
        { label: 'Position Applied For', value: role },
        { label: 'Engagement Model', value: clean(body.teamModel, 80) },
        { label: 'Timeline', value: clean(body.timeline, 80) },
      ].filter((r) => Boolean(r.value))

      const confirmation = { name, email, referenceId: ticketId, sourceLabel: isCareer ? 'Application' : 'Service Inquiry', rows }
      const html = isCareer ? applicantConfirmationEmail(confirmation) : clientConfirmationEmail(confirmation)
      const text = isCareer ? applicantConfirmationText(confirmation) : clientConfirmationText(confirmation)

      const payload: Record<string, unknown> = {
        from,
        to: [email],
        bcc: bccList.length ? bccList : undefined,
        subject,
        text,
        html,
      }

      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!sent.ok) {
        res.status(502).json({ error: 'Unable to deliver this inquiry.' })
        return
      }
      res.json({ ok: true, referenceId: ticketId })
    } catch {
      res.status(500).json({ error: 'Unable to process this inquiry.' })
    }
  })

  // The Express preview has no Cloudflare Workers AI binding. Return a
  // controlled service-unavailable response so the AVA UI uses its existing
  // local conversation fallback instead of a second, divergent AI provider.
  app.post('/api/chat', (_req, res) => {
    res.status(503).json({
      error: 'Workers AI is available in the Cloudflare Pages runtime. Using the local AVA fallback in this preview.',
      code: 'WORKERS_AI_RUNTIME_UNAVAILABLE',
    })
  })

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start'

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), 'dist')
    app.use(express.static(distPath))
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
