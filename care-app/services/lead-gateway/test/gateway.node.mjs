import assert from 'node:assert/strict'
import test from 'node:test'
import { once } from 'node:events'

import { createLeadGateway } from '../src/server.mjs'

const createPayload = {
  schema_version: 1,
  request_id: '06f243c5-1ca8-489f-95f5-fc528ef99891',
  contact_name: 'สมชาย',
  phone: '0812345678',
  service_area: 'บางแสน',
  plan_type: 'walk-confidence',
  plan_summary: 'สรุปแผน',
  consent_version: 'lead-temp-v1',
  consented_at: '2026-08-11T08:00:00.000Z',
  app_version: 'beta',
}

async function withServer(options, callback) {
  const server = createLeadGateway(options)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  try {
    await callback(`http://127.0.0.1:${port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('health check exposes no dependency details', async () => {
  await withServer({ storageClient: async () => ({ ok: true }) }, async (base) => {
    const response = await fetch(`${base}/healthz`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true })
  })
})

test('create accepts exact production origin and returns opaque recovery values', async () => {
  const calls = []
  await withServer({
    tokenBytes: () => Buffer.alloc(32, 7),
    storageClient: async (action, payload) => {
      calls.push({ action, payload })
      return { ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', expires_at: '2026-08-25T08:00:00.000Z', duplicate: calls.length > 1 }
    },
  }, async (base) => {
    const response = await fetch(`${base}/v1/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://baankaiyaphap-chonburi.com' },
      body: JSON.stringify(createPayload),
    })
    assert.equal(response.status, 201)
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://baankaiyaphap-chonburi.com')
    const body = await response.json()
    assert.deepEqual(Object.keys(body).sort(), ['expires_at', 'lead_code', 'ok', 'recovery_token'].sort())
    assert.equal(calls[0].action, 'createLead')
    assert.equal(calls[0].payload.recovery_token, body.recovery_token)
    assert.equal(calls[0].payload.source, 'care-navigator')
    const retry = await fetch(`${base}/v1/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://baankaiyaphap-chonburi.com' },
      body: JSON.stringify(createPayload),
    })
    assert.equal(retry.status, 200)
    assert.equal((await retry.json()).recovery_token, body.recovery_token)
  })
})

test('rejects disallowed origins, content types, fields, and oversized bodies', async () => {
  await withServer({ storageClient: async () => ({ ok: true }) }, async (base) => {
    const badOrigin = await fetch(`${base}/v1/leads`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example' }, body: JSON.stringify(createPayload) })
    assert.equal(badOrigin.status, 403)
    const badType = await fetch(`${base}/v1/leads`, { method: 'POST', headers: { 'content-type': 'text/plain', origin: 'http://localhost:3000' }, body: '{}' })
    assert.equal(badType.status, 415)
    const unknown = await fetch(`${base}/v1/leads`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3001' }, body: JSON.stringify({ ...createPayload, latitude: 13.3 }) })
    assert.equal(unknown.status, 400)
    const tooLarge = await fetch(`${base}/v1/leads`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' }, body: JSON.stringify({ ...createPayload, plan_summary: 'x'.repeat(17000) }) })
    assert.equal(tooLarge.status, 413)
  })
})

test('recovers only plan data and converts storage outages to 503', async () => {
  let unavailable = false
  await withServer({
    storageClient: async (action) => {
      if (unavailable) throw new Error('sheet payload should never be logged')
      assert.equal(action, 'recoverPlan')
      return { ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', plan_type: 'walk-confidence', plan_summary: 'summary', expires_at: '2026-08-25T08:00:00.000Z' }
    },
  }, async (base) => {
    const headers = { 'content-type': 'application/json', origin: 'http://localhost:3018' }
    const good = await fetch(`${base}/v1/leads/recover`, { method: 'POST', headers, body: JSON.stringify({ lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'token_value_long_enough_1234567890' }) })
    assert.equal(good.status, 200)
    assert.equal((await good.json()).phone, undefined)
    unavailable = true
    const down = await fetch(`${base}/v1/leads/recover`, { method: 'POST', headers, body: JSON.stringify({ lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'token_value_long_enough_1234567890' }) })
    assert.equal(down.status, 503)
  })
})

test('logs result metadata only and applies a coarse rate cap', async () => {
  const logs = []
  await withServer({
    logger: { info: (value) => logs.push(JSON.stringify(value)), error: (value) => logs.push(JSON.stringify(value)) },
    rateLimit: { max: 1, windowMs: 60000 },
    storageClient: async () => ({ ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', expires_at: '2026-08-25T08:00:00.000Z' }),
  }, async (base) => {
    const options = { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' }, body: JSON.stringify(createPayload) }
    assert.equal((await fetch(`${base}/v1/leads`, options)).status, 201)
    assert.equal((await fetch(`${base}/v1/leads`, options)).status, 429)
  })
  const output = logs.join('\n')
  assert.doesNotMatch(output, /สมชาย|0812345678|บางแสน|สรุปแผน/)
})
