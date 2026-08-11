const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const integration = require('../public/js/team4-lead-registry.js')

const pages = {
  'team4-walk-confidence-mockup.html': 'walk-confidence',
  'team4-return-strength-mockup.html': 'return-strength',
  'team4-stroke-arm-leg-mockup.html': 'stroke-arm-leg',
  'team4-hip-recovery-mockup.html': 'hip-recovery',
  'team4-knee-recovery-mockup.html': 'knee-recovery',
  'team4-parkinson-mobility-mockup.html': 'parkinson-mobility',
  'team4-bedbound-transfer-mockup.html': 'bedbound-transfer',
}

for (const [file, planType] of Object.entries(pages)) {
  assert.equal(integration.planTypeFromPath(`/care-navigator/${file}`), planType)
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', file), 'utf8')
  assert.match(html, new RegExp(`data-lead-plan-type="${planType}"`))
  const contractAt = html.indexOf('js/lead-registry-contract.js')
  const configAt = html.indexOf('js/lead-registry-config.js')
  const clientAt = html.indexOf('js/lead-registry-client.js')
  const integrationAt = html.indexOf('js/team4-lead-registry.js')
  assert.ok(contractAt > 0 && contractAt < configAt && configAt < clientAt && clientAt < integrationAt, `${file} loads lead scripts in order`)
  assert.match(html, /CareNavigatorTeam4Leads\.copyForAi\(/)
  assert.doesNotMatch(html, /navigator\.clipboard\.writeText\(/)
}

const input = integration.buildLeadInput({
  planType: 'walk-confidence',
  contactName: ' สมชาย ',
  phone: '081-234-5678',
  serviceArea: ' บางแสน ',
  planSummary: ' summary ',
  location: { latitude: 13.2, longitude: 100.9 },
  mapsUrl: 'https://maps.google.com/private',
})
assert.deepEqual(input, {
  contact_name: 'สมชาย',
  phone: '0812345678',
  service_area: 'บางแสน',
  plan_type: 'walk-confidence',
  plan_summary: 'summary',
})
assert.equal(integration.CONSENT_VERSION, 'lead-temp-v1')
assert.match(integration.CONSENT_COPY, /14 วัน/)
assert.match(integration.CONSENT_COPY, /ลบอัตโนมัติ/)

console.log('PASS Team 4 lead registry integration')
