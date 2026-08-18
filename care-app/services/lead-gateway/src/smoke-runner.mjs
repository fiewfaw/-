import { randomUUID as nodeRandomUUID } from 'node:crypto'

const SYNTHETIC_PLAN = 'SYNTHETIC TEST ONLY - no real patient or health data'

async function jsonPost(fetchImpl, url, value) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:3018',
    },
    body: JSON.stringify(value),
  })
  const body = await response.json().catch(() => null)
  return { response, body }
}

export async function runSyntheticSmoke(options = {}) {
  const gateway = String(options.gateway || '').replace(/\/$/, '')
  const fetchImpl = options.fetchImpl || fetch
  const storage = options.storage
  const randomUUID = options.randomUUID || nodeRandomUUID
  const now = options.now || (() => new Date())
  const log = options.log || console.log
  if (!gateway || typeof storage !== 'function') throw new Error('synthetic_smoke_not_configured')

  const checks = []
  let leadCode = ''
  let failure = null

  try {
    const created = await jsonPost(fetchImpl, `${gateway}/v1/leads`, {
      schema_version: 1,
      request_id: randomUUID(),
      contact_name: 'ทดสอบระบบ',
      phone: '0800000000',
      service_area: 'ข้อมูลจำลอง ชลบุรี',
      plan_type: 'walk-confidence',
      plan_summary: SYNTHETIC_PLAN,
      consent_version: 'lead-temp-v1',
      consented_at: now().toISOString(),
      app_version: 'synthetic-smoke',
    })
    if (![200, 201].includes(created.response.status) || !created.body?.ok) {
      throw new Error('synthetic_create_failed')
    }
    leadCode = String(created.body.lead_code || '')
    checks.push('create')

    const recovered = await jsonPost(fetchImpl, `${gateway}/v1/leads/recover`, {
      lead_code: leadCode,
      recovery_token: created.body.recovery_token,
    })
    if (recovered.response.status !== 200 || recovered.body?.plan_summary !== SYNTHETIC_PLAN) {
      throw new Error('synthetic_recovery_failed')
    }
    checks.push('recover')

    const wrong = await jsonPost(fetchImpl, `${gateway}/v1/leads/recover`, {
      lead_code: leadCode,
      recovery_token: 'wrong_token_value_12345678901234567890',
    })
    if (wrong.response.status !== 404 || wrong.body?.ok !== false) {
      throw new Error('synthetic_wrong_token_accepted')
    }
    checks.push('wrong_token_rejected')
  } catch (error) {
    failure = error
  } finally {
    if (leadCode) {
      try {
        const cleaned = await storage('purgeLead', {
          lead_code: leadCode,
          actor_type: 'system',
          reason_code: 'synthetic_smoke_cleanup',
        }, randomUUID())
        if (!cleaned?.ok) throw new Error('synthetic_cleanup_failed')
        checks.push('purged')
      } catch {
        failure = failure || new Error('synthetic_cleanup_failed')
      }
    }
  }

  if (failure) throw failure
  const result = { ok: true, checks }
  log(JSON.stringify(result))
  return result
}
