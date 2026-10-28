import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const read = path=>readFileSync(new URL('../'+path,import.meta.url),'utf8')
const headers=read('public/_headers')
const ui=read('src/pages/AvaScreening.tsx')
const helpers=read('src/utils/avaCamera.ts')
const styles=read('src/pages/AvaScreening.css')

test('Camera and mic remain globally denied but are permitted on both AVA URL aliases',()=>{
  assert.match(headers,/\/\*\s+X-Frame-Options:[\s\S]*?Permissions-Policy: camera=\(\), microphone=\(\)/)
  for(const route of ['/ava-screening/*','/ava-screening','/applicant-portal/*','/applicant-portal']){
    const entry=headers.split('\n'+route+'\n')[1]
    assert.ok(entry,route+' must have explicit override')
    assert.ok(entry.startsWith('  ! Permissions-Policy\n  Permissions-Policy: camera=(self), microphone=(self), geolocation=()'))
    assert.match(entry,/  Cache-Control: no-store/)
  }
})

test('Camera support detects secure context, feature policy, permission states and device metadata',()=>{
  assert.match(helpers,/window\.isSecureContext/)
  assert.match(helpers,/navigator\.permissions\.query/)
  assert.match(helpers,/navigator\.mediaDevices\.enumerateDevices/)
  assert.match(helpers,/permissionsPolicy\|\|doc\.featurePolicy/)
  assert.match(helpers,/name==='OverconstrainedError'/)
  assert.match(helpers,/getUserMedia\(\{video:true,audio:false\}\)/)
  assert.match(helpers,/NotAllowedError/)
  assert.match(helpers,/NotReadableError/)
})

test('Identity camera permission request follows direct click without prior server await',()=>{
  const start=ui.slice(ui.indexOf('const startIdentityCamera=async'),ui.indexOf('const captureIdentity=async'))
  assert.match(start,/stream=await requestIdentityCamera\(facing\)/)
  assert.match(ui,/onClick=\{\(\)=>void startIdentityCamera\(identityStep===0\?'environment':'user'\)\}/)
  const challenge=ui.slice(ui.indexOf('const requestIdentity=async'),ui.indexOf('const captureIdentity=async'))
  assert.doesNotMatch(challenge.slice(0,challenge.indexOf('const startIdentityCamera')>0?challenge.indexOf('const startIdentityCamera'):undefined),/await startIdentityCamera/)
})

test('Camera availability does not auto-advance: live frame and capture gate next step',()=>{
  assert.match(helpers,/track\.readyState==='live' && track\.enabled && !track\.muted/)
  assert.match(ui,/if\(!cameraIsLive\(stream\)\|\|video\.videoWidth<160/)
  assert.match(ui,/if\(identityCameraStatus!=='ready'\|\|!cameraIsLive\(identityStream\.current\)\)/)
  assert.match(ui,/identityCameraStatus!=='ready'\|\|!cameraIsLive\(identityStream\.current\)/)
  assert.match(ui,/stopIdentityCamera\(\)\s+setIdentityStep\(1\)/)
  assert.match(ui,/setIdentityStep\(2\)/)
  assert.match(ui,/setIdentityStep\(3\)/)
  assert.match(ui,/identityCameraGeneration\.current\+=1/)
  assert.match(ui,/Capture turned selfie & review/)
  assert.match(ui,/Camera is active ✓/)
  assert.match(styles,/ava-camera-preview/)
})

test('Camera teardown, denial guidance and review-only submission persist',()=>{
  assert.match(ui,/stopIdentityCamera\(\)\s+setIdentityChallenge\(null\)/)
  assert.match(ui,/The stored images automatically expire after 30 days/)
  assert.match(ui,/Submit identity for human verification/)
  assert.match(ui,/Browser camera API supported/)
  assert.match(ui,/Camera access confirmed with a live preview/)
  assert.match(helpers,/browser address-bar site settings/)
  assert.match(helpers,/Update Safari, Chrome, Firefox or Edge/)
})
