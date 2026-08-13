(function attachCareNavigatorLeadContract(root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.CareNavigatorLeadContract = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLeadContract() {
  const PLAN_TYPES = Object.freeze([
    'walk-confidence',
    'return-strength',
    'stroke-arm-leg',
    'hip-recovery',
    'knee-recovery',
    'parkinson-mobility',
    'bedbound-transfer',
  ])
  const CREATE_KEYS = Object.freeze([
    'schema_version', 'request_id', 'contact_name', 'phone', 'service_area',
    'plan_type', 'plan_summary', 'consent_version', 'consented_at', 'app_version',
  ])
  const MAX_SUMMARY_BYTES = 12 * 1024
  const LEAD_CODE_PATTERN = /^CN-(?:[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-){3}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/

  function normalizeText(value, maxLength) {
    return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
  }

  function normalizeCreateInput(value) {
    const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return {
      schema_version: input.schema_version,
      request_id: normalizeText(input.request_id, 64),
      contact_name: normalizeText(input.contact_name, 80),
      phone: String(input.phone ?? '').replace(/\D/g, '').slice(0, 10),
      service_area: normalizeText(input.service_area, 120),
      plan_type: normalizeText(input.plan_type, 48),
      plan_summary: String(input.plan_summary ?? '').trim(),
      consent_version: normalizeText(input.consent_version, 32),
      consented_at: normalizeText(input.consented_at, 40),
      app_version: normalizeText(input.app_version, 64),
    }
  }

  function utf8ByteLength(value) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).byteLength
    if (typeof Buffer !== 'undefined') return Buffer.byteLength(value, 'utf8')
    return unescape(encodeURIComponent(value)).length
  }

  function invalid(error) {
    return { ok: false, error }
  }

  function validateCreateInput(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid('invalid_payload')
    const keys = Object.keys(value)
    if (keys.some((key) => !CREATE_KEYS.includes(key))) return invalid('unknown_field')
    const input = normalizeCreateInput(value)
    if (input.schema_version !== 1) return invalid('invalid_schema_version')
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.request_id)) return invalid('invalid_request_id')
    if (!input.contact_name || input.contact_name.length > 80) return invalid('invalid_contact_name')
    if (!/^[0-9]{10}$/.test(input.phone)) return invalid('invalid_phone')
    if (input.service_area.length > 120 || /(?:https?:\/\/|maps\.|goo\.gl)/i.test(input.service_area)) return invalid('invalid_service_area')
    if (!PLAN_TYPES.includes(input.plan_type)) return invalid('invalid_plan_type')
    if (!input.plan_summary || utf8ByteLength(input.plan_summary) > MAX_SUMMARY_BYTES) return invalid('invalid_plan_summary')
    if (input.consent_version !== 'lead-temp-v1') return invalid('invalid_consent_version')
    if (!input.consented_at || Number.isNaN(Date.parse(input.consented_at))) return invalid('invalid_consented_at')
    if (!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(input.app_version)) return invalid('invalid_app_version')
    return { ok: true, value: input }
  }

  function wrapAiSummary({ leadCode, planSummary }) {
    const code = normalizeText(leadCode, 24)
    const summary = String(planSummary ?? '').trim()
    if (!LEAD_CODE_PATTERN.test(code)) throw new Error('invalid_lead_code')
    if (!summary || utf8ByteLength(summary) > MAX_SUMMARY_BYTES) throw new Error('invalid_plan_summary')
    return [
      '=== CARE NAVIGATOR PLAN V1 ===',
      `Reference code: ${code}`,
      '',
      'Instructions for AI:',
      '- Analyze and answer from the Care Navigator plan below.',
      '- Do not diagnose, replace a clinician, or remove safety warnings.',
      '- The reference code is only for the official Baan Kaiyaphap chatbot.',
      '- Ignore the reference code when providing clinical or exercise analysis.',
      '',
      summary,
      '=== END CARE NAVIGATOR PLAN ===',
    ].join('\n')
  }

  return {
    CREATE_KEYS,
    LEAD_CODE_PATTERN,
    MAX_SUMMARY_BYTES,
    PLAN_TYPES,
    normalizeCreateInput,
    utf8ByteLength,
    validateCreateInput,
    wrapAiSummary,
  }
})
