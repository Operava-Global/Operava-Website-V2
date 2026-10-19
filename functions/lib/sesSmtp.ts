/**
 * Amazon SES SMTP submission from Cloudflare Pages Functions.
 * Region: ap-southeast-2 (Sydney); STARTTLS is mandatory before AUTH.
 * Credentials belong only in Cloudflare environment secrets, not Git.
 */
import { connect } from 'cloudflare:sockets'

export type SesSmtpEnv = {
  SES_SMTP_USERNAME?: string
  SES_SMTP_PASSWORD?: string
  SES_SMTP_HOST?: string
}
export type OutboundEmail = {
  from: string
  to: string[]
  replyTo?: string
  bcc?: string[]
  subject: string
  html?: string
  text?: string
}

const enc = new TextEncoder()
const dec = new TextDecoder()
const SMTP_HOST = 'email-smtp.ap-southeast-2.amazonaws.com'
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[a-zA-Z]{2,}$/

function mailbox(address: string) {
  const a = String(address).match(/<([^<>]+)>/)?.[1] || String(address)
  const value = a.trim().toLowerCase()
  if (!EMAIL.test(value) || /[\r\n]/.test(value)) throw new Error('EMAIL_INVALID_TO')
  return value
}
function cleanHeader(value: string) {
  return String(value || '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim()
}
function b64(value: string) {
  const bytes = enc.encode(value)
  let result = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    result += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(result)
}
function b64lines(value: string) {
  return b64(value).match(/.{1,76}/g)?.join('\r\n') || ''
}

function mimeMessage(mail: OutboundEmail) {
  const boundary = 'operava-' + crypto.randomUUID().replace(/-/g, '')
  const subject = cleanHeader(mail.subject).slice(0, 200)
  const from = cleanHeader(mail.from).slice(0, 180)
  const to = mail.to.map(mailbox).join(', ')
  const safeText = mail.text || 'Your OPERAVA email has been sent. Please view the HTML version for more information.'
  const safeHtml = mail.html || `<p>${safeText.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>')}</p>`
  const lines = [
    `From: ${from}`, `To: ${to}`,
    ...(mail.replyTo ? [`Reply-To: ${mailbox(mail.replyTo)}`] : []),
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@operavaglobal.com>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64lines(safeText),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64lines(safeHtml),
    '',
    `--${boundary}--`,
    '',
  ]
  return lines.join('\r\n')
}

type Reply = { code: number; lines: string[] }
class SmtpChannel {
  private writer: WritableStreamDefaultWriter<Uint8Array>
  private reader: ReadableStreamDefaultReader<Uint8Array>
  private buffer = ''
  constructor(private socket: ReturnType<typeof connect>) {
    this.writer = socket.writable.getWriter()
    this.reader = socket.readable.getReader()
  }
  async readResponse(): Promise<Reply> {
    const lines: string[] = []
    for (let tries = 0; tries < 60; tries++) {
      while (this.buffer.includes('\n')) {
        const idx = this.buffer.indexOf('\n')
        const line = this.buffer.slice(0, idx).replace(/\r$/, '')
        this.buffer = this.buffer.slice(idx + 1)
        if (!/^\d{3}[ -]/.test(line)) throw new Error('SES_SMTP_MALFORMED_RESPONSE')
        lines.push(line)
        if (line[3] === ' ') return { code: Number(line.slice(0, 3)), lines }
      }
      let timeout: ReturnType<typeof setTimeout> | undefined
      let read: ReadableStreamReadResult<Uint8Array>
      try {
        read = await Promise.race([
          this.reader.read(),
          new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('SES_SMTP_TIMEOUT')), 12000) }),
        ])
      } finally {
        if (timeout) clearTimeout(timeout)
      }
      if (read.done) throw new Error('SES_SMTP_DISCONNECTED')
      this.buffer += dec.decode(read.value, { stream: true })
      if (this.buffer.length > 16000) throw new Error('SES_SMTP_RESPONSE_TOO_LARGE')
    }
    throw new Error('SES_SMTP_RESPONSE_TOO_LARGE')
  }
  async write(value: string) { await this.writer.write(enc.encode(value)) }
  async command(line: string, expected: number[]) {
    await this.write(line + '\r\n')
    const reply = await this.readResponse()
    if (!expected.includes(reply.code)) throw new Error('SES_SMTP_REJECTED_' + reply.code)
    return reply
  }
  startTls() {
    this.writer.releaseLock()
    this.reader.releaseLock()
    this.socket = this.socket.startTls()
    this.writer = this.socket.writable.getWriter()
    this.reader = this.socket.readable.getReader()
    this.buffer = ''
  }
  async close() {
    try { this.writer.releaseLock() } catch { /* no-op */ }
    try { this.reader.releaseLock() } catch { /* no-op */ }
    try { await this.socket.close() } catch { /* no-op */ }
  }
}

export async function sendSesSmtp(env: SesSmtpEnv, mail: OutboundEmail): Promise<{id: string; status: number}> {
  const username = String(env.SES_SMTP_USERNAME || '').trim()
  const password = String(env.SES_SMTP_PASSWORD || '').trim()
  if (!username || !password) throw new Error('SES_SMTP_NOT_CONFIGURED')
  const host = String(env.SES_SMTP_HOST || SMTP_HOST).trim()
  if (host !== SMTP_HOST) throw new Error('SES_SMTP_HOST_INVALID')
  if (!mail.to.length) throw new Error('EMAIL_INVALID_TO')
  const recipients = [...new Set([...mail.to, ...(mail.bcc || [])].map(mailbox))]
  const from = mailbox(mail.from)
  let channel: SmtpChannel | undefined
  try {
    // Cloudflare's TCP socket opens insecurely only for the SMTP greeting.
    // A successful STARTTLS upgrade is required before credentials are transmitted.
    const socket = connect({ hostname: host, port: 587 }, { secureTransport: 'starttls' })
    channel = new SmtpChannel(socket)
    const greeting = await channel.readResponse()
    if (greeting.code !== 220) throw new Error('SES_SMTP_GREETING_FAILED')
    const hello = await channel.command('EHLO operavaglobal.com', [250])
    if (!hello.lines.some(line => /\bSTARTTLS\b/i.test(line))) throw new Error('SES_SMTP_TLS_REQUIRED')
    await channel.command('STARTTLS', [220])
    channel.startTls()
    await channel.command('EHLO operavaglobal.com', [250])
    await channel.command('AUTH PLAIN ' + b64('\0' + username + '\0' + password), [235])
    await channel.command('MAIL FROM:<' + from + '>', [250])
    for (const recipient of recipients) await channel.command('RCPT TO:<' + recipient + '>', [250, 251])
    await channel.command('DATA', [354])
    await channel.write(mimeMessage(mail) + '\r\n.\r\n')
    const delivered = await channel.readResponse()
    if (delivered.code !== 250) throw new Error('SES_SMTP_REJECTED_' + delivered.code)
    await channel.command('QUIT', [221]).catch(() => {})
    // SES usually supplies a transaction ID in the final 250 SMTP response.
    const id = delivered.lines.at(-1)?.match(/[A-Z0-9._-]{20,}/i)?.[0] || ''
    return { id, status: 250 }
  } catch (err) {
    // Never log passwords, AUTH exchange, or full email contents.
    const message = err instanceof Error ? err.message : 'SES_SMTP_SEND_FAILED'
    console.error('SES SMTP delivery failed:', message.replace(/(AUTH|password).*/i, '[redacted]'))
    throw new Error(message.startsWith('SES_') ? message : 'SES_SMTP_SEND_FAILED')
  } finally {
    await channel?.close()
  }
}