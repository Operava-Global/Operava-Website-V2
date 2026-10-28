import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createProctorRecorder, proctorErrorMessage, proctorTrackIsLive } from '../src/utils/avaProctorMedia.ts'

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const ui=read('src/pages/AvaScreening.tsx')
const api=read('functions/api/ava-screening.ts')
const css=read('src/pages/AvaScreening.css')

test('Native device-camera fallback retains private human identity approval',()=>{
  assert.match(ui,/captureNativeIdentityFile=async/)
  assert.match(ui,/type="file" accept="image\/\*" capture=/)
  assert.match(ui,/Use device camera instead/)
  assert.match(ui,/form.set\('captureMethod',identityCaptureMode\)/)
  assert.match(api,/captureMethod=form.get\('captureMethod'\)/)
  assert.match(api,/captureMethod:String\(captureMethod\)/)
  assert.match(ui,/canvas.toBlob\(blob=>/)
  assert.match(ui,/Submit identity for human verification/)
  assert.match(css,/ava-native-capture/)
})

test('Screen sharing starts with a separate direct user gesture after live camera and microphone permission',()=>{
  const prepare=ui.slice(ui.indexOf('const prepareProctorCamera=async'),ui.indexOf('const startCapture = async'))
  const start=ui.slice(ui.indexOf('const startCapture = async'),ui.indexOf('const beginAssessment = async'))
  assert.match(prepare,/getUserMedia\(\{video:/)
  assert.match(prepare,/proctorTrackIsLive\(camera,'audio'\)/)
  assert.match(start,/display=await navigator.mediaDevices.getDisplayMedia\(\{video:true,audio:false\}\)/)
  assert.ok(start.indexOf('display=await navigator.mediaDevices.getDisplayMedia')<start.indexOf("await submit('proctorConsent'"))
  assert.match(ui,/1 · Enable webcam & microphone/)
  assert.match(ui,/2 · Share entire screen & record/)
  assert.match(ui,/proctorSupport\?\.compatible/)
  assert.match(ui,/screen\?\.verifiedApplicantProfile/)
  assert.match(api,/action === 'proctorConsent'/)
  assert.match(api,/action === 'proctorChunk'/)
})

test('Media recorder watchdog recovers delayed browser chunks without bypassing private evidence storage',()=>{
  assert.match(ui,/recorder.start\(8000\)/)
  assert.match(ui,/recorder.requestData\(\)/)
  assert.match(ui,/proctorWatchdog.current=window.setInterval/)
  assert.match(ui,/stopCapture\(\)/)
  assert.match(ui,/proctorSaved.camera/)
  assert.match(ui,/proctorSaved.screen/)
  assert.match(api,/AVA_PROCTOR_BUCKET.put/)
})

test('Proctor capture mode detects actual tracks and chooses screen-only compatible encoding',()=>{
  const previous=globalThis.MediaRecorder
  class TestRecorder {
    static isTypeSupported(value){return value==='video/webm;codecs=vp8'||value==='video/webm;codecs=vp8,opus'}
    constructor(stream,options){this.options=options;this.stream=stream}
  }
  globalThis.MediaRecorder=TestRecorder
  try{
    const fake={getVideoTracks:()=>[{readyState:'live',enabled:true,muted:false}],getAudioTracks:()=>[]}
    assert.equal(proctorTrackIsLive(fake,'video'),true)
    assert.equal(proctorTrackIsLive(fake,'audio'),false)
    assert.equal(createProctorRecorder(fake,'screen').options.mimeType,'video/webm;codecs=vp8')
    assert.equal(createProctorRecorder(fake,'camera').options.mimeType,'video/webm;codecs=vp8,opus')
  }finally{globalThis.MediaRecorder=previous}
})

test('Denied capture provides specific and actionable recovery instructions',()=>{
  assert.match(proctorErrorMessage({name:'NotAllowedError'},'camera'),/microphone permission was denied/)
  assert.match(proctorErrorMessage({name:'NotAllowedError'},'screen'),/Screen sharing was cancelled or denied/)
  assert.match(proctorErrorMessage({name:'NotSupportedError'},'screen'),/browser cannot share/)
})
