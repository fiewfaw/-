const assert = require('node:assert/strict')

const contract = require('../public/js/lead-registry-contract.js')

const validInput = {
  schema_version: 1,
  request_id: '06f243c5-1ca8-489f-95f5-fc528ef99891',
  contact_name: '  สมชาย ใจดี  ',
  phone: '081-234-5678',
  service_area: '  บางแสน ชลบุรี  ',
  plan_type: 'walk-confidence',
  plan_summary: 'สรุปแผนทดสอบ',
  consent_version: 'lead-temp-v1',
  consented_at: '2026-08-11T08:00:00.000Z',
  app_version: 'care-navigator-beta',
}

assert.deepEqual(contract.PLAN_TYPES, [
  'walk-confidence',
  'return-strength',
  'stroke-arm-leg',
  'hip-recovery',
  'knee-recovery',
  'parkinson-mobility',
  'bedbound-transfer',
])

const normalized = contract.normalizeCreateInput(validInput)
assert.equal(normalized.contact_name, 'สมชาย ใจดี')
assert.equal(normalized.phone, '0812345678')
assert.equal(normalized.service_area, 'บางแสน ชลบุรี')
assert.equal(contract.validateCreateInput(validInput).ok, true)

for (const planType of contract.PLAN_TYPES) {
  assert.equal(contract.validateCreateInput({ ...validInput, plan_type: planType }).ok, true)
}

assert.equal(contract.validateCreateInput({ ...validInput, phone: '081234567' }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, plan_type: 'unknown' }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, latitude: 13.3 }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, maps_url: 'https://maps.google.com/x' }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, arbitrary: 'nope' }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, service_area: 'https://maps.app.goo.gl/private' }).ok, false)
assert.equal(contract.validateCreateInput({ ...validInput, plan_summary: 'ก'.repeat(13 * 1024) }).ok, false)

const envelope = contract.wrapAiSummary({
  leadCode: 'CN-2345-6789-ABCD-EFGH',
  planSummary: 'แผนฝึกเดินช่วงสั้นตามความปลอดภัย',
})
assert.match(envelope, /^=== CARE NAVIGATOR PLAN V1 ===/)
assert.match(envelope, /Reference code: CN-2345-6789-ABCD-EFGH/)
assert.match(envelope, /แผนฝึกเดินช่วงสั้นตามความปลอดภัย/)
assert.match(envelope, /=== END CARE NAVIGATOR PLAN ===$/)
assert.doesNotMatch(envelope, /สมชาย|0812345678|บางแสน/)

console.log('PASS lead registry contract')
