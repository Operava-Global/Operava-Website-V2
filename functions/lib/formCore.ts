import {
  careersOtpEmailTemplate,
  formsOtpEmailTemplate,
  professionalConfirmationTemplate,
  staffNotificationTemplate,
  careersStaffNotificationTemplate,
} from './emailTemplates'
import { sendSesSmtp } from './sesSmtp'
import type { EmailAttachment } from './emailAttachment'

export type FormType = 'SERVICES' | 'CAREERS' | 'CONTACT' | 'ACADEMY' | 'PARTNERSHIP'

export interface FormEnv {
  SUBMISSIONS_DB?: D1Database
  RESUMES_BUCKET?: R2Bucket
  SES_SMTP_USERNAME?: string
  SES_SMTP_PASSWORD?: string
  SES_SMTP_HOST?: string
  SES_EMAIL_FROM?: string
  RESEND_EMAIL_FROM?: string
  RESEND_FROM?: string
  OTP_SECRET?: string
  CLIENT_INBOX?: string
  PARTNERS_INBOX?: string
  TALENT_INBOX?: string
  ACADEMY_INBOX?: string
}

export const DEFAULT_RESEND_FROM = 'Operava <noreply@operavaglobal.com>'
export const OTP_RESEND_FROM = 'Operava <noreply@operavaglobal.com>'
export const NOTIFICATION_NOREPLY_FROM = 'Operava <noreply@operavaglobal.com>'
export const CLIENT_RESEND_FROM = 'hello@operavaglobal.com'
export const TALENT_RESEND_FROM = 'talents@operavaglobal.com'
export const ACADEMY_RESEND_FROM = 'academy@operavaglobal.com'
export const APPLICANT_CONFIRMATION_FROM = 'Operava <noreply@operavaglobal.com>'
export const SUPPORT_INBOX = 'hello@operavaglobal.com'
export const ACADEMY_INBOX_DEFAULT = 'academy@operavaglobal.com'
const PLAIN_EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const OTP_SECRET_MIN_LENGTH = 32

export function resolveSecret(env: FormEnv): string | null {
  const otp = env.OTP_SECRET && String(env.OTP_SECRET).trim()
  if (otp && otp.length >= OTP_SECRET_MIN_LENGTH) return otp
  return null
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const enc = new TextEncoder()
  const ba = enc.encode(a)
  const bb = enc.encode(b)
  if (ba.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i]
  return diff === 0
}

export function isProductionRuntime(): boolean {
  try {
    if (typeof process === 'undefined' || !process?.env) return true
    const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase()
    if (nodeEnv === 'development' || nodeEnv === 'test') return false
    return true
  } catch {
    return true
  }
}

export function b64urlEncode(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof input === 'string') bytes = new TextEncoder().encode(input)
  else bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i])
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return b64urlEncode(sig)
}

export async function issueSignedDraft(
  secret: string,
  data: {
    email: string
    formType: FormType
    payload: string
    codeHash: string
    expiresAt: number
    attempts?: number
    resends?: number
    lastSentAt?: number
  },
): Promise<string> {
  const body = JSON.stringify({
    email: data.email,
    formType: data.formType,
    payload: data.payload,
    codeHash: data.codeHash,
    expiresAt: data.expiresAt,
    attempts: data.attempts || 0,
    resends: data.resends || 0,
    lastSentAt: data.lastSentAt || Date.now(),
  })
  const payload = b64urlEncode(body)
  const sig = await hmacSign(secret, payload)
  return 's1.' + payload + '.' + sig
}

export async function readSignedDraft(secret: string, draftId: string) {
  if (!draftId || !draftId.startsWith('s1.')) return null
  const parts = draftId.split('.')
  if (parts.length !== 3) return null
  const payload = parts[1]
  const sig = parts[2]
  const expected = await hmacSign(secret, payload)
  if (!timingSafeEqualStr(sig, expected)) return null
  try {
    return JSON.parse(b64urlDecode(payload)) as {
      email: string
      formType: FormType
      payload: string
      codeHash: string
      expiresAt: number
      attempts: number
      resends: number
      lastSentAt: number
    }
  } catch {
    return null
  }
}

export const EMAIL_RE = PLAIN_EMAIL_RE

export function extractPlainEmail(value: string): string {
  const raw = String(value || '').trim()
  const angle = raw.match(/<([^>]+)>/)
  if (angle && angle[1]) return angle[1].trim().toLowerCase()
  return raw.toLowerCase()
}

function mapVerifiedMailbox(email: string): string {
  const e = email.toLowerCase()
  if (
    e === 'notification@operavaglobal.com' ||
    e === 'notification-noreply@operavaglobal.com' ||
    e === 'no-reply@operavaglobal.com' ||
    e === 'noreply@operavaglobal.com'
  ) {
    return 'noreply@operavaglobal.com'
  }
  return e
}

export function normalizeFromAddress(value: string | undefined | null): string {
  let raw = String(value || '').trim()
  if (!raw) return DEFAULT_RESEND_FROM
  raw = raw.replace(/^([^<\s]+)<([^>]+)>$/, '$1 <$2>')
  const angle = raw.match(/^(.*)<([^>]+)>$/)
  if (angle) {
    let name = angle[1].trim().replace(/["<>]/g, '') || 'Operava'
    if (name.toUpperCase() === 'OPERAVA') name = 'Operava'
    const email = mapVerifiedMailbox(angle[2].trim())
    if (PLAIN_EMAIL_RE.test(email)) return name + ' <' + email + '>'
  }
  if (PLAIN_EMAIL_RE.test(raw.toLowerCase())) {
    return 'Operava <' + mapVerifiedMailbox(raw) + '>'
  }
  return DEFAULT_RESEND_FROM
}

export function resolveFromEnv(env: FormEnv): string {
  const preferred =
    (env.SES_EMAIL_FROM && String(env.SES_EMAIL_FROM).trim()) ||
    (env.RESEND_EMAIL_FROM && String(env.RESEND_EMAIL_FROM).trim()) ||
    (env.RESEND_FROM && String(env.RESEND_FROM).trim()) ||
    ''
  return normalizeFromAddress(preferred || DEFAULT_RESEND_FROM)
}

export function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export function otpSecretMissingResponse() {
  return json(
    {
      error:
        'Email verification is not configured (OTP_SECRET missing). Set a 32+ character OTP_SECRET in Cloudflare Pages secrets, then redeploy.',
      code: 'OTP_SECRET_MISSING',
    },
    503,
  )
}

export function clean(value: unknown, max = 4000) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
}

export function escapeHtml(value: string) {
  const amp = String.fromCharCode(38)
  return value
    .replace(/&/g, amp + 'amp;')
    .replace(/</g, amp + 'lt;')
    .replace(/>/g, amp + 'gt;')
    .replace(/"/g, amp + 'quot;')
}

export function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  return user.slice(0, 1) + '***@' + domain
}

export function makeReference(type: FormType) {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 90000000
  const prefix = type === 'ACADEMY' ? 'ACA' : type.slice(0, 3)
  return 'OPERAVA-' + prefix + '-' + String(10000000 + n).slice(0, 8)
}

export function generateOtp() {
  const range = 900000
  const limit = Math.floor(0x100000000 / range) * range
  const random = new Uint32Array(1)
  do {
    crypto.getRandomValues(random)
  } while (random[0] >= limit)
  return String(100000 + (random[0] % range))
}

function toHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/** HMAC-SHA256(secret, code) as lowercase hex */
export async function hashOtp(secret: string, code: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(code)))
  return toHex(new Uint8Array(sig))
}

async function legacyHashOtpVariants(secret: string, code: string): Promise<string[]> {
  const enc = new TextEncoder()
  const variants = [secret + '\0' + code, secret + code, code + secret, secret + ':' + code]
  const out: string[] = []
  for (const material of variants) {
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(material))
    out.push(toHex(new Uint8Array(digest)))
  }
  return out
}

export function otpHashMatches(expectedHex: string, actualHex: string): boolean {
  return timingSafeEqualStr(String(expectedHex || ''), String(actualHex || ''))
}

/** Accept current HMAC hash or legacy keyed digests for in-flight drafts. */
export async function otpCodeMatches(secret: string, code: string, expectedHex: string): Promise<boolean> {
  const normalized = String(code || '').replace(/\D/g, '').slice(0, 6)
  if (normalized.length !== 6 || !expectedHex) return false
  const current = await hashOtp(secret, normalized)
  if (otpHashMatches(expectedHex, current)) return true
  const legacies = await legacyHashOtpVariants(secret, normalized)
  for (const h of legacies) {
    if (otpHashMatches(expectedHex, h)) return true
  }
  return false
}

export function renderEmailTemplate(template: string, replacements: Record<string, string>): string {
  let html = template
  for (const key of Object.keys(replacements)) {
    html = html.split('{{' + key + '}}').join(replacements[key])
  }
  return html
}

export function otpEmailHtml(name: string, purpose: string, code: string) {
  const display = name && name.trim() ? name.trim() : 'there'
  // The owner-supplied HTML uses lowercase {{otp_code}} and
  // {{expiry_minutes}} placeholders; keep its structure and copy unchanged.
  void display
  // Careers uses the same master layout, with job-application wording only.
  const template = purpose === 'JOB APPLICATION' ? careersOtpEmailTemplate : formsOtpEmailTemplate
  // Match the approved 3+3 appearance in email only; verification remains six numeric digits.
  const formattedCode = String(code).replace(/^(\d{3})(\d{3})$/, '$1 $2')
  return renderEmailTemplate(template, {
    otp_code: escapeHtml(formattedCode),
    expiry_minutes: '10',
  })
}

export function otpEmailText(name: string, purpose: string, code: string) {
  const display = name && name.trim() ? name.trim() : 'there'
  return (
    'Hi ' +
    display +
    ',\n\n' +
    'Your verification code for ' +
    purpose +
    ' is: ' +
    code +
    '\n\nThis code expires in 10 minutes.\n\nDo not share this code. If you did not request it, ignore this email.\n\nOperava Team,\nNote: This is an email generated email, please do not reply.\n\nOPERAVA · www.operavaglobal.com'
  )
}


export type SendEmailResult = { id: string; status: number }
export type SendResendResult = SendEmailResult

/** Kept for older recruitment and inquiry routes; the actual provider is SES. */
export class EmailSendError extends Error {
  code: string
  providerStatus?: number
  providerMessage?: string
  fromUsed?: string
  constructor(code: string, message: string, extra?: { providerStatus?: number; providerMessage?: string; fromUsed?: string }) {
    super(message)
    this.name = 'EmailSendError'
    this.code = code
    this.providerStatus = extra?.providerStatus
    this.providerMessage = extra?.providerMessage
    this.fromUsed = extra?.fromUsed
  }
}


/** All transactional mail (verification, confirmations, staff notifications) uses AWS SES SMTP. */
export async function sendEmail(env: FormEnv, payload: Record<string, unknown>): Promise<SendEmailResult> {
  if (!env.SES_SMTP_USERNAME || !env.SES_SMTP_PASSWORD) throw new Error('SES_SMTP_NOT_CONFIGURED')
  const from = normalizeFromAddress(
    (typeof payload.from === 'string' && payload.from) || resolveFromEnv(env),
  )
  let to: string[] = []
  if (Array.isArray(payload.to)) {
    to = payload.to.map((v) => extractPlainEmail(String(v))).filter((e) => PLAIN_EMAIL_RE.test(e))
  } else if (typeof payload.to === 'string') {
    const address = extractPlainEmail(payload.to)
    if (PLAIN_EMAIL_RE.test(address)) to = [address]
  }
  if (!to.length) throw new Error('EMAIL_INVALID_TO')
  const replyTo = typeof payload.reply_to === 'string'
    ? extractPlainEmail(payload.reply_to)
    : undefined
  const bcc = Array.isArray(payload.bcc)
    ? payload.bcc.map((v) => extractPlainEmail(String(v))).filter((e) => PLAIN_EMAIL_RE.test(e))
    : typeof payload.bcc === 'string'
      ? [extractPlainEmail(payload.bcc)].filter((e) => PLAIN_EMAIL_RE.test(e))
      : undefined
  return sendSesSmtp(env, {
    from,
    to,
    ...(replyTo && PLAIN_EMAIL_RE.test(replyTo) ? { replyTo } : {}),
    ...(bcc?.length ? { bcc } : {}),
    subject: String(payload.subject || 'OPERAVA').slice(0, 200),
    html: typeof payload.html === 'string' ? payload.html : undefined,
    text: typeof payload.text === 'string' ? payload.text : undefined,
    ...(Array.isArray(payload.attachments) ? { attachments: payload.attachments as EmailAttachment[] } : {}),
  })
}

/** Backwards-compatible function name; always uses SES SMTP, never Resend API. */
export const sendResend = sendEmail

export function inboxFor(type: FormType, env: FormEnv) {
  if (type === 'CAREERS') return [env.TALENT_INBOX || 'talents@operavaglobal.com']
  if (type === 'ACADEMY') return [env.ACADEMY_INBOX || ACADEMY_INBOX_DEFAULT]
  if (type === 'PARTNERSHIP') return [env.PARTNERS_INBOX || 'partners@operavaglobal.com']
  return [env.CLIENT_INBOX || 'hello@operavaglobal.com']
}

export function senderFor(_type: FormType, env: FormEnv) {
  return resolveFromEnv(env)
}

export function purposeLabel(type: FormType) {
  if (type === 'SERVICES') return 'SERVICE INQUIRY'
  if (type === 'CAREERS') return 'JOB APPLICATION'
  if (type === 'ACADEMY') return 'ACADEMY ENROLLMENT / INQUIRY'
  if (type === 'PARTNERSHIP') return 'PARTNERSHIP PROPOSAL'
  return 'GENERAL INQUIRY'
}

function submissionValue(rows: Array<{ label: string; value: string }>, ...labels: string[]) {
  const wanted = labels.map((label) => label.toLowerCase())
  return rows.find((row) => wanted.includes(row.label.toLowerCase()))?.value || ''
}


type ConfirmationInput = {
  name: string
  email: string
  referenceId: string
  sourceLabel: string
  rows: Array<{ label: string; value: string }>
}

const confirmationFields: Array<{ label: string; keys: string[] }> = [
  { label: 'Email', keys: ['Email'] },
  { label: 'Phone', keys: ['Phone'] },
  { label: 'Country / Location', keys: ['Country / Location', 'Country'] },
  { label: 'Company / Organization', keys: ['Company / Organization', 'Company'] },
  { label: 'Partnership Type', keys: ['Partnership Type'] },
  { label: 'Your Role / Title', keys: ['Role / Title'] },
  { label: 'Target Markets', keys: ['Target Markets'] },
  { label: 'Partnership Timeline', keys: ['Partnership Timeline'] },
  { label: 'Inquiry Category', keys: ['Inquiry Type', 'Inquiry Category', 'Category'] },
  { label: 'Service / Program', keys: ['Service', 'Program', 'Track', 'Program / Track'] },
  { label: 'Project Requirements', keys: ['Description', 'Message', 'Requirements', 'Details'] },
  { label: 'Position Applied For', keys: ['Position', 'Role'] },
  { label: 'Availability', keys: ['Availability'] },
  { label: 'Education Level', keys: ['Education'] },
  { label: 'Skills & Specialization', keys: ['Skills'] },
  { label: 'Work Experience', keys: ['Experience'] },
  { label: 'Portfolio / Profile', keys: ['Portfolio', 'Resume / Portfolio', 'Website'] },
  { label: 'Estimated Budget', keys: ['Budget'] },
  { label: 'Website / System URL', keys: ['Website / System URL', 'WebsiteUrl'] },
  { label: 'Preferred Contact Method', keys: ['Preferred contact', 'Preferred Contact Method'] },
  { label: 'Additional Information', keys: ['Additional notes', 'Additional', 'Notes'] },
]

type ConfirmationKind = 'operavian' | 'partner' | 'application' | 'academy' | 'general'

/** Only Future Operavian and Future Business Partner categories get their specialized response copy. */
function confirmationKind(opts: ConfirmationInput, career = false): ConfirmationKind {
  if (career) return 'application'
  if (/academy/i.test(opts.sourceLabel)) return 'academy'
  if (/partnership/i.test(opts.sourceLabel)) return 'partner'
  const category = submissionValue(opts.rows, 'Inquiry Category', 'Inquiry Type', 'Category')
  if (/future\s+operavian/i.test(category)) return 'operavian'
  if (/future\s+business\s+partner|business\s+partnership/i.test(category)) return 'partner'
  return 'general'
}

function confirmationCopy(kind: ConfirmationKind) {
  if (kind === 'operavian' || kind === 'application') return {
    received: 'We have received your application to become a Future Operavian. Your submission has been recorded and is now under review.',
    next: 'Our team will review your application and contact you within 2-3 business days.',
    thankYou: 'Thank you for choosing OPERAVA. We are pleased to begin working with you.',
    team: 'OPERAVA Recruitment Team',
  }
  if (kind === 'partner') return {
    received: 'We have received your inquiry for a future business partnership. Your submission has been recorded and forwarded to our Business Partnership team.',
    next: 'Our partnerships team will review your proposal and contact you regarding potential next steps.',
    thankYou: 'Thank you for choosing OPERAVA. We look forward to partnering with you.',
    team: 'OPERAVA Support Team',
  }
  if (kind === 'academy') return {
    received: 'We have received your OPERAVA Academy enrollment or information inquiry. Your submission has been recorded.',
    next: 'Our Academy team will review your inquiry and contact you regarding the next steps.',
    thankYou: 'Thank you for choosing OPERAVA Academy.',
    team: 'OPERAVA Academy Team',
  }
  return {
    received: 'We have received your inquiry. Your submission has been recorded and is under review.',
    next: 'Our team will review your inquiry and contact you regarding the next steps.',
    thankYou: 'Thank you for choosing OPERAVA. We look forward to assisting you.',
    team: 'OPERAVA Support Team',
  }
}

function confirmationDetails(opts: ConfirmationInput): Array<[string, string]> {
  const isPartner = confirmationKind(opts) === 'partner'
  const values: Array<[string, string]> = [
    ['Name', opts.name],
    ...confirmationFields
      .map(({ label, keys }) => [isPartner && label === 'Project Requirements' ? 'Partnership Proposal' : isPartner && label === 'Website / System URL' ? 'Company Website' : label, submissionValue(opts.rows, ...keys)] as [string, string])
      .filter(([, value]) => Boolean(value && value.trim() && value !== 'undefined')),
  ]
  // Omit empty rows and avoid repeating the reference number in the detail listing.
  return values.filter(([, value]) => Boolean(value && value.trim()))
}

function confirmationMessage(opts: ConfirmationInput, career = false): {
  html: string
  text: string
} {
  const kind = confirmationKind(opts, career)
  const copy = confirmationCopy(kind)
  const name = String(opts.name || '').trim() || 'there'
  const details = confirmationDetails(opts)
  const p = (value: string) => '<p style="margin:0 0 20px;">' + value + '</p>'
  const safeReference = escapeHtml(opts.referenceId)
  const html =
    p('Hi ' + escapeHtml(name) + ',') +
    p('Thank you for contacting OPERAVA.') +
    p(copy.received) +
    p('Please keep this reference number for future correspondence: <strong style="color:#ffffff;">' + safeReference + '</strong>') +
    p('<strong style="color:#ffffff;">Submitted Details</strong>') +
    p(details.map(([label, value]) =>
      '<strong style="color:#f4f0fa;">' + escapeHtml(label) + ':</strong> ' + escapeHtml(value)
    ).join('<br>')) +
    p('Please use your verified email address when communicating with OPERAVA regarding your account, service, request, documentation, or engagement.') +
    p(copy.next) +
    p(copy.thankYou) +
    '<p style="margin:0;">Best regards,<br>' + copy.team + '</p>'
  const text = [
    'Hi ' + name + ',',
    'Thank you for contacting OPERAVA.',
    copy.received,
    'Please keep this reference number for future correspondence: ' + opts.referenceId,
    'Submitted Details\n' + details.map(([label, value]) => label + ': ' + value).join('\n'),
    'Please use your verified email address when communicating with OPERAVA regarding your account, service, request, documentation, or engagement.',
    copy.next,
    copy.thankYou,
    'Best regards,\n' + copy.team,
  ].join('\n\n')
  return { html: renderEmailTemplate(professionalConfirmationTemplate, { EMAIL_BODY: html }), text }
}

export function clientConfirmationEmail(opts: ConfirmationInput): string {
  return confirmationMessage(opts).html
}

export function applicantConfirmationEmail(opts: ConfirmationInput): string {
  return confirmationMessage(opts, true).html
}

export function clientConfirmationText(opts: ConfirmationInput): string {
  return confirmationMessage(opts).text
}

export function applicantConfirmationText(opts: ConfirmationInput): string {
  return confirmationMessage(opts, true).text
}

export function staffNotificationEmail(opts: {
  formType: FormType
  referenceId: string
  email: string
  submittedAt: string
  rows: Array<{ label: string; value: string }>
}): string {
  return renderEmailTemplate(opts.formType === 'CAREERS' ? careersStaffNotificationTemplate : staffNotificationTemplate, {
    FORM_TYPE: escapeHtml(opts.formType),
    TITLE: escapeHtml(opts.formType === 'CAREERS' ? 'New job application received' : 'New ' + opts.formType.toLowerCase() + ' submission'),
    PARTY_LABEL: escapeHtml(opts.formType === 'CAREERS' ? 'applicant' : opts.formType === 'ACADEMY' ? 'learner' : opts.formType === 'PARTNERSHIP' ? 'partner' : 'customer'),
    REFERENCE_ID: escapeHtml(opts.referenceId),
    EMAIL: escapeHtml(opts.email),
    SUBMITTED_AT: escapeHtml(opts.submittedAt),
    ROWS_HTML:
      '<ul style="margin:8px 0 0 0;padding-left:18px;font-size:12px;line-height:1.7;color:#b9b5c7;">' +
      opts.rows
        .map(function (row) {
          return (
            '<li style="margin-bottom:6px;"><strong style="color:#eee5ff;">' +
            escapeHtml(row.label) +
            ':</strong> ' +
            escapeHtml(row.value) +
            '</li>'
          )
        })
        .join('') +
      '</ul>',
  })
}

export async function ensureTables(db: D1Database) {
  await db.batch([
    db.prepare(
      'CREATE TABLE IF NOT EXISTS form_submissions (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'reference_id TEXT NOT NULL,' +
        'form_type TEXT NOT NULL,' +
        'name TEXT,' +
        'email TEXT,' +
        'payload TEXT,' +
        'verification_status TEXT,' +
        'status TEXT,' +
        'resume_key TEXT,' +
        'created_at TEXT,' +
        'verified_at TEXT' +
        ')',
    ),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS form_otps (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'email TEXT NOT NULL,' +
        'form_type TEXT NOT NULL,' +
        'draft_id TEXT,' +
        'code_hash TEXT,' +
        'payload TEXT,' +
        'expires_at INTEGER,' +
        'attempts INTEGER NOT NULL DEFAULT 0,' +
        'resends INTEGER NOT NULL DEFAULT 0,' +
        'last_sent_at INTEGER,' +
        'consumed INTEGER NOT NULL DEFAULT 0' +
        ')',
    ),
  ])
}
