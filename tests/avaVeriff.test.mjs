import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import {
  constantTimeHexEqual, createOneTimeToken, hmacSha256Hex,
  normalizeIdentityName, veriffApiEndpoint, veriffConfigured, veriffHostedUrl,
} from '../functions/lib/avaVeriff.ts'

test('Veriff tenant endpoints require secure public HTTPS hosts and expected paths',()=>{
  assert.equal(veriffApiEndpoint('https://stationapi.veriff.com/'),'https://stationapi.veriff.com/v1/sessions')
  assert.equal(veriffApiEndpoint('https://tenant-api.example.com/v1'),'https://tenant-api.example.com/v1/sessions')
  assert.equal(veriffHostedUrl('https://magic.veriff.me/v/one-time-token'),'https://magic.veriff.me/v/one-time-token')
  assert.equal(veriffHostedUrl('https://tenant.example.com/v/session-token'),'https://tenant.example.com/v/session-token')
  assert.throws(()=>veriffApiEndpoint('http://stationapi.veriff.com/'))
  assert.throws(()=>veriffApiEndpoint('https://localhost/'))
  assert.throws(()=>veriffApiEndpoint('https://127.0.0.1/'))
  assert.throws(()=>veriffApiEndpoint('https://user@tenant-api.example.com/'))
  assert.throws(()=>veriffApiEndpoint('https://tenant-api.example.com/unexpected'))
  assert.throws(()=>veriffHostedUrl('https://attacker.invalid/redirect'))
  assert.throws(()=>veriffHostedUrl('http://tenant.example.com/v/session-token'))
})

test('Veriff integration is fail-closed until all credentials are present',()=>{
  assert.equal(veriffConfigured({AVA_VERIFF_BASE_URL:'https://stationapi.veriff.com',AVA_VERIFF_API_KEY:'test-api-key-123',AVA_VERIFF_SHARED_SECRET:'short'}),false)
  assert.equal(veriffConfigured({AVA_VERIFF_BASE_URL:'https://stationapi.veriff.com',AVA_VERIFF_API_KEY:'test-api-key-123',AVA_VERIFF_SHARED_SECRET:'a'.repeat(32)}),true)
})

test('HMAC signature matches the raw payload and compares safely',async()=>{
  const body='{"verification":{"id":"test"}}'
  const secret='veriff-test-secret'
  const expected=createHmac('sha256',secret).update(body).digest('hex')
  assert.equal(await hmacSha256Hex(secret,body),expected)
  assert.equal(constantTimeHexEqual(expected,expected.toUpperCase()),true)
  assert.equal(constantTimeHexEqual(expected,'0'.repeat(64)),false)
  assert.equal(constantTimeHexEqual('sha256='+expected,expected),true)
})

test('identity-name comparison is whitespace and case normalized',()=>{
  assert.equal(normalizeIdentityName('  JANE   DOE '),'jane doe')
  assert.equal(normalizeIdentityName('José María'),'josé maría')
})

test('one-time link tokens are high entropy URL-safe strings',()=>{
  const first=createOneTimeToken(32),second=createOneTimeToken(32)
  assert.match(first,/^[A-Za-z0-9_-]{43}$/)
  assert.notEqual(first,second)
})
