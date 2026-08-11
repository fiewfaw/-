import { randomUUID } from 'node:crypto'

const gateway = String(process.env.LEAD_GATEWAY_URL || '').replace(/\/$/, '')
const storageUrl = process.env.LEAD_STORAGE_URL
const storageSecret = process.env.LEAD_STORAGE_SECRET
if (!gateway || !storageUrl || !storageSecret) {
  throw new Error('Set LEAD_GATEWAY_URL, LEAD_STORAGE_URL, and LEAD_STORAGE_SECRET before running the synthetic smoke test')
}

async function jsonPost(url, value) {
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:3018' }, body: JSON.stringify(value) })
  const body = await response.json().catch(() => null)
  return { response, body }
}

async function storageAction(action, payload) {
  const envelope = { action, gateway_secret: storageSecret, request_id: randomUUID(), payload }
  const response = await fetch(storageUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: new URLSearchParams({ payload: JSON.stringify(envelope) }), redirect: 'follow' })
  if (!response.ok) throw new Error(`Storage cleanup failed with HTTP ${response.status}`)
  const body = await response.json()
  if (!body.ok) throw new Error(`Storage cleanup failed: ${body.error || 'unknown'}`)
  return body
}

const requestId = randomUUID()
let leadCode = ''
try {
  const created = await jsonPost(`${gateway}/v1/leads`, {
    schema_version: 1,
    request_id: requestId,
    contact_name: 'ทดสอบระบบ',
    phone: '0800000000',
    service_area: 'ข้อมูลจำลอง ชลบุรี',
    plan_type: 'walk-confidence',
    plan_summary: 'SYNTHETIC TEST ONLY - no real patient or health data',
    consent_version: 'lead-temp-v1',
    consented_at: new Date().toISOString(),
    app_version: 'synthetic-smoke',
  })
  if (![200, 201].includes(created.response.status) || !created.body?.ok) throw new Error('Synthetic create failed')
  leadCode = created.body.lead_code

  const recovered = await jsonPost(`${gateway}/v1/leads/recover`, { lead_code: leadCode, recovery_token: created.body.recovery_token })
  if (recovered.response.status !== 200 || recovered.body?.plan_summary !== 'SYNTHETIC TEST ONLY - no real patient or health data') throw new Error('Synthetic recovery failed')

  const wrong = await jsonPost(`${gateway}/v1/leads/recover`, { lead_code: leadCode, recovery_token: 'wrong_token_value_12345678901234567890' })
  if (wrong.response.status !== 404 || wrong.body?.ok !== false) throw new Error('Wrong-token recovery was not rejected')

  console.log(JSON.stringify({ ok: true, checks: ['create', 'recover', 'wrong_token_rejected'], lead_code: leadCode }))
} finally {
  if (leadCode) {
    await storageAction('purgeLead', { lead_code: leadCode, actor_type: 'system', reason_code: 'synthetic_smoke_cleanup' })
    console.log(JSON.stringify({ ok: true, cleanup: 'purged', lead_code: leadCode }))
  }
}
