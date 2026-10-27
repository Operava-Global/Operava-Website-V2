import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const ui = source('src/pages/AvaScreening.tsx')
const css = source('src/pages/AvaScreening.css')
const api = source('functions/api/ava-screening.ts')
const mascot = source('public/media/ava-proctor-mermaid.svg')

test('AVA uses horizontal, reduced-motion-aware stage and question transitions', () => {
  assert.match(ui, /AnimatePresence mode="wait"/)
  assert.match(ui, /ava-horizontal-scene/)
  assert.match(ui, /screen\?\.question\?\.number\|\|0/)
  assert.match(ui, /useReducedMotion\(\)/)
  assert.match(ui, /duration:reduceMotion\?0:0\.65/)
  assert.match(css, /\.ava-workspace-body\{[\s\S]*?overflow:hidden/)
  assert.match(css, /\.ava-horizontal-scene\{[\s\S]*?overflow-y:auto/)
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
  assert.match(ui, /stopCapture\(\)[\s\S]*?A recording segment could not be stored/)
})

test('API refuses cross-origin attempts, stale identity and post-deadline recordings', () => {
  assert.match(api, /Cross-origin assessment requests are not permitted/)
  assert.match(api, /Sec-Fetch-Site/)
  assert.match(api, /Identity verification must remain approved throughout the assessment/)
  assert.match(api, /Assessment time elapsed\. Recording upload has closed/)
  assert.match(api, /A verification link was recently requested/)
  assert.match(api, /subject:\{name:legalName\}/)
  assert.match(api, /AVA_IDV_WEBHOOK_SECRET/)
})

test('AVA proctor illustration is accessible and honors reduced motion', () => {
  assert.match(mascot, /animated assessment guide/)
  assert.match(mascot, /id="tail"/)
  assert.match(mascot, /ava-tail-sway/)
  assert.match(mascot, /prefers-reduced-motion:reduce/)
  assert.match(ui, /ava-proctor-mermaid\.svg/)
})
