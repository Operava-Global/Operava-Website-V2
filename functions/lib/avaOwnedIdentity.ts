/** OPERAVA-owned identity capture primitives; no third-party verifier. */
export const OWNED_ID_TTL_MS=10*60_000
export const OWNED_ID_MAX_BYTES=2_500_000
export const ownedIdentityAccepted=(status:unknown):boolean=>status==='verified'||status==='manual_verified'
export const validOwnedDocumentType=(value:unknown):value is 'passport'|'national_id'|'drivers_license'=>
  value==='passport'||value==='national_id'||value==='drivers_license'

/** Live camera evidence can be visually inspected; JPEG bytes do not prove liveness. */
export async function validateCameraJpeg(input:FormDataEntryValue|null,label:string):Promise<Uint8Array> {
  if(!(input instanceof File)||input.type!=='image/jpeg'||input.size<8_000||input.size>OWNED_ID_MAX_BYTES)
    throw new Error(`INVALID_${label.toUpperCase()}`)
  const data=new Uint8Array(await input.arrayBuffer())
  if(data.length<8_000||data[0]!==0xff||data[1]!==0xd8||
    data[data.length-2]!==0xff||data[data.length-1]!==0xd9)
    throw new Error(`INVALID_${label.toUpperCase()}`)
  return data
}
export const identityReviewChecksValid=(value:unknown):boolean=>{
  if(!value||typeof value!=='object'||Array.isArray(value))return false
  const checks=value as Record<string,unknown>
  return checks.documentReadable===true&&checks.nameMatches===true&&
    checks.faceVisuallyConsistent===true&&checks.motionReviewed===true
}
