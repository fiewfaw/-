const LEADS_HEADERS = [
  'lead_id', 'lead_code', 'created_at', 'expires_at', 'status',
  'contact_name', 'phone', 'service_area', 'plan_type', 'plan_summary',
  'consent_version', 'consented_at', 'app_version', 'source',
  'confirmed_at', 'contacted_at', 'resume_token_hash', 'request_id',
]
const STATUS_HISTORY_HEADERS = [
  'change_id', 'lead_id', 'changed_at', 'from_status', 'to_status', 'actor_type', 'reason_code',
]
const LOOKUP_AUDIT_HEADERS = [
  'lookup_id', 'lead_id', 'looked_up_at', 'actor_type', 'result_code',
]
const LEAD_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const LEAD_CODE_PATTERN = /^CN-(?:[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-){3}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/
const ALLOWED_ACTIONS = [
  'createLead', 'recoverPlan', 'lookupLead', 'confirmLead', 'updateLeadStatus', 'expireLeads',
]
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'closed', 'expired'],
  confirmed: ['contacted', 'closed', 'expired'],
  contacted: ['converted', 'closed', 'expired'],
  converted: ['expired'],
  closed: ['expired'],
  expired: [],
}
const DAY_MS = 24 * 60 * 60 * 1000

function verifyEnvelope(value, expectedSecret) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'invalid_envelope' }
  if (!ALLOWED_ACTIONS.includes(value.action)) return { ok: false, error: 'invalid_action' }
  if (!expectedSecret || value.gateway_secret !== expectedSecret) return { ok: false, error: 'unauthorized' }
  if (!value.request_id || typeof value.request_id !== 'string') return { ok: false, error: 'invalid_request_id' }
  if (!value.payload || typeof value.payload !== 'object' || Array.isArray(value.payload)) return { ok: false, error: 'invalid_payload' }
  return { ok: true, value }
}

function generateLeadCode(randomBytesFn) {
  const bytes = randomBytesFn ? randomBytesFn(16) : randomBytes_(16)
  if (!bytes || bytes.length < 16) throw new Error('insufficient_randomness')
  let raw = ''
  for (let index = 0; index < 16; index += 1) raw += LEAD_CODE_ALPHABET[Number(bytes[index]) & 31]
  return `CN-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`
}

function generateUniqueLeadCode(existingCodes, randomBytesFn) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateLeadCode(randomBytesFn)
    if (!existingCodes.has(code)) return code
  }
  throw new Error('lead_code_collision')
}

function maskName(value) {
  const text = String(value || '').trim()
  return text ? `${Array.from(text)[0]}***` : '***'
}

function maskPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return `******${digits.slice(-4)}`
}

function iso(value) {
  return new Date(value).toISOString()
}

function createMemoryRegistry(options) {
  const now = options && options.now ? options.now : () => new Date()
  const randomBytes = options && options.randomBytes ? options.randomBytes : randomBytes_
  const hash = options && options.hash ? options.hash : sha256Hex_
  const rows = []
  const history = []
  const audit = []
  const existingCodes = new Set()

  function find(code) {
    return rows.find((row) => row.lead_code === code)
  }

  function createLead(payload) {
    const duplicate = rows.find((row) => row.request_id === payload.request_id)
    if (duplicate) return { ok: true, lead_code: duplicate.lead_code, expires_at: duplicate.expires_at, duplicate: true }
    const createdAt = now()
    const leadCode = generateUniqueLeadCode(existingCodes, randomBytes)
    existingCodes.add(leadCode)
    const row = {
      lead_id: `LD-${uuid_()}`,
      lead_code: leadCode,
      created_at: iso(createdAt),
      expires_at: iso(createdAt.getTime() + 14 * DAY_MS),
      status: 'pending',
      contact_name: payload.contact_name,
      phone: payload.phone,
      service_area: payload.service_area || '',
      plan_type: payload.plan_type,
      plan_summary: payload.plan_summary,
      consent_version: payload.consent_version,
      consented_at: payload.consented_at,
      app_version: payload.app_version,
      source: payload.source || 'care-navigator',
      confirmed_at: '',
      contacted_at: '',
      resume_token_hash: hash(payload.recovery_token),
      request_id: payload.request_id,
    }
    rows.push(row)
    return { ok: true, lead_code: leadCode, expires_at: row.expires_at, duplicate: false }
  }

  function recoverPlan(payload) {
    const row = find(payload.lead_code)
    if (!row || row.status === 'expired' || Date.parse(row.expires_at) <= now().getTime()) return { ok: false, error: 'not_available' }
    if (row.resume_token_hash !== hash(payload.recovery_token)) return { ok: false, error: 'not_available' }
    return { ok: true, lead_code: row.lead_code, plan_type: row.plan_type, plan_summary: row.plan_summary, expires_at: row.expires_at }
  }

  function lookupLead(payload) {
    const row = find(payload.lead_code)
    let resultCode = 'found'
    if (!LEAD_CODE_PATTERN.test(String(payload.lead_code || ''))) resultCode = 'invalid_code'
    else if (!row) resultCode = 'not_found'
    else if (row.status === 'expired' || Date.parse(row.expires_at) <= now().getTime()) resultCode = 'expired'
    else if (row.status !== 'pending') resultCode = 'already_confirmed'
    audit.push({ lookup_id: `LU-${uuid_()}`, lead_id: row ? row.lead_id : '', looked_up_at: iso(now()), actor_type: payload.actor_type || 'official_chatbot', result_code: resultCode })
    if (!row || !['found', 'already_confirmed'].includes(resultCode)) return { ok: false, error: 'not_available' }
    return {
      ok: true,
      lead_code: row.lead_code,
      contact_name_masked: maskName(row.contact_name),
      phone_masked: maskPhone(row.phone),
      service_area: row.service_area,
      plan_type: row.plan_type,
      plan_summary: row.plan_summary,
      status: row.status,
      expires_at: row.expires_at,
    }
  }

  function updateStatus(payload) {
    const row = find(payload.lead_code)
    if (!row || !STATUS_TRANSITIONS[row.status].includes(payload.to_status)) return { ok: false, error: 'invalid_transition' }
    const from = row.status
    row.status = payload.to_status
    const changedAt = iso(now())
    if (payload.to_status === 'confirmed') row.confirmed_at = changedAt
    if (payload.to_status === 'contacted') row.contacted_at = changedAt
    history.push({ change_id: `CH-${uuid_()}`, lead_id: row.lead_id, changed_at: changedAt, from_status: from, to_status: row.status, actor_type: payload.actor_type || 'owner', reason_code: payload.reason_code || 'manual' })
    return { ok: true, status: row.status }
  }

  function expireLeads() {
    const nowMs = now().getTime()
    let purged = 0
    rows.forEach((row) => {
      const lastChange = [...history].reverse().find((item) => item.lead_id === row.lead_id)
      const statusAgeBase = Date.parse(lastChange ? lastChange.changed_at : row.created_at)
      const shouldPurge = (row.status === 'pending' && Date.parse(row.expires_at) <= nowMs)
        || (['confirmed', 'contacted'].includes(row.status) && nowMs - statusAgeBase >= 90 * DAY_MS)
        || (['converted', 'closed'].includes(row.status) && nowMs - statusAgeBase >= 30 * DAY_MS)
      if (!shouldPurge || !row.contact_name && !row.phone && !row.plan_summary) return
      const from = row.status
      row.contact_name = ''
      row.phone = ''
      row.service_area = ''
      row.plan_summary = ''
      row.resume_token_hash = ''
      row.status = 'expired'
      history.push({ change_id: `CH-${uuid_()}`, lead_id: row.lead_id, changed_at: iso(now()), from_status: from, to_status: 'expired', actor_type: 'system', reason_code: 'retention_expired' })
      purged += 1
    })
    return { ok: true, purged }
  }

  return { rows, history, audit, existingCodes, createLead, recoverPlan, lookupLead, updateStatus, expireLeads }
}

function doPost(event) {
  try {
    const raw = event && event.parameter ? event.parameter.payload : ''
    if (!raw || raw.length > 18000) return json_({ ok: false, error: 'invalid_request' })
    const envelope = JSON.parse(raw)
    const properties = PropertiesService.getScriptProperties()
    const checked = verifyEnvelope(envelope, properties.getProperty('LEAD_GATEWAY_SECRET'))
    if (!checked.ok) return json_({ ok: false, error: checked.error })
    const result = withScriptLock_(function () { return dispatchStorageAction_(checked.value) })
    return json_(result)
  } catch (error) {
    console.error(`lead_registry_error:${String(error && error.message || 'unknown')}`)
    return json_({ ok: false, error: 'storage_unavailable' })
  }
}

function dispatchStorageAction_(envelope) {
  if (envelope.action === 'createLead') return createLead_(envelope.payload)
  if (envelope.action === 'recoverPlan') return recoverPlan_(envelope.payload)
  if (envelope.action === 'lookupLead') return lookupLead_(envelope.payload)
  if (envelope.action === 'confirmLead') return updateLeadStatus_({ ...envelope.payload, to_status: 'confirmed' })
  if (envelope.action === 'updateLeadStatus') return updateLeadStatus_(envelope.payload)
  if (envelope.action === 'expireLeads') return expireLeads()
  return { ok: false, error: 'invalid_action' }
}

function setupWorkbook() {
  const spreadsheet = getSpreadsheet_()
  ensureSheet_(spreadsheet, 'Leads', LEADS_HEADERS)
  ensureSheet_(spreadsheet, 'Status History', STATUS_HISTORY_HEADERS)
  ensureSheet_(spreadsheet, 'Lookup Audit', LOOKUP_AUDIT_HEADERS)
  const dictionary = ensureSheet_(spreadsheet, 'Data Dictionary', ['field', 'meaning', 'sensitivity', 'retention'])
  if (dictionary.getLastRow() === 1) {
    dictionary.getRange(2, 1, 4, 4).setValues([
      ['contact_name / phone', 'ข้อมูลสำหรับติดต่อกลับ', 'personal', '14/90/30 days by status'],
      ['service_area', 'พื้นที่บริการระดับกว้าง', 'personal', '14/90/30 days by status'],
      ['plan_summary', 'สรุปแผนเฉพาะตัว', 'health-related', '14/90/30 days by status'],
      ['lead_code', 'รหัสอ้างอิงแบบสุ่ม', 'opaque', 'retained with lifecycle timestamps'],
    ])
  }
  return { ok: true, spreadsheet_id: spreadsheet.getId() }
}

function installDailyExpiryTrigger() {
  const exists = ScriptApp.getProjectTriggers().some(function (trigger) { return trigger.getHandlerFunction() === 'expireLeads' })
  if (!exists) ScriptApp.newTrigger('expireLeads').timeBased().everyDays(1).atHour(3).create()
  return { ok: true, installed: !exists }
}

function createLead_(payload) {
  if (!payload || !payload.request_id || !payload.recovery_token || !LEADS_HEADERS.every(function (key) { return key !== 'phone' || /^[0-9]{10}$/.test(String(payload.phone || '')) })) return { ok: false, error: 'invalid_payload' }
  const sheet = getSheet_('Leads', LEADS_HEADERS)
  const rows = readRows_(sheet, LEADS_HEADERS)
  const duplicate = rows.find(function (row) { return row.request_id === payload.request_id })
  if (duplicate) return { ok: true, lead_code: duplicate.lead_code, expires_at: duplicate.expires_at, duplicate: true }
  const existingCodes = new Set(rows.map(function (row) { return row.lead_code }))
  const createdAt = new Date()
  const row = {
    lead_id: `LD-${Utilities.getUuid()}`,
    lead_code: generateUniqueLeadCode(existingCodes),
    created_at: createdAt.toISOString(),
    expires_at: new Date(createdAt.getTime() + 14 * DAY_MS).toISOString(),
    status: 'pending', contact_name: String(payload.contact_name || '').trim(), phone: String(payload.phone || ''),
    service_area: String(payload.service_area || '').trim(), plan_type: String(payload.plan_type || ''),
    plan_summary: String(payload.plan_summary || ''), consent_version: String(payload.consent_version || ''),
    consented_at: String(payload.consented_at || ''), app_version: String(payload.app_version || ''),
    source: String(payload.source || 'care-navigator'), confirmed_at: '', contacted_at: '',
    resume_token_hash: sha256Hex_(payload.recovery_token), request_id: String(payload.request_id),
  }
  sheet.appendRow(LEADS_HEADERS.map(function (key) { return row[key] }))
  return { ok: true, lead_code: row.lead_code, expires_at: row.expires_at, duplicate: false }
}

function recoverPlan_(payload) {
  const row = findLead_(payload && payload.lead_code)
  if (!row || row.status === 'expired' || Date.parse(row.expires_at) <= Date.now()) return { ok: false, error: 'not_available' }
  if (row.resume_token_hash !== sha256Hex_(payload.recovery_token || '')) return { ok: false, error: 'not_available' }
  return { ok: true, lead_code: row.lead_code, plan_type: row.plan_type, plan_summary: row.plan_summary, expires_at: row.expires_at }
}

function lookupLead_(payload) {
  const code = String(payload && payload.lead_code || '')
  const row = LEAD_CODE_PATTERN.test(code) ? findLead_(code) : null
  let resultCode = !LEAD_CODE_PATTERN.test(code) ? 'invalid_code' : !row ? 'not_found' : row.status === 'expired' || Date.parse(row.expires_at) <= Date.now() ? 'expired' : row.status === 'pending' ? 'found' : 'already_confirmed'
  appendObject_('Lookup Audit', LOOKUP_AUDIT_HEADERS, { lookup_id: `LU-${Utilities.getUuid()}`, lead_id: row ? row.lead_id : '', looked_up_at: new Date().toISOString(), actor_type: String(payload && payload.actor_type || 'official_chatbot'), result_code: resultCode })
  if (!row || !['found', 'already_confirmed'].includes(resultCode)) return { ok: false, error: 'not_available' }
  return { ok: true, lead_code: row.lead_code, contact_name_masked: maskName(row.contact_name), phone_masked: maskPhone(row.phone), service_area: row.service_area, plan_type: row.plan_type, plan_summary: row.plan_summary, status: row.status, expires_at: row.expires_at }
}

function updateLeadStatus_(payload) {
  const found = findLeadWithSheetRow_(payload && payload.lead_code)
  if (!found || !STATUS_TRANSITIONS[found.data.status].includes(payload.to_status)) return { ok: false, error: 'invalid_transition' }
  const changedAt = new Date().toISOString()
  const from = found.data.status
  found.data.status = payload.to_status
  if (payload.to_status === 'confirmed') found.data.confirmed_at = changedAt
  if (payload.to_status === 'contacted') found.data.contacted_at = changedAt
  found.sheet.getRange(found.rowNumber, 1, 1, LEADS_HEADERS.length).setValues([LEADS_HEADERS.map(function (key) { return found.data[key] })])
  appendObject_('Status History', STATUS_HISTORY_HEADERS, { change_id: `CH-${Utilities.getUuid()}`, lead_id: found.data.lead_id, changed_at: changedAt, from_status: from, to_status: payload.to_status, actor_type: String(payload.actor_type || 'owner'), reason_code: String(payload.reason_code || 'manual') })
  return { ok: true, status: payload.to_status }
}

function expireLeads() {
  return withScriptLock_(function () {
    const sheet = getSheet_('Leads', LEADS_HEADERS)
    const rows = readRows_(sheet, LEADS_HEADERS)
    const history = readRows_(getSheet_('Status History', STATUS_HISTORY_HEADERS), STATUS_HISTORY_HEADERS)
    const nowMs = Date.now()
    let purged = 0
    rows.forEach(function (row, index) {
      const changes = history.filter(function (item) { return item.lead_id === row.lead_id })
      const base = changes.length ? Date.parse(changes[changes.length - 1].changed_at) : Date.parse(row.created_at)
      const due = row.status === 'pending' && Date.parse(row.expires_at) <= nowMs
        || ['confirmed', 'contacted'].includes(row.status) && nowMs - base >= 90 * DAY_MS
        || ['converted', 'closed'].includes(row.status) && nowMs - base >= 30 * DAY_MS
      if (!due || !row.contact_name && !row.phone && !row.plan_summary) return
      const from = row.status
      row.contact_name = ''; row.phone = ''; row.service_area = ''; row.plan_summary = ''; row.resume_token_hash = ''; row.status = 'expired'
      sheet.getRange(index + 2, 1, 1, LEADS_HEADERS.length).setValues([LEADS_HEADERS.map(function (key) { return row[key] })])
      appendObject_('Status History', STATUS_HISTORY_HEADERS, { change_id: `CH-${Utilities.getUuid()}`, lead_id: row.lead_id, changed_at: new Date().toISOString(), from_status: from, to_status: 'expired', actor_type: 'system', reason_code: 'retention_expired' })
      purged += 1
    })
    return { ok: true, purged: purged }
  })
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('LEAD_SPREADSHEET_ID')
  if (!id) throw new Error('missing_spreadsheet_id')
  return SpreadsheetApp.openById(id)
}
function getSheet_(name, headers) { return ensureSheet_(getSpreadsheet_(), name, headers) }
function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name)
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.setFrozenRows(1)
  if (!sheet.getFilter() && sheet.getLastRow() > 0) sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).createFilter()
  return sheet
}
function readRows_(sheet, headers) {
  if (sheet.getLastRow() < 2) return []
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues().map(function (values) { const row = {}; headers.forEach(function (key, index) { row[key] = values[index] }); return row })
}
function appendObject_(name, headers, value) { getSheet_(name, headers).appendRow(headers.map(function (key) { return value[key] || '' })) }
function findLead_(leadCode) { const found = findLeadWithSheetRow_(leadCode); return found ? found.data : null }
function findLeadWithSheetRow_(leadCode) {
  const sheet = getSheet_('Leads', LEADS_HEADERS)
  const rows = readRows_(sheet, LEADS_HEADERS)
  const index = rows.findIndex(function (row) { return row.lead_code === leadCode })
  return index < 0 ? null : { data: rows[index], rowNumber: index + 2, sheet: sheet }
}
function withScriptLock_(callback) { const lock = LockService.getScriptLock(); lock.waitLock(10000); try { return callback() } finally { lock.releaseLock() } }
function randomBytes_(length) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, `${Utilities.getUuid()}|${Utilities.getUuid()}|${Date.now()}`, Utilities.Charset.UTF_8)
  return digest.slice(0, length).map(function (value) { return value < 0 ? value + 256 : value })
}
function sha256Hex_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8)
  return bytes.map(function (item) { const value = item < 0 ? item + 256 : item; return (`0${value.toString(16)}`).slice(-2) }).join('')
}
function uuid_() { return typeof Utilities !== 'undefined' ? Utilities.getUuid() : `${Date.now()}-${Math.random().toString(16).slice(2)}` }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON) }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LEADS_HEADERS, STATUS_HISTORY_HEADERS, LOOKUP_AUDIT_HEADERS, LEAD_CODE_PATTERN, verifyEnvelope, generateLeadCode, generateUniqueLeadCode, maskName, maskPhone, createMemoryRegistry }
}
