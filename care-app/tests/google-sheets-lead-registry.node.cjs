const assert = require('node:assert/strict')

const registry = require('../apps-script/lead-registry/Code.gs')

assert.deepEqual(registry.LEADS_HEADERS, [
  'lead_id', 'lead_code', 'created_at', 'expires_at', 'status',
  'contact_name', 'phone', 'service_area', 'plan_type', 'plan_summary',
  'consent_version', 'consented_at', 'app_version', 'source',
  'confirmed_at', 'contacted_at', 'resume_token_hash', 'request_id',
])
assert.deepEqual(registry.STATUS_HISTORY_HEADERS, [
  'change_id', 'lead_id', 'changed_at', 'from_status', 'to_status', 'actor_type', 'reason_code',
])
assert.deepEqual(registry.LOOKUP_AUDIT_HEADERS, [
  'lookup_id', 'lead_id', 'looked_up_at', 'actor_type', 'result_code',
])

assert.equal(registry.verifyEnvelope({ action: 'createLead', gateway_secret: 'secret', request_id: 'req', payload: {} }, 'secret').ok, true)
assert.equal(registry.verifyEnvelope({ action: 'dropTable', gateway_secret: 'secret', request_id: 'req', payload: {} }, 'secret').ok, false)
assert.equal(registry.verifyEnvelope({ action: 'createLead', gateway_secret: 'wrong', request_id: 'req', payload: {} }, 'secret').ok, false)
assert.equal(registry.utf8ByteLength_('abc'), 3)
assert.equal(registry.utf8ByteLength_('ไทย'), 9)

const bytesA = Uint8Array.from({ length: 16 }, (_, index) => index)
const code = registry.generateLeadCode(() => bytesA)
assert.match(code, /^CN-(?:[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-){3}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/)

const now = new Date('2026-08-11T08:00:00.000Z')
let randomCall = 0
const store = registry.createMemoryRegistry({
  now: () => new Date(now),
  randomBytes: () => {
    randomCall += 1
    return randomCall < 3 ? new Uint8Array(16).fill(1) : new Uint8Array(16).fill(2)
  },
  hash: (value) => `hash:${value}`,
})

const payload = {
  schema_version: 1,
  request_id: '06f243c5-1ca8-489f-95f5-fc528ef99891',
  contact_name: 'สมชาย',
  phone: '0812345678',
  service_area: 'บางแสน',
  plan_type: 'walk-confidence',
  plan_summary: 'summary',
  consent_version: 'lead-temp-v1',
  consented_at: '2026-08-11T08:00:00.000Z',
  app_version: 'beta',
  recovery_token: 'resume-secret',
}

const first = store.createLead(payload)
assert.equal(first.ok, true)
assert.match(first.lead_code, registry.LEAD_CODE_PATTERN)
assert.equal(first.expires_at, '2026-08-25T08:00:00.000Z')
assert.equal(store.rows[0].resume_token_hash, 'hash:resume-secret')
assert.equal(store.rows[0].recovery_token, undefined)

const duplicate = store.createLead(payload)
assert.equal(duplicate.lead_code, first.lead_code)
assert.equal(store.rows.length, 1)

store.existingCodes.add(registry.generateLeadCode(() => new Uint8Array(16).fill(1)))
const second = store.createLead({ ...payload, request_id: 'b6b381f0-5698-4d13-b96c-2a8d150e1e30', phone: '0899999999' })
assert.notEqual(second.lead_code, first.lead_code)
assert.equal(store.purgeLead({ lead_code: second.lead_code, actor_type: 'owner', reason_code: 'synthetic_test_cleanup' }).ok, true)
assert.equal(store.rows[1].phone, '')
assert.equal(store.rows[1].plan_summary, '')
assert.equal(store.rows[1].status, 'expired')

assert.equal(store.recoverPlan({ lead_code: first.lead_code, recovery_token: 'wrong' }).ok, false)
const recovered = store.recoverPlan({ lead_code: first.lead_code, recovery_token: 'resume-secret' })
assert.deepEqual(Object.keys(recovered).sort(), ['expires_at', 'lead_code', 'ok', 'plan_summary', 'plan_type'].sort())
assert.equal(recovered.plan_summary, 'summary')

const lookup = store.lookupLead({ lead_code: first.lead_code, actor_type: 'official_chatbot' })
assert.equal(lookup.ok, true)
assert.equal(lookup.contact_name_masked, 'ส***')
assert.equal(lookup.phone_masked, '******5678')
assert.equal(lookup.phone, undefined)
assert.equal(store.audit.at(-1).result_code, 'found')

assert.equal(store.updateStatus({ lead_code: first.lead_code, to_status: 'contacted', actor_type: 'owner' }).ok, false)
assert.equal(store.updateStatus({ lead_code: first.lead_code, to_status: 'confirmed', actor_type: 'official_chatbot' }).ok, true)
assert.equal(store.updateStatus({ lead_code: first.lead_code, to_status: 'contacted', actor_type: 'owner' }).ok, true)
assert.equal(store.history.length, 3)

now.setUTCDate(now.getUTCDate() + 91)
const expired = store.expireLeads()
assert.ok(expired.purged >= 1)
assert.equal(store.rows[0].contact_name, '')
assert.equal(store.rows[0].phone, '')
assert.equal(store.rows[0].plan_summary, '')

console.log('PASS Google Sheets lead registry')
