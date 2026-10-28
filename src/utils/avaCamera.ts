/**
 * AVA camera availability checks and safe permission diagnostics.
 * PermissionStatus is only advisory; a live, unmuted MediaStream + a decoded
 * video frame are required before a candidate may capture a photo.
 */
export type CameraPermission = 'granted'|'prompt'|'denied'|'unknown'
export type CameraCheck = {
  secureContext:boolean
  available:boolean
  policyAllowed:boolean
  permission:CameraPermission
  hasVideoInput:boolean|null
}
export function cameraIsLive(stream:MediaStream|null):boolean {
  return Boolean(stream?.getVideoTracks().some(track=>
    track.readyState==='live' && track.enabled && !track.muted))
}
export async function inspectCameraBrowser():Promise<CameraCheck> {
  const secureContext=window.isSecureContext
  const available=Boolean(navigator.mediaDevices?.getUserMedia)
  // Permissions Policy support is inconsistent across browsers; undefined
  // means "unknown", not "denied".
  const doc=document as Document & {
    permissionsPolicy?:{allowsFeature:(feature:string)=>boolean}
    featurePolicy?:{allowsFeature:(feature:string)=>boolean}
  }
  const policy=doc.permissionsPolicy||doc.featurePolicy
  let policyAllowed=true
  try {if(policy)policyAllowed=policy.allowsFeature('camera')}
  catch { /* unsupported policy API: do not claim denial */ }
  let permission:CameraPermission='unknown'
  try {
    if(navigator.permissions?.query){
      const status=await navigator.permissions.query({name:'camera' as PermissionName})
      if(status.state==='granted'||status.state==='prompt'||status.state==='denied')
        permission=status.state
    }
  }catch { /* Safari and Firefox can omit camera permission queries. */ }
  let hasVideoInput:boolean|null=null
  try{
    if(navigator.mediaDevices?.enumerateDevices){
      const devices=await navigator.mediaDevices.enumerateDevices()
      // Pre-consent enumeration can hide devices. Zero is not a conclusive
      // absence until a real getUserMedia attempt fails.
      if(devices.some(d=>d.kind==='videoinput'))hasVideoInput=true
    }
  }catch { /* no device inventory access before consent */ }
  return {secureContext,available,policyAllowed,permission,hasVideoInput}
}
export function cameraErrorMessage(error:unknown):string {
  const name=error instanceof DOMException ? error.name :
    error&&typeof error==='object'&&'name' in error ? String((error as {name:unknown}).name) : ''
  if(name==='NotAllowedError'||name==='PermissionDeniedError'||name==='SecurityError')
    return 'Camera access was blocked. In your browser address-bar site settings, allow Camera for this website; also check your device privacy settings, then return and select Enable camera again.'
  if(name==='NotFoundError'||name==='DevicesNotFoundError')
    return 'No camera was found. Connect or enable a camera in your device settings, then retry.'
  if(name==='NotReadableError'||name==='TrackStartError')
    return 'The camera is busy or unavailable. Close other video apps, check system camera permissions, and retry.'
  if(name==='OverconstrainedError'||name==='ConstraintNotSatisfiedError')
    return 'The requested camera is unavailable. Try a different camera or device.'
  if(name==='AbortError')
    return 'Camera startup was interrupted. Try Enable camera again.'
  if(name==='NotSupportedError')
    return 'Your browser cannot play the live camera preview. Update Safari, Chrome, Firefox or Edge and try again.'
  if(error instanceof Error&&error.message)return error.message
  return 'Unable to open camera. Check this site’s Camera permission and try again.'
}
export async function requestIdentityCamera(facing:'environment'|'user'):Promise<MediaStream> {
  if(!window.isSecureContext)throw Error('The camera requires HTTPS. Open the secure OPERAVA applicant portal directly.')
  if(!navigator.mediaDevices?.getUserMedia)
    throw Error('Camera capture is not supported in this browser. Update Safari, Chrome, Firefox or Edge, or open the site outside an embedded app.')
  try{
    return await navigator.mediaDevices.getUserMedia({
      audio:false,
      video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720}}
    })
  }catch(error){
    const name=error&&typeof error==='object'&&'name' in error ? String((error as {name:unknown}).name) : ''
    // Old browsers and unusual cameras may not implement constraints.
    if(name==='OverconstrainedError'||name==='ConstraintNotSatisfiedError'||name==='TypeError')
      return navigator.mediaDevices.getUserMedia({video:true,audio:false})
    throw error
  }
}
