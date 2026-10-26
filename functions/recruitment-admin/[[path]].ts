import { accessIdentity, blockedAdmin, type AvaAccessEnv } from '../lib/avaAccess'

type Env = AvaAccessEnv & { ASSETS: { fetch(request: Request): Promise<Response> } }
/**
 * Protected SPA entry. This route is private even on an unprotected preview
 * hostname: without a valid Access JWT, never return the HTML application.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!await accessIdentity(request, env)) return blockedAdmin()
  const target = new URL('/index.html', request.url)
  const page = await env.ASSETS.fetch(new Request(target.toString(), { method: 'GET' }))
  const headers = new Headers(page.headers)
  headers.set('Cache-Control', 'no-store')
  headers.set('Referrer-Policy', 'no-referrer')
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return new Response(page.body, { status: page.status, headers })
}
