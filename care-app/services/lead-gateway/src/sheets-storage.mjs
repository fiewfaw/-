import { createHash, randomBytes as nodeRandomBytes, randomUUID } from 'node:crypto'

export const LEADS_HEADERS = [
  'lead_id', 'lead_code', 'created_at', 'expires_at', 'status',
  'contact_name', 'phone', 'service_area', 'plan_type', 'plan_summary',
  'consent_version', 'consented_at', 'app_version', 'source',
  'confirmed_at', 'contacted_at', 'resume_token_hash', 'request_id',
]
export const STATUS_HISTORY_HEADERS = ['change_id', 'lead_id', 'changed_at', 'from_status', 'to_status', 'actor_type', 'reason_code']
export const LOOKUP_AUDIT_HEADERS = ['lookup_id', 'lead_id', 'looked_up_at', 'actor_type', 'result_code']

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const CODE_PATTERN = /^CN-(?:[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-){3}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/
const DAY_MS = 24 * 60 * 60 * 1000
const TRANSITIONS = {
  pending: ['confirmed', 'closed', 'expired'],
  confirmed: ['contacted', 'closed', 'expired'],
  contacted: ['converted', 'closed', 'expired'],
  converted: ['expired'], closed: ['expired'], expired: [],
}

function objectFromRow(headers, values) {
  return Object.fromEntries(headers.map((key, index) => [key, values[index] ?? '']))
}

function rowFromObject(headers, value) {
  return headers.map((key) => value[key] ?? '')
}

function assertHeaders(actual, expected) {
  if (actual.length !== expected.length || expected.some((value, index) => actual[index] !== value)) throw new Error('sheets_schema_mismatch')
}

function maskName(value) {
  const chars = Array.from(String(value || '').trim())
  return chars.length ? `${chars[0]}***` : '***'
}

function maskPhone(value) {
  return `******${String(value || '').replace(/\D/g, '').slice(-4)}`
}

function generateLeadCode(randomBytes) {
  const bytes = randomBytes(16)
  let raw = ''
  for (let index = 0; index < 16; index += 1) raw += ALPHABET[Number(bytes[index]) & 31]
  return `CN-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`
}

export function createSheetsStorage(options = {}) {
  const api = options.api
  const now = options.now || (() => new Date())
  const randomBytes = options.randomBytes || nodeRandomBytes
  const uuid = options.uuid || randomUUID
  const hash = options.hash || ((value) => createHash('sha256').update(String(value)).digest('hex'))
  if (!api) throw new Error('sheets_api_not_configured')
  let mutationQueue = Promise.resolve()

  async function readTab(tab, headers, lastColumn) {
    const values = await api.getValues(tab, `A1:${lastColumn}10000`)
    if (!values.length) throw new Error('sheets_schema_mismatch')
    assertHeaders(values[0], headers)
    return values.slice(1).map((row, index) => ({ data: objectFromRow(headers, row), rowNumber: index + 2 }))
  }

  async function createLead(payload) {
    const leads = await readTab('Leads', LEADS_HEADERS, 'R')
    const duplicate = leads.find((item) => item.data.request_id === payload.request_id)
    if (duplicate) return { ok: true, lead_code: duplicate.data.lead_code, expires_at: duplicate.data.expires_at, duplicate: true }
    const codes = new Set(leads.map((item) => item.data.lead_code))
    let leadCode = ''
    for (let attempt = 0; attempt < 12 && !leadCode; attempt += 1) {
      const candidate = generateLeadCode(randomBytes)
      if (!codes.has(candidate)) leadCode = candidate
    }
    if (!leadCode) throw new Error('lead_code_collision')
    const createdAt = now()
    const row = {
      lead_id: `LD-${uuid()}`, lead_code: leadCode, created_at: createdAt.toISOString(),
      expires_at: new Date(createdAt.getTime() + 14 * DAY_MS).toISOString(), status: 'pending',
      contact_name: payload.contact_name, phone: payload.phone, service_area: payload.service_area || '',
      plan_type: payload.plan_type, plan_summary: payload.plan_summary, consent_version: payload.consent_version,
      consented_at: payload.consented_at, app_version: payload.app_version, source: payload.source || 'care-navigator',
      confirmed_at: '', contacted_at: '', resume_token_hash: hash(payload.recovery_token), request_id: payload.request_id,
    }
    await api.appendValues('Leads', [rowFromObject(LEADS_HEADERS, row)])
    return { ok: true, lead_code: leadCode, expires_at: row.expires_at, duplicate: false }
  }

  async function findLead(code) {
    const leads = await readTab('Leads', LEADS_HEADERS, 'R')
    return leads.find((item) => item.data.lead_code === code) || null
  }

  async function recoverPlan(payload) {
    const found = await findLead(payload.lead_code)
    if (!found || found.data.status === 'expired' || Date.parse(found.data.expires_at) <= now().getTime()) return { ok: false, error: 'not_available' }
    if (found.data.resume_token_hash !== hash(payload.recovery_token || '')) return { ok: false, error: 'not_available' }
    return { ok: true, lead_code: found.data.lead_code, plan_type: found.data.plan_type, plan_summary: found.data.plan_summary, expires_at: found.data.expires_at }
  }

  async function lookupLead(payload) {
    const code = String(payload.lead_code || '')
    const found = CODE_PATTERN.test(code) ? await findLead(code) : null
    const resultCode = !CODE_PATTERN.test(code) ? 'invalid_code' : !found ? 'not_found'
      : found.data.status === 'expired' || Date.parse(found.data.expires_at) <= now().getTime() ? 'expired'
        : found.data.status === 'pending' ? 'found' : 'already_confirmed'
    await api.appendValues('Lookup Audit', [[`LU-${uuid()}`, found?.data.lead_id || '', now().toISOString(), payload.actor_type || 'official_chatbot', resultCode]])
    if (!found || !['found', 'already_confirmed'].includes(resultCode)) return { ok: false, error: 'not_available' }
    return {
      ok: true, lead_code: found.data.lead_code, contact_name_masked: maskName(found.data.contact_name),
      phone_masked: maskPhone(found.data.phone), service_area: found.data.service_area, plan_type: found.data.plan_type,
      plan_summary: found.data.plan_summary, status: found.data.status, expires_at: found.data.expires_at,
    }
  }

  async function updateStatus(payload) {
    const found = await findLead(payload.lead_code)
    if (!found || !(TRANSITIONS[found.data.status] || []).includes(payload.to_status)) return { ok: false, error: 'invalid_transition' }
    const changedAt = now().toISOString()
    const from = found.data.status
    found.data.status = payload.to_status
    if (payload.to_status === 'confirmed') found.data.confirmed_at = changedAt
    if (payload.to_status === 'contacted') found.data.contacted_at = changedAt
    if (['confirmed', 'contacted'].includes(payload.to_status)) found.data.expires_at = new Date(now().getTime() + 90 * DAY_MS).toISOString()
    if (['converted', 'closed'].includes(payload.to_status)) found.data.expires_at = new Date(now().getTime() + 30 * DAY_MS).toISOString()
    await api.updateValues('Leads', `A${found.rowNumber}:R${found.rowNumber}`, [rowFromObject(LEADS_HEADERS, found.data)])
    await api.appendValues('Status History', [[`CH-${uuid()}`, found.data.lead_id, changedAt, from, payload.to_status, payload.actor_type || 'owner', payload.reason_code || 'manual']])
    return { ok: true, status: payload.to_status }
  }

  async function purgeLead(payload) {
    const found = await findLead(payload.lead_code)
    if (!found) return { ok: false, error: 'not_found' }
    const from = found.data.status
    for (const key of ['contact_name', 'phone', 'service_area', 'plan_summary', 'resume_token_hash']) found.data[key] = ''
    found.data.status = 'expired'
    const changedAt = now().toISOString()
    await api.updateValues('Leads', `A${found.rowNumber}:R${found.rowNumber}`, [rowFromObject(LEADS_HEADERS, found.data)])
    await api.appendValues('Status History', [[`CH-${uuid()}`, found.data.lead_id, changedAt, from, 'expired', payload.actor_type || 'owner', payload.reason_code || 'manual_purge']])
    return { ok: true, status: 'expired' }
  }

  async function expireLeads() {
    const leads = await readTab('Leads', LEADS_HEADERS, 'R')
    const history = await readTab('Status History', STATUS_HISTORY_HEADERS, 'G')
    let purged = 0
    for (const found of leads) {
      const changes = history.filter((item) => item.data.lead_id === found.data.lead_id)
      const base = Date.parse(changes.at(-1)?.data.changed_at || found.data.created_at)
      const due = found.data.status === 'pending' && Date.parse(found.data.expires_at) <= now().getTime()
        || ['confirmed', 'contacted'].includes(found.data.status) && now().getTime() - base >= 90 * DAY_MS
        || ['converted', 'closed'].includes(found.data.status) && now().getTime() - base >= 30 * DAY_MS
      if (!due || !found.data.contact_name && !found.data.phone && !found.data.plan_summary) continue
      const result = await purgeLead({ lead_code: found.data.lead_code, actor_type: 'system', reason_code: 'retention_expired' })
      if (result.ok) purged += 1
    }
    return { ok: true, purged }
  }

  async function dispatch(action, payload) {
    if (action === 'createLead') return createLead(payload)
    if (action === 'recoverPlan') return recoverPlan(payload)
    if (action === 'lookupLead') return lookupLead(payload)
    if (action === 'confirmLead') return updateStatus({ ...payload, to_status: 'confirmed' })
    if (action === 'updateLeadStatus') return updateStatus(payload)
    if (action === 'expireLeads') return expireLeads()
    if (action === 'purgeLead') return purgeLead(payload)
    return { ok: false, error: 'invalid_action' }
  }

  return function storageAction(action, payload) {
    const mutation = !['recoverPlan'].includes(action)
    if (!mutation) return dispatch(action, payload)
    const next = mutationQueue.then(() => dispatch(action, payload))
    mutationQueue = next.catch(() => {})
    return next
  }
}
