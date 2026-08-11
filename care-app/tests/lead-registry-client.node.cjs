const assert = require('node:assert/strict')

const { createClient, STORAGE_KEY } = require('../public/js/lead-registry-client.js')

function makeStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  }
}

const payload = {
  contact_name: 'สมชาย',
  phone: '0812345678',
  service_area: 'บางแสน',
  plan_type: 'walk-confidence',
  plan_summary: 'สรุปแผน',
}

async function run() {
  const storage = makeStorage()
  const requests = []
  const copied = []
  const client = createClient({
    endpoint: 'https://example.test/care-navigator-api/v1',
    appVersion: 'beta',
    storage,
    uuid: () => '06f243c5-1ca8-489f-95f5-fc528ef99891',
    now: () => new Date('2026-08-11T08:00:00.000Z'),
    fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) })
      return { ok: true, status: 201, json: async () => ({ ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'resume_token_value_12345678901234567890', expires_at: '2026-08-25T08:00:00.000Z' }) }
    },
    clipboard: { writeText: async (value) => copied.push(value) },
    planPath: () => '/care-navigator/team4-walk-confidence-mockup.html',
  })

  const created = await client.createLead(payload)
  assert.equal(created.ok, true)
  assert.equal(requests[0].url, 'https://example.test/care-navigator-api/v1/leads')
  assert.equal(requests[0].body.schema_version, 1)
  assert.equal(requests[0].body.consent_version, 'lead-temp-v1')
  const saved = JSON.parse(storage.getItem(STORAGE_KEY))
  assert.deepEqual(Object.keys(saved).sort(), ['expiresAt', 'leadCode', 'planPath', 'planType', 'recoveryToken'].sort())
  const serialized = storage.getItem(STORAGE_KEY)
  assert.doesNotMatch(serialized, /สมชาย|0812345678|บางแสน|สรุปแผน/)

  assert.equal(client.getActiveLead().leadCode, 'CN-2345-6789-ABCD-EFGH')
  const copiedResult = await client.copyForAi('สรุปแผน')
  assert.equal(copiedResult.ok, true)
  assert.match(copied[0], /CARE NAVIGATOR PLAN V1/)
  assert.match(copied[0], /CN-2345-6789-ABCD-EFGH/)
  assert.doesNotMatch(copied[0], /สมชาย|0812345678|บางแสน/)
  assert.equal(client.markConsultIntent().leadCode, 'CN-2345-6789-ABCD-EFGH')

  let attempts = 0
  const retryStorage = makeStorage()
  const retryClient = createClient({
    endpoint: 'https://example.test/v1', appVersion: 'beta', storage: retryStorage,
    uuid: () => '06f243c5-1ca8-489f-95f5-fc528ef99891', now: () => new Date('2026-08-11T08:00:00.000Z'), planPath: () => '/plan',
    fetch: async (_url, options) => {
      attempts += 1
      assert.equal(JSON.parse(options.body).request_id, '06f243c5-1ca8-489f-95f5-fc528ef99891')
      if (attempts === 1) throw new Error('offline')
      return { ok: true, status: 200, json: async () => ({ ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', recovery_token: 'resume_token_value_12345678901234567890', expires_at: '2026-08-25T08:00:00.000Z' }) }
    }, clipboard: { writeText: async () => {} },
  })
  assert.equal((await retryClient.createLead(payload)).ok, true)
  assert.equal(attempts, 2)

  const outageStorage = makeStorage()
  const outage = createClient({ endpoint: 'https://example.test/v1', appVersion: 'beta', storage: outageStorage, fetch: async () => { throw new Error('down') }, uuid: () => crypto.randomUUID(), now: () => new Date(), planPath: () => '/plan', clipboard: { writeText: async () => {} } })
  assert.equal((await outage.createLead(payload)).ok, false)
  assert.equal(outageStorage.getItem(STORAGE_KEY), null)

  const expiredStorage = makeStorage()
  expiredStorage.setItem(STORAGE_KEY, JSON.stringify({ leadCode: 'CN-2345-6789-ABCD-EFGH', recoveryToken: 'token', expiresAt: '2026-08-01T00:00:00.000Z', planType: 'walk-confidence', planPath: '/plan' }))
  const expired = createClient({ endpoint: 'https://example.test/v1', appVersion: 'beta', storage: expiredStorage, fetch: async () => ({}), uuid: () => crypto.randomUUID(), now: () => new Date('2026-08-11'), planPath: () => '/plan', clipboard: { writeText: async () => {} } })
  assert.equal(expired.getActiveLead(), null)
  assert.equal(expiredStorage.getItem(STORAGE_KEY), null)

  const recoverStorage = makeStorage()
  recoverStorage.setItem(STORAGE_KEY, JSON.stringify({ leadCode: 'CN-2345-6789-ABCD-EFGH', recoveryToken: 'resume_token_value_12345678901234567890', expiresAt: '2026-08-25T08:00:00.000Z', planType: 'walk-confidence', planPath: '/plan' }))
  const recoveredCopies = []
  const recoveryClient = createClient({ endpoint: 'https://example.test/v1', appVersion: 'beta', storage: recoverStorage, uuid: () => crypto.randomUUID(), now: () => new Date('2026-08-11'), planPath: () => '/plan', fetch: async () => ({ ok: true, json: async () => ({ ok: true, lead_code: 'CN-2345-6789-ABCD-EFGH', plan_type: 'walk-confidence', plan_summary: 'recovered summary', expires_at: '2026-08-25T08:00:00.000Z' }) }), clipboard: { writeText: async (value) => recoveredCopies.push(value) } })
  assert.equal((await recoveryClient.copyForAi()).ok, true)
  assert.match(recoveredCopies[0], /recovered summary/)

  const deniedClient = createClient({ endpoint: 'https://example.test/v1', appVersion: 'beta', storage: recoverStorage, uuid: () => crypto.randomUUID(), now: () => new Date('2026-08-11'), planPath: () => '/plan', fetch: async () => ({ ok: true, json: async () => ({ ok: true, plan_summary: 'summary' }) }), clipboard: { writeText: async () => { throw new Error('denied') } } })
  assert.equal((await deniedClient.copyForAi('summary')).error, 'clipboard_unavailable')

  console.log('PASS lead registry browser client')
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
