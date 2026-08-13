import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import test from 'node:test'

import { createGoogleAccessTokenProvider } from '../src/google-auth.mjs'
import { createSheetsApi } from '../src/sheets-api.mjs'
import { createStorageClient } from '../src/storage-client.mjs'
import { createSheetsStorageFromEnvironment } from '../src/sheets-runtime.mjs'
import {
  LEADS_HEADERS,
  LOOKUP_AUDIT_HEADERS,
  STATUS_HISTORY_HEADERS,
  createSheetsStorage,
} from '../src/sheets-storage.mjs'

function decodeBase64Url(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
}

function createFakeSheetsApi() {
  const tabs = new Map([
    ['Leads', [[...LEADS_HEADERS]]],
    ['Status History', [[...STATUS_HISTORY_HEADERS]]],
    ['Lookup Audit', [[...LOOKUP_AUDIT_HEADERS]]],
    ['Data Dictionary', [['field', 'meaning', 'sensitivity', 'retention']]],
  ])
  return {
    tabs,
    async getValues(tab) {
      return tabs.get(tab).map((row) => [...row])
    },
    async appendValues(tab, rows) {
      tabs.get(tab).push(...rows.map((row) => [...row]))
      return { updatedRows: rows.length }
    },
    async updateValues(tab, range, rows) {
      const rowNumber = Number(String(range).match(/A(\d+):/)?.[1])
      tabs.get(tab)[rowNumber - 1] = [...rows[0]]
      return { updatedRows: rows.length }
    },
  }
}

test('service-account provider creates a narrow short-lived JWT and caches its token', async () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  const requests = []
  const now = () => new Date('2026-08-13T08:00:00.000Z')
  const provider = createGoogleAccessTokenProvider({
    clientEmail: 'care-navigator@example.iam.gserviceaccount.com',
    privateKey: pem,
    now,
    fetchImpl: async (url, options) => {
      requests.push({ url, options })
      return { ok: true, json: async () => ({ access_token: 'access-token', expires_in: 3600 }) }
    },
  })

  assert.equal(await provider(), 'access-token')
  assert.equal(await provider(), 'access-token')
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://oauth2.googleapis.com/token')
  const form = new URLSearchParams(requests[0].options.body)
  assert.equal(form.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer')
  const [header, payload] = form.get('assertion').split('.')
  assert.equal(decodeBase64Url(header).alg, 'RS256')
  const claims = decodeBase64Url(payload)
  assert.equal(claims.iss, 'care-navigator@example.iam.gserviceaccount.com')
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/spreadsheets')
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token')
  assert.equal(claims.exp - claims.iat, 3600)
})

test('Sheets API restricts spreadsheet and tab names', async () => {
  const urls = []
  const api = createSheetsApi({
    spreadsheetId: 'approved-sheet-id',
    allowedSpreadsheetId: 'approved-sheet-id',
    accessToken: async () => 'token',
    fetchImpl: async (url) => {
      urls.push(url)
      return { ok: true, json: async () => ({ values: [['ok']] }) }
    },
  })
  assert.deepEqual(await api.getValues('Leads', 'A1:R10'), [['ok']])
  assert.match(urls[0], /approved-sheet-id/)
  await assert.rejects(() => api.getValues('Unknown', 'A1:A2'), /sheets_tab_not_allowed/)
  assert.throws(() => createSheetsApi({ spreadsheetId: 'wrong', allowedSpreadsheetId: 'approved' }), /sheets_spreadsheet_not_allowed/)
})

test('Sheets API retries one transient response and never exposes its body', async () => {
  let attempts = 0
  const api = createSheetsApi({
    spreadsheetId: 'approved-sheet-id',
    allowedSpreadsheetId: 'approved-sheet-id',
    accessToken: async () => 'token',
    sleep: async () => {},
    fetchImpl: async () => {
      attempts += 1
      if (attempts === 1) return { ok: false, status: 429, text: async () => 'private upstream detail' }
      return { ok: true, status: 200, json: async () => ({ values: [['ok']] }) }
    },
  })
  assert.deepEqual(await api.getValues('Leads', 'A1:R10'), [['ok']])
  assert.equal(attempts, 2)
})

test('storage client selects direct Sheets storage only when explicitly configured', async () => {
  const calls = []
  const client = createStorageClient({
    storageDriver: 'sheets',
    sheetsStorage: async (...args) => { calls.push(args); return { ok: true } },
  })
  assert.deepEqual(await client('expireLeads', {}, 'request-id'), { ok: true })
  assert.deepEqual(calls, [['expireLeads', {}, 'request-id']])
})

test('runtime loads only an explicit service-account credential file', async () => {
  const reads = []
  const storage = createSheetsStorageFromEnvironment({
    env: {
      LEAD_SPREADSHEET_ID: 'approved-sheet-id',
      GOOGLE_SERVICE_ACCOUNT_FILE: '/run/secrets/google-service-account.json',
    },
    readFile: async (path) => {
      reads.push(path)
      return JSON.stringify({
        type: 'service_account',
        client_email: 'care-navigator@example.iam.gserviceaccount.com',
        private_key: 'private-key-placeholder',
      })
    },
    accessTokenFactory: ({ clientEmail, privateKey }) => {
      assert.equal(clientEmail, 'care-navigator@example.iam.gserviceaccount.com')
      assert.equal(privateKey, 'private-key-placeholder')
      return async () => 'token'
    },
    sheetsApiFactory: ({ spreadsheetId, allowedSpreadsheetId }) => {
      assert.equal(spreadsheetId, 'approved-sheet-id')
      assert.equal(allowedSpreadsheetId, 'approved-sheet-id')
      return createFakeSheetsApi()
    },
  })
  assert.equal(typeof await storage, 'function')
  assert.deepEqual(reads, ['/run/secrets/google-service-account.json'])
})

test('runtime rejects non-service-account and malformed credential files', async () => {
  const base = {
    env: { LEAD_SPREADSHEET_ID: 'approved', GOOGLE_SERVICE_ACCOUNT_FILE: '/secret.json' },
    sheetsApiFactory: () => createFakeSheetsApi(),
    accessTokenFactory: () => async () => 'token',
  }
  await assert.rejects(
    () => createSheetsStorageFromEnvironment({ ...base, readFile: async () => JSON.stringify({ type: 'authorized_user' }) }),
    /google_service_account_invalid/,
  )
  await assert.rejects(
    () => createSheetsStorageFromEnvironment({ ...base, readFile: async () => '{bad-json' }),
    /google_service_account_invalid/,
  )
})

test('Sheets storage preserves create, recovery, status, audit, and purge contracts', async () => {
  const api = createFakeSheetsApi()
  let now = new Date('2026-08-13T08:00:00.000Z')
  let sequence = 0
  const storage = createSheetsStorage({
    api,
    now: () => new Date(now),
    randomBytes: () => Uint8Array.from({ length: 16 }, (_, index) => index + sequence),
    uuid: () => `uuid-${++sequence}`,
    hash: (value) => `hash:${value}`,
  })
  const payload = {
    schema_version: 1,
    request_id: '06f243c5-1ca8-489f-95f5-fc528ef99891',
    contact_name: 'Synthetic Test',
    phone: '0800000000',
    service_area: 'Chonburi synthetic',
    plan_type: 'walk-confidence',
    plan_summary: 'SYNTHETIC TEST ONLY',
    consent_version: 'lead-temp-v1',
    consented_at: '2026-08-13T08:00:00.000Z',
    app_version: 'synthetic-test',
    source: 'care-navigator',
    recovery_token: 'synthetic-recovery-token',
  }

  const created = await storage('createLead', payload, payload.request_id)
  assert.equal(created.ok, true)
  assert.match(created.lead_code, /^CN-(?:[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-){3}[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/)
  assert.equal(api.tabs.get('Leads').length, 2)
  const duplicate = await storage('createLead', payload, payload.request_id)
  assert.equal(duplicate.duplicate, true)
  assert.equal(duplicate.lead_code, created.lead_code)
  assert.equal(api.tabs.get('Leads').length, 2)

  const wrong = await storage('recoverPlan', { lead_code: created.lead_code, recovery_token: 'wrong-token' }, 'recover-wrong')
  assert.deepEqual(wrong, { ok: false, error: 'not_available' })
  const recovered = await storage('recoverPlan', { lead_code: created.lead_code, recovery_token: 'synthetic-recovery-token' }, 'recover-good')
  assert.deepEqual(Object.keys(recovered).sort(), ['expires_at', 'lead_code', 'ok', 'plan_summary', 'plan_type'].sort())
  assert.equal(recovered.plan_summary, 'SYNTHETIC TEST ONLY')

  const lookup = await storage('lookupLead', { lead_code: created.lead_code, actor_type: 'official_chatbot' }, 'lookup')
  assert.equal(lookup.contact_name_masked, 'S***')
  assert.equal(lookup.phone_masked, '******0000')
  assert.equal(api.tabs.get('Lookup Audit').at(-1)[6 - 2], 'found')
  assert.equal(await storage('updateLeadStatus', { lead_code: created.lead_code, to_status: 'contacted' }, 'bad-transition').then((value) => value.ok), false)
  assert.equal(await storage('confirmLead', { lead_code: created.lead_code, actor_type: 'official_chatbot' }, 'confirm').then((value) => value.ok), true)
  assert.equal(await storage('updateLeadStatus', { lead_code: created.lead_code, to_status: 'contacted', actor_type: 'owner' }, 'contact').then((value) => value.ok), true)

  now = new Date('2026-11-13T08:00:00.000Z')
  const expired = await storage('expireLeads', {}, 'expiry')
  assert.equal(expired.ok, true)
  assert.equal(expired.purged, 1)
  const lead = Object.fromEntries(LEADS_HEADERS.map((key, index) => [key, api.tabs.get('Leads')[1][index]]))
  assert.equal(lead.status, 'expired')
  assert.equal(lead.contact_name, '')
  assert.equal(lead.phone, '')
  assert.equal(lead.service_area, '')
  assert.equal(lead.plan_summary, '')
  assert.equal(lead.resume_token_hash, '')
})

test('Sheets storage fails closed when workbook headers drift', async () => {
  const api = createFakeSheetsApi()
  api.tabs.get('Leads')[0][0] = 'changed_header'
  const storage = createSheetsStorage({ api })
  await assert.rejects(
    () => storage('createLead', { request_id: 'synthetic' }, 'synthetic'),
    /sheets_schema_mismatch/,
  )
})
