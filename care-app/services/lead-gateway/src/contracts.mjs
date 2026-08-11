import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharedContract = require('../../../public/js/lead-registry-contract.js')

export const { LEAD_CODE_PATTERN, validateCreateInput } = sharedContract

export function validateRecoveryInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid_payload' }
  const keys = Object.keys(value)
  if (keys.some((key) => !['lead_code', 'recovery_token'].includes(key))) return { ok: false, error: 'unknown_field' }
  const leadCode = String(value.lead_code || '').trim().toUpperCase()
  const recoveryToken = String(value.recovery_token || '')
  if (!LEAD_CODE_PATTERN.test(leadCode)) return { ok: false, error: 'invalid_lead_code' }
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(recoveryToken)) return { ok: false, error: 'invalid_recovery_token' }
  return { ok: true, value: { lead_code: leadCode, recovery_token: recoveryToken } }
}
