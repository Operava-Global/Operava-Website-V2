import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const ui = source('src/pages/AvaScreening.tsx')
const css = source('src/pages/AvaScreening.css')
const api = source('functions/api/ava-screening.ts')

test('AVA uses horizontal, reduced-motion-aware stage and question transitions', () => {
  assert.match(ui, /AnimatePresence mode="wait"/)
  assert.match(ui, /ava-horizontal-scene/)
  assert.match(ui, /screen\?\.question\?\.number\|\|0/)
  assert.match(ui, /useReducedMotion\(\)/)
  assert.match(ui, /duration:reduceMotion\?0:0\.65/)
  assert.match(css, /\.ava-workspace-body\{[\s\S]*?overflow:hidden/)
  assert.match(css, /\.ava-horizontal-scene\{[\s\S]*?overflow:hidden!important/)
  assert.match(ui, /setProfilePage\(page=>Math\.min\(2,page\+1\)\)/)
  assert.match(ui, /setReadyPage\(1\)/)
})

test('One panel at a time retains all mandatory profile and consent fields', () => {
  assert.match(ui, /FORM_FIELDS\.filter/)
  assert.match(ui, /profilePage===0\?i<2:profilePage===1\?i>=2&&i<4:i===4/)
  assert.match(ui, /profile\.education\.trim\(\)\.length<10/)
  assert.match(ui, /checked=\{privacyConsent\}/)
  assert.match(ui, /checked=\{monitorConsent\}/)
  assert.match(ui, /saveProfile\(\)/)
})

test('Assessment recovery blocks questions until fresh explicit capture is restored', () => {
  assert.match(ui, /ava-proctor-reconnect/)
  assert.match(ui, /Restore assessment permissions/)
  assert.match(ui, /!proctorReady\|\|!proctorSaved\.camera\|\|!proctorSaved\.screen\|\|!isCaptureLive\(\)/)
  assert.match(ui, /onClick=\{\(\)=>void startCapture\(\)\}/)
  assert.match(ui, /if\(!recordingConsent\)/)
  assert.match(ui, /stopCapture\\(\\)[\\s\\S]*?proctorErrorMessage\\(e,'upload'\\)/)
  assert.match(ui, /recorder.requestData\\(\\)/)
})

test('API refuses cross-origin attempts, stale identity and post-deadline recordings', () => {
  assert.match(api, /Cross-origin assessment requests are not permitted/)
  assert.match(api, /Sec-Fetch-Site/)
  assert.match(api, /Identity verification must remain approved throughout the assessment/)
  assert.match(api, /Assessment time elapsed\. Recording upload has closed/)
  assert.match(api, /A live identity capture was recently started/)
  assert.match(api, /identityReviewChecksValid/)
  assert.match(api, /AVA_ID_BUCKET/)
})

test('AVA presents a one-question board instead of a character sidecar', () => {
  assert.ok(ui.includes('ava-ai-board'))
  assert.ok(ui.includes('AVA · Instructions'))
  assert.ok(ui.includes('ava-ai-message--question'))
  assert.ok(ui.includes('Submit & next question'))
  assert.ok(!ui.includes('ava-proctor-mermaid.svg'))
  assert.ok(!ui.includes('ava-proctor-dock'))
  assert.match(css, /ava-board-question-enter/)
  assert.match(css, /prefers-reduced-motion:reduce/)
})
