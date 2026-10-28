/** Browser-native proctor capture utilities. No SDK can override device permissions. */
export type ProctorSupport = {
  secure:boolean
  camera:boolean
  screen:boolean
  recorder:boolean
  microphonePolicy:boolean
  cameraPolicy:boolean
  screenPolicy:boolean
  compatible:boolean
}
const policyPermits=(feature:string):boolean=>{
  const doc=document as Document&{
    permissionsPolicy?:{allowsFeature:(feature:string)=>boolean}
    featurePolicy?:{allowsFeature:(feature:string)=>boolean}
  }
  try {return (doc.permissionsPolicy||doc.featurePolicy)?.allowsFeature(feature)!==false}
  catch{return true}
}
export function inspectProctorSupport():ProctorSupport {
  const secure=window.isSecureContext
  const camera=Boolean(navigator.mediaDevices?.getUserMedia)
  const screen=Boolean(navigator.mediaDevices?.getDisplayMedia)
  const recorder=typeof MediaRecorder!=='undefined'
  const cameraPolicy=policyPermits('camera')
  const microphonePolicy=policyPermits('microphone')
  const screenPolicy=policyPermits('display-capture')
  return {secure,camera,screen,recorder,cameraPolicy,microphonePolicy,screenPolicy,
    compatible:secure&&camera&&screen&&recorder&&cameraPolicy&&microphonePolicy&&screenPolicy}
}
export function proctorErrorMessage(error:unknown,source:'screen'|'camera'|'recorder'|'upload'):string {
  const name=error&&typeof error==='object'&&'name' in error?String((error as {name:unknown}).name):''
  if(source==='screen'&&(name==='NotAllowedError'||name==='PermissionDeniedError'))
    return 'Screen sharing was cancelled or denied. Use a supported browser, select the entire screen in the browser picker, then choose Share. Verify Screen Recording permissions in your operating system.'
  if(source==='screen'&&(name==='NotSupportedError'||name==='TypeError'||name==='SecurityError'))
    return 'This browser cannot share the entire display. Open AVA directly in a current desktop Chrome, Edge, Firefox or Safari. The browser must support getDisplayMedia.'
  if(source==='camera'&&(name==='NotAllowedError'||name==='PermissionDeniedError'||name==='SecurityError'))
    return 'Camera or microphone permission was denied. Allow both in browser site settings and in the operating-system privacy settings, then retry.'
  if(source==='camera'&&(name==='NotFoundError'||name==='DevicesNotFoundError'))
    return 'No working webcam or microphone was found. Connect both devices or enable them in system settings.'
  if(source==='camera'&&(name==='NotReadableError'||name==='TrackStartError'))
    return 'The webcam or microphone is occupied by another app. Close other video meetings and retry.'
  if(source==='recorder'&&(name==='NotSupportedError'||name==='TypeError'))
    return 'This browser cannot encode the required private video recordings. Update to a current desktop Chrome, Edge, Firefox or Safari.'
  if(error instanceof Error&&error.message)return error.message
  if(source==='upload')return 'The private recording upload failed. Reconnect and try again before continuing.'
  return 'Media capture failed. Check browser and operating-system permissions, then retry.'
}
export function proctorTrackIsLive(stream:MediaStream|null|undefined,kind:'video'|'audio'):boolean {
  if(!stream)return false
  const tracks=kind==='video'?stream.getVideoTracks():stream.getAudioTracks()
  return tracks.length>0&&tracks.every(t=>t.readyState==='live'&&t.enabled&&!t.muted)
}
export function createProctorRecorder(stream:MediaStream,kind:'screen'|'camera'):MediaRecorder {
  if(typeof MediaRecorder==='undefined')throw new Error('MediaRecorder unavailable')
  // A display stream normally has no audio: don't require an Opus audio codec.
  const options=kind==='screen'
    ?['video/webm;codecs=vp8','video/webm','video/mp4']
    :['video/webm;codecs=vp8,opus','video/webm','video/mp4']
  const mime=options.find(value=>MediaRecorder.isTypeSupported(value))
  const recordingOptions:MediaRecorderOptions={videoBitsPerSecond:430_000}
  if(mime)recordingOptions.mimeType=mime
  return new MediaRecorder(stream,recordingOptions)
}
