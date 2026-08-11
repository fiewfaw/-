(function attachTeam4LeadRegistry(root, factory) {
  const api = factory(root)
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.CareNavigatorTeam4Leads = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTeam4LeadRegistry(root) {
  const CONSENT_VERSION = 'lead-temp-v1'
  const CONSENT_COPY = 'ระบบจะเก็บข้อมูลติดต่อและสรุปแผนนี้ไว้ชั่วคราว 14 วัน เพื่อให้คุณส่งแผนเข้ามาปรึกษาโดยไม่ต้องกรอกใหม่ หากไม่ส่งกลับมา ข้อมูลส่วนบุคคลจะถูกลบอัตโนมัติ'
  const PAGE_PLAN_TYPES = Object.freeze({
    'team4-walk-confidence-mockup.html': 'walk-confidence',
    'team4-return-strength-mockup.html': 'return-strength',
    'team4-stroke-arm-leg-mockup.html': 'stroke-arm-leg',
    'team4-hip-recovery-mockup.html': 'hip-recovery',
    'team4-knee-recovery-mockup.html': 'knee-recovery',
    'team4-parkinson-mobility-mockup.html': 'parkinson-mobility',
    'team4-bedbound-transfer-mockup.html': 'bedbound-transfer',
  })
  const RESULT_SELECTORS = Object.freeze({
    'walk-confidence': '#starterPlan.personalized',
    'return-strength': '#returnStrengthPlan.personalized',
    'stroke-arm-leg': '#starterPlan.personalized',
    'hip-recovery': '#personalPlan:not(.hidden)',
    'knee-recovery': '#personalPlan:not(.hidden)',
    'parkinson-mobility': '#personalizedPlan.show',
    'bedbound-transfer': '#personalizedPlan:not([hidden])',
  })

  function planTypeFromPath(pathname) {
    const file = String(pathname || '').split('/').pop().split('?')[0]
    return PAGE_PLAN_TYPES[file] || ''
  }

  function buildLeadInput(value) {
    return {
      contact_name: String(value.contactName || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      phone: String(value.phone || '').replace(/\D/g, '').slice(0, 10),
      service_area: String(value.serviceArea || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      plan_type: String(value.planType || ''),
      plan_summary: String(value.planSummary || '').trim(),
    }
  }

  function clipUtf8(text, maxBytes = 12 * 1024) {
    let value = String(text || '').trim()
    const byteLength = root.CareNavigatorLeadContract?.utf8ByteLength || ((item) => unescape(encodeURIComponent(item)).length)
    while (value && byteLength(value) > maxBytes) value = value.slice(0, Math.floor(value.length * 0.9))
    return value
  }

  function buildVisiblePlanSummary(documentRef, planType) {
    const heading = documentRef.title || 'Care Navigator personalized plan'
    const selector = RESULT_SELECTORS[planType]
    const resultText = selector
      ? Array.from(documentRef.querySelectorAll(selector)).map((node) => node.textContent).join('\n')
      : ''
    const assessmentFacts = []
    documentRef.querySelectorAll('input,select').forEach((field) => {
      if (['name', 'phone', 'area', 'leadName', 'leadPhone', 'manualArea'].includes(field.id)) return
      if (field.type === 'radio' && !field.checked || field.type === 'checkbox' && !field.checked) return
      const value = field.type === 'checkbox' ? 'เลือก' : String(field.value || '').trim()
      if (!value) return
      const label = field.closest('label')?.textContent || field.getAttribute('aria-label') || field.id || field.name
      assessmentFacts.push(`${String(label || '').replace(/\s+/g, ' ').trim()}: ${value}`)
    })
    return clipUtf8([
      heading,
      resultText.replace(/\s+/g, ' ').trim(),
      assessmentFacts.length ? `ข้อมูลประเมินที่ใช้ปรับแผน:\n${assessmentFacts.join('\n')}` : '',
      'ใช้ข้อมูลนี้เพื่ออธิบายและตั้งคำถามเพิ่มเติม โดยไม่วินิจฉัยหรือเปลี่ยนคำเตือนด้านความปลอดภัยแทนผู้เชี่ยวชาญ',
    ].filter(Boolean).join('\n\n'))
  }

  function showRegistryStatus(documentRef, message, state) {
    let status = documentRef.querySelector('[data-lead-registry-status]')
    if (!status) {
      status = documentRef.createElement('p')
      status.setAttribute('data-lead-registry-status', '')
      status.setAttribute('aria-live', 'polite')
      const form = documentRef.querySelector('#leadForm')
      if (form) form.appendChild(status)
    }
    status.className = `lead-registry-status ${state || ''}`
    status.textContent = message
  }

  function installStyles(documentRef) {
    if (documentRef.querySelector('#leadRegistryStyles')) return
    const style = documentRef.createElement('style')
    style.id = 'leadRegistryStyles'
    style.textContent = '.lead-storage-consent{margin:9px 0 2px;padding:9px 10px;display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;border:1px solid #cfe1e2;border-radius:9px;color:#526d77;background:#f7fbfb;font-size:8px;line-height:1.5}.lead-storage-consent input{width:17px;height:17px;margin:1px 0;accent-color:#138f8d}.lead-storage-consent strong{display:block;margin-bottom:2px;color:#1c6268;font-size:9px}.lead-registry-status{margin:8px 2px 0;color:#58717a;font-size:8px;line-height:1.5}.lead-registry-status.success{color:#147064}.lead-registry-status.error{color:#9a5258}.lead-registry-retry{margin-left:5px;border:0;color:#0b7b86;background:transparent;font:inherit;font-weight:900;text-decoration:underline}'
    documentRef.head.appendChild(style)
  }

  function installConsent(documentRef, submitButton) {
    const form = documentRef.querySelector('#leadForm')
    if (!form || form.querySelector('[data-lead-storage-consent]')) return null
    const label = documentRef.createElement('label')
    label.className = 'lead-storage-consent'
    label.setAttribute('data-lead-storage-consent', '')
    label.innerHTML = `<input type="checkbox" aria-label="ยินยอมให้เก็บข้อมูลชั่วคราว"><span><strong>เก็บแผนไว้เพื่อใช้รหัสปรึกษา</strong>${CONSENT_COPY}</span>`
    form.insertBefore(label, submitButton)
    const checkbox = label.querySelector('input')
    return checkbox
  }

  async function saveCurrentPlan(documentRef, planType) {
    const resultSelector = RESULT_SELECTORS[planType]
    if (!resultSelector || !documentRef.querySelector(resultSelector)) return { ok: false, error: 'plan_not_ready' }
    const contactName = documentRef.querySelector('#name,#leadName')?.value
    const phone = documentRef.querySelector('#phone,#leadPhone')?.value
    const serviceArea = documentRef.querySelector('#area,#manualArea')?.value || ''
    const planSummary = buildVisiblePlanSummary(documentRef, planType)
    const input = buildLeadInput({ planType, contactName, phone, serviceArea, planSummary })
    const result = await root.CareNavigatorLeads.createLead(input)
    if (result.ok) {
      showRegistryStatus(documentRef, `บันทึกแผนชั่วคราวแล้ว รหัสอ้างอิง ${result.lead_code}`, 'success')
    } else {
      showRegistryStatus(documentRef, 'สร้างแผนเฉพาะตัวแล้ว แต่ยังบันทึกรหัสสำหรับปรึกษาไม่ได้ กรุณาลองใหม่เมื่ออินเทอร์เน็ตพร้อม', 'error')
    }
    return result
  }

  async function copyForAi(planSummary) {
    const active = root.CareNavigatorLeads?.getActiveLead?.()
    if (active) {
      const result = await root.CareNavigatorLeads.copyForAi(planSummary)
      if (!result.ok) throw new Error(result.error || 'copy_failed')
      return result
    }
    try {
      await root.navigator.clipboard.writeText(String(planSummary || ''))
      return { ok: true, unregistered: true }
    } catch {
      throw new Error('clipboard_unavailable')
    }
  }

  function init(documentRef = root.document) {
    if (!documentRef || !root.CareNavigatorLeads) return
    installStyles(documentRef)
    const planType = documentRef.body?.dataset.leadPlanType || planTypeFromPath(root.location?.pathname)
    const submitButton = documentRef.querySelector('#submitPlan,#showPersonalPlan')
    if (!planType || !submitButton || submitButton.dataset.leadRegistryBound === 'true') return
    submitButton.dataset.leadRegistryBound = 'true'
    const consent = installConsent(documentRef, submitButton)
    submitButton.addEventListener('click', (event) => {
      if (consent?.checked) return
      event.preventDefault()
      event.stopImmediatePropagation()
      showRegistryStatus(documentRef, 'กรุณาเลือกยินยอมให้เก็บแผนชั่วคราวก่อนสร้างแผนเฉพาะตัว', 'error')
      consent?.focus()
    }, true)
    submitButton.addEventListener('click', () => {
      if (!consent?.checked) return
      root.setTimeout(() => saveCurrentPlan(documentRef, planType), 150)
    })
    documentRef.querySelectorAll('#consult,.consult,.consult-button').forEach((button) => button.addEventListener('click', () => root.CareNavigatorLeads.markConsultIntent()))
  }

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', () => init())
    else init()
  }

  return { CONSENT_COPY, CONSENT_VERSION, buildLeadInput, buildVisiblePlanSummary, copyForAi, init, planTypeFromPath, saveCurrentPlan }
})
