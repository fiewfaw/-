(function attachCareNavigatorLeads(root, factory) {
  let contract = root && root.CareNavigatorLeadContract
  if (!contract && typeof require === 'function') contract = require('./lead-registry-contract.js')
  const api = factory(root, contract)
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.CareNavigatorLeads = api.defaultClient
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLeadClientModule(root, contract) {
  const STORAGE_KEY = 'care_navigator_lead_v1'

  function createClient(options = {}) {
    const endpoint = String(options.endpoint || '').replace(/\/$/, '')
    const appVersion = options.appVersion || 'care-navigator-beta'
    const storage = options.storage || root.localStorage
    const fetchImpl = options.fetch || root.fetch?.bind(root)
    const clipboard = options.clipboard || root.navigator?.clipboard
    const uuid = options.uuid || (() => root.crypto.randomUUID())
    const now = options.now || (() => new Date())
    const planPath = options.planPath || (() => root.location?.pathname || '/')

    function clearActiveLead() {
      try { storage?.removeItem(STORAGE_KEY) } catch {}
    }

    function getActiveLead() {
      try {
        const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null')
        if (!parsed || typeof parsed !== 'object') return null
        const keys = Object.keys(parsed)
        const allowed = ['leadCode', 'recoveryToken', 'expiresAt', 'planType', 'planPath']
        if (keys.some((key) => !allowed.includes(key)) || !contract.LEAD_CODE_PATTERN.test(parsed.leadCode || '') || Date.parse(parsed.expiresAt) <= now().getTime()) {
          clearActiveLead()
          return null
        }
        return parsed
      } catch {
        clearActiveLead()
        return null
      }
    }

    function storeActiveLead(value) {
      const safe = {
        leadCode: value.lead_code,
        recoveryToken: value.recovery_token,
        expiresAt: value.expires_at,
        planType: value.plan_type,
        planPath: planPath(),
      }
      storage?.setItem(STORAGE_KEY, JSON.stringify(safe))
      return safe
    }

    async function postJson(path, body) {
      if (!endpoint || typeof fetchImpl !== 'function') throw new Error('lead_service_not_configured')
      const response = await fetchImpl(`${endpoint}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result || !result.ok) throw new Error(result?.error || 'lead_service_unavailable')
      return result
    }

    async function createLead(input) {
      const requestId = input.request_id || uuid()
      const payload = {
        schema_version: 1,
        request_id: requestId,
        contact_name: input.contact_name,
        phone: input.phone,
        service_area: input.service_area || '',
        plan_type: input.plan_type,
        plan_summary: input.plan_summary,
        consent_version: 'lead-temp-v1',
        consented_at: input.consented_at || now().toISOString(),
        app_version: appVersion,
      }
      const checked = contract.validateCreateInput(payload)
      if (!checked.ok) return { ok: false, error: checked.error }
      let lastError
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const result = await postJson('/leads', checked.value)
          storeActiveLead({ ...result, plan_type: checked.value.plan_type })
          return result
        } catch (error) {
          lastError = error
        }
      }
      return { ok: false, error: 'save_unavailable', cause: lastError?.message || '' }
    }

    async function recoverPlan() {
      const active = getActiveLead()
      if (!active) return { ok: false, error: 'no_active_lead' }
      try {
        return await postJson('/leads/recover', { lead_code: active.leadCode, recovery_token: active.recoveryToken })
      } catch {
        return { ok: false, error: 'recover_unavailable' }
      }
    }

    async function copyForAi(planSummary) {
      const active = getActiveLead()
      if (!active) return { ok: false, error: 'no_active_lead' }
      let summary = String(planSummary || '').trim()
      if (!summary) {
        const recovered = await recoverPlan()
        if (!recovered.ok) return recovered
        summary = recovered.plan_summary
      }
      let text
      try {
        text = contract.wrapAiSummary({ leadCode: active.leadCode, planSummary: summary })
      } catch {
        return { ok: false, error: 'invalid_summary' }
      }
      try {
        await clipboard.writeText(text)
        return { ok: true, text, leadCode: active.leadCode }
      } catch {
        return { ok: false, error: 'clipboard_unavailable', text }
      }
    }

    function markConsultIntent() {
      const active = getActiveLead()
      if (active && root?.dispatchEvent && root?.CustomEvent) {
        root.dispatchEvent(new root.CustomEvent('care-navigator:consult-intent', { detail: { leadCode: active.leadCode, planType: active.planType } }))
      }
      return active
    }

    return { clearActiveLead, copyForAi, createLead, getActiveLead, markConsultIntent, recoverPlan }
  }

  const config = root?.CARE_NAVIGATOR_LEAD_CONFIG || {}
  const defaultClient = createClient({ endpoint: config.endpoint, appVersion: config.appVersion })
  return { STORAGE_KEY, createClient, defaultClient }
})
