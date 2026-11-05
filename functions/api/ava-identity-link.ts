/**
 * One-time email link landing page for the Veriff-hosted mobile identity flow.
 * GET never consumes the token (email security scanners often prefetch links).
 * A deliberate same-origin POST consumes it exactly once and redirects to Veriff.
 */
import { veriffHostedUrl } from '../lib/avaVeriff'

type Env={SUBMISSIONS_DB?:D1Database}
type LinkRow={session_id:string;provider_url:string|null;link_token_hash:string|null;
  link_expires_at:number|null;link_used_at:number|null}
const headers={
  'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, max-age=0',
  'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY','X-Robots-Tag':'noindex, nofollow, noarchive',
  'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
}
function page(title:string,message:string,form=''):Response {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | OPERAVA</title><body style="margin:0;background:#f7f5fa;color:#22212a;font:16px/1.6 Inter,Arial,sans-serif"><main style="max-width:520px;margin:10vh auto;padding:32px 26px;background:white;border:1px solid #e8e2ef;border-radius:20px;box-shadow:0 18px 55px #24102b12"><p style="color:#a000f0;font-weight:700;letter-spacing:.12em;font-size:12px">OPERAVA · SECURE IDENTITY CHECK</p><h1 style="font-size:25px;line-height:1.2">${title}</h1><p>${message}</p>${form}<p style="color:#716d78;font-size:13px">If you did not request this verification, close this page and contact OPERAVA Talent Acquisition.</p></main></body></html>`,{status:200,headers})
}
function expired():Response {
  return new Response('This secure verification link is expired or has already been used. Return to the OPERAVA applicant portal and request a new link.',{
    status:410,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}})
}
async function hash(token:string):Promise<string>{
  const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')
}
async function lookup(db:D1Database,token:string):Promise<LinkRow|null>{
  if(!/^[A-Za-z0-9_-]{35,60}$/.test(token))return null
  return db.prepare(`SELECT session_id,provider_url,link_token_hash,link_expires_at,link_used_at
    FROM ava_screening_identity_intents WHERE link_token_hash=?`)
    .bind(await hash(token)).first<LinkRow>()
}
export const onRequestGet:PagesFunction<Env> = async ({request,env})=>{
  if(!env.SUBMISSIONS_DB)return expired()
  const token=new URL(request.url).searchParams.get('token')||''
  const row=await lookup(env.SUBMISSIONS_DB,token)
  if(!row||!row.provider_url||!row.link_expires_at||row.link_expires_at<=Date.now()||row.link_used_at)
    return expired()
  // Do not consume on GET. Mail security scanners commonly prefetch links.
  const form=`<form method="post" action="/api/ava-identity-link"><input type="hidden" name="token" value="${token}"><button type="submit" style="width:100%;margin:16px 0;padding:15px;border:0;border-radius:12px;background:#a000f0;color:white;font-weight:700;font-size:16px;cursor:pointer">Continue to live ID verification</button></form>`
  return page('Continue on your phone','You are opening a private, single-use OPERAVA identity link. Continue only on the phone you will use to photograph your government ID and complete the live selfie check. The link expires 15 minutes after it was issued.',form)
}
export const onRequestPost:PagesFunction<Env> = async ({request,env})=>{
  if(!env.SUBMISSIONS_DB)return expired()
  const url=new URL(request.url)
  if(request.headers.get('Origin')!==url.origin||
    !request.headers.get('Content-Type')?.toLowerCase().startsWith('application/x-www-form-urlencoded'))
    return new Response('Invalid secure-link submission.',{status:403,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}})
  let token=''
  try{token=String((await request.formData()).get('token')||'')}catch{return expired()}
  const row=await lookup(env.SUBMISSIONS_DB,token)
  if(!row||!row.provider_url||!row.link_expires_at||row.link_expires_at<=Date.now()||row.link_used_at)
    return expired()
  let destination=''
  try{destination=veriffHostedUrl(row.provider_url)}catch{return expired()}
  const consumed=await env.SUBMISSIONS_DB.prepare(`UPDATE ava_screening_identity_intents
    SET link_used_at=?,link_token_hash=NULL
    WHERE session_id=? AND link_token_hash=? AND link_used_at IS NULL AND link_expires_at>?`)
    .bind(Date.now(),row.session_id,await hash(token),Date.now()).run()
  if(!consumed.meta.changes)return expired()
  return new Response(null,{status:303,headers:{'Location':destination,'Cache-Control':'no-store',
    'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}})
}
