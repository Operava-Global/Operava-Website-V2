/**
 * Additional origin-side verification for the private Recruitment Admin workspace.
 * Cloudflare Access is the primary gate on /recruitment-admin/*.
 * Verify the signed JWT here as a defense in depth, including on preview URLs.
 * Fail closed when either required binding is absent. No reviewer key reaches JS.
 */
export interface AvaAccessEnv {
  AVA_ACCESS_AUD?: string
  AVA_ACCESS_TEAM_DOMAIN?: string
}

type Claims = { aud?: string | string[]; iss?: string; sub?: string; exp?: number; nbf?: number; email?: string }
type JwkPublic = { kid?: string; kty?: string; alg?: string; n?: string; e?: string; use?: string }
const decoder = new TextDecoder()
function decodeSegment(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}
function parseJson(value: string): Record<string, unknown> {
  return JSON.parse(decoder.decode(decodeSegment(value))) as Record<string, unknown>
}
export async function accessIdentity(request: Request, env: AvaAccessEnv): Promise<{ email: string; sub: string } | null> {
  const aud = String(env.AVA_ACCESS_AUD || '').trim()
  const domain = String(env.AVA_ACCESS_TEAM_DOMAIN || '').trim().toLowerCase()
  // Never allow an attacker to provide a certificate URL via environment contents.
  if (!aud || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)) return null
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || ''
  if (!token || token.length > 16000) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const header = parseJson(parts[0])
    const claims = parseJson(parts[1]) as Claims
    const now = Math.floor(Date.now()/1000)
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
      !claims.sub || !claims.email || !claims.exp || claims.exp <= now ||
      (typeof claims.nbf === 'number' && claims.nbf > now + 60) ||
      claims.iss !== `https://${domain}` ||
      !(Array.isArray(claims.aud) ? claims.aud.includes(aud) : claims.aud === aud)) return null
    const response = await fetch(`https://${domain}/cdn-cgi/access/certs`, { cf: { cacheTtl: 300, cacheEverything: true } })
    if (!response.ok) return null
    const certs = (await response.json()) as { keys?: JwkPublic[] }
    const matching = certs.keys?.find(key => key.kid === header.kid && key.kty === 'RSA' && key.n && key.e)
    if (!matching) return null
    const key = await crypto.subtle.importKey('jwk',
      { kty: 'RSA', n: matching.n!, e: matching.e!, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key,
      decodeSegment(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))
    return valid ? { email: claims.email.toLowerCase().slice(0,180), sub: claims.sub.slice(0,180) } : null
  } catch {
    return null
  }
}
export function blockedAdmin(): Response {
  return new Response('Restricted OPERAVA workspace. Cloudflare Access authentication is required.', {
    status: 403,
    headers: { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store',
      'Referrer-Policy':'no-referrer', 'X-Robots-Tag':'noindex, nofollow, noarchive' },
  })
}
