/** Veriff hosted identity verification helpers. No applicant media is exposed here. */
export type VeriffEnv = {
  AVA_VERIFF_BASE_URL?: string
  AVA_VERIFF_API_KEY?: string
  AVA_VERIFF_SHARED_SECRET?: string
}

export function veriffConfigured(env:VeriffEnv):boolean {
  return Boolean(env.AVA_VERIFF_BASE_URL?.trim()&&env.AVA_VERIFF_API_KEY?.trim()&&
    (env.AVA_VERIFF_SHARED_SECRET?.trim().length||0)>=24)
}

export function veriffApiEndpoint(raw:string):string {
  const url=new URL(raw)
  const host=url.hostname.toLowerCase()
  if(url.protocol!=='https:'||url.username||url.password||
    !(['veriff.com','veriff.me'].some(domain=>host===domain||host.endsWith('.'+domain)))||
    (url.port&&url.port!=='443')||url.pathname!=='/'||url.search||url.hash)
    throw new Error('Invalid Veriff API base URL.')
  return url.origin+'/v1/sessions'
}

export function veriffHostedUrl(raw:string):string {
  const url=new URL(raw)
  const host=url.hostname.toLowerCase()
  if(url.protocol!=='https:'||url.username||url.password||
    !(['veriff.com','veriff.me'].some(domain=>host===domain||host.endsWith('.'+domain)))||
    (url.port&&url.port!=='443'))
    throw new Error('Invalid Veriff hosted verification URL.')
  return url.toString()
}

export async function hmacSha256Hex(secret:string,body:string):Promise<string> {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),
    {name:'HMAC',hash:'SHA-256'},false,['sign'])
  const signature=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body))
  return Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('')
}

export function constantTimeHexEqual(left:string,right:string):boolean {
  const a=left.trim().toLowerCase().replace(/^sha256=/,'')
  const b=right.trim().toLowerCase().replace(/^sha256=/,'')
  if(!/^[a-f0-9]{64}$/.test(a)||!/^[a-f0-9]{64}$/.test(b)||a.length!==b.length)return false
  let diff=0
  for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i)
  return diff===0
}

export function normalizeIdentityName(value:string):string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ')
}

export function createOneTimeToken(bytes=32):string {
  const data=crypto.getRandomValues(new Uint8Array(bytes))
  let binary=''
  for(const byte of data)binary+=String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
