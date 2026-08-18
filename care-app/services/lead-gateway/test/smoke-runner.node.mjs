import assert from 'node:assert/strict'
import test from 'node:test'

import { runSyntheticSmoke } from '../src/smoke-runner.mjs'

function response(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() { return body },
  }
}

test('synthetic smoke verifies create and recovery then purges through direct storage', async () => {
  const requests = []
  const storageCalls = []
  const logs = []
  const fetchImpl = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) })
    if (url.endsWith('/v1/leads')) {
      return response(201, { ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'token-valid' })
    }
    if (requests.length === 2) {
      return response(200, { ok: true, plan_summary: 'SYNTHETIC TEST ONLY - no real patient or health data' })
    }
    return response(404, { ok: false, error: 'not_found' })
  }
  const storage = async (...args) => {
    storageCalls.push(args)
    return { ok: true }
  }

  const result = await runSyntheticSmoke({
    gateway: 'https://example.test',
    fetchImpl,
    storage,
    randomUUID: () => '11111111-1111-4111-8111-111111111111',
    now: () => new Date('2026-08-18T04:00:00.000Z'),
    log: (value) => logs.push(value),
  })

  assert.equal(result.ok, true)
  assert.deepEqual(result.checks, ['create', 'recover', 'wrong_token_rejected', 'purged'])
  assert.equal(requests[0].body.phone, '0800000000')
  assert.equal(storageCalls.length, 1)
  assert.equal(storageCalls[0][0], 'purgeLead')
  assert.deepEqual(storageCalls[0][1], {
    lead_code: 'CN-2345-6789-ABCD-EFGH',
    actor_type: 'system',
    reason_code: 'synthetic_smoke_cleanup',
  })
  assert.doesNotMatch(JSON.stringify(logs), /0800000000|ทดสอบระบบ|SYNTHETIC TEST ONLY/)
})

test('synthetic smoke still purges when recovery verification fails', async () => {
  const storageCalls = []
  let requestCount = 0
  const fetchImpl = async () => {
    requestCount += 1
    if (requestCount === 1) {
      return response(201, { ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'token-valid' })
    }
    return response(503, { ok: false, error: 'storage_unavailable' })
  }

  await assert.rejects(
    runSyntheticSmoke({
      gateway: 'https://example.test',
      fetchImpl,
      storage: async (...args) => { storageCalls.push(args); return { ok: true } },
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
      now: () => new Date('2026-08-18T04:00:00.000Z'),
      log: () => {},
    }),
    /synthetic_recovery_failed/,
  )

  assert.equal(storageCalls.length, 1)
  assert.equal(storageCalls[0][0], 'purgeLead')
})
