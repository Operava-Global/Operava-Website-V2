import { onRequestPost as handleAva } from '../api/ava-screening'
import { accessIdentity, blockedAdmin, type AvaAccessEnv } from '../lib/avaAccess'

type Env = AvaAccessEnv & {
  AVA_REVIEWER_SECRET?: string
  SUBMISSIONS_DB?: D1Database
}
// No shared reviewer secret, Access audience, or sensitive candidate data is
// exposed to React. All reviewer actions go through this origin-only proxy.
const ACTIONS = new Set(['invite','invitations','publicApplicants','pendingReviews','identityDocument','reviewIdentity',
  'screeningResults','screeningDetail','reviewScreening'])
export const onRequestPost: PagesFunction<Env> = async context => {
  const { request, env } = context
  const principal = await accessIdentity(request, env)
  if (!principal) return blockedAdmin()
  if (!env.AVA_REVIEWER_SECRET || env.AVA_REVIEWER_SECRET.length < 32) {
    return new Response(JSON.stringify({error:'Recruitment Admin is not configured.'}), {
      status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
  }
  // Same-origin JSON only, to prevent cross-site form submission with an Access cookie.
  const url = new URL(request.url)
  const origin = request.headers.get('Origin')
  if (origin !== url.origin || !request.headers.get('Content-Type')?.startsWith('application/json')) {
    return new Response(JSON.stringify({error:'Invalid request origin or content type.'}),{
      status:403,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
  }
  const raw = await request.clone().text()
  if (raw.length > 15000) return new Response('Request too large.',{status:413})
  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw) as Record<string,unknown>
  } catch { return new Response('Invalid JSON.', {status:400}) }
  if (!body || !ACTIONS.has(String(body.action || ''))) {
    return new Response(JSON.stringify({error:'Unsupported reviewer operation.'}),{
      status:403,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
  }
  // Pass the secret to the existing authoritative, permission-checked Ava API in memory.
  // Never include it in an HTTP response or browser-delivered asset.
  const headers = new Headers(request.headers)
  headers.set('X-AVA-Reviewer-Key', env.AVA_REVIEWER_SECRET)
  headers.set('X-AVA-Reviewer-Identity', principal.email)
  headers.delete('X-AVA-Deletion-Key')
  const internal = new Request(request, { headers })
  const response = await handleAva({ ...context, request: internal } as Parameters<typeof handleAva>[0])
  const resultHeaders = new Headers(response.headers)
  resultHeaders.set('Cache-Control','no-store')
  resultHeaders.set('Referrer-Policy','no-referrer')
  resultHeaders.set('X-Content-Type-Options','nosniff')
  return new Response(response.body, {status:response.status,headers:resultHeaders})
}
