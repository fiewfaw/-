const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const ALLOWED_TABS = new Set(['Leads', 'Status History', 'Lookup Audit', 'Data Dictionary'])

function checkTab(tab) {
  if (!ALLOWED_TABS.has(tab)) throw new Error('sheets_tab_not_allowed')
}

function encodeRange(tab, range) {
  checkTab(tab)
  if (!/^[A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?$/.test(String(range))) throw new Error('sheets_range_not_allowed')
  return encodeURIComponent(`'${tab.replaceAll("'", "''")}'!${range}`)
}

export function createSheetsApi(options = {}) {
  const spreadsheetId = String(options.spreadsheetId || '')
  const allowedSpreadsheetId = String(options.allowedSpreadsheetId || spreadsheetId)
  const accessToken = options.accessToken
  const fetchImpl = options.fetchImpl || fetch
  const sleep = options.sleep || ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
  if (!spreadsheetId || spreadsheetId !== allowedSpreadsheetId) throw new Error('sheets_spreadsheet_not_allowed')
  if (typeof accessToken !== 'function') throw new Error('sheets_access_token_not_configured')

  async function request(url, init = {}) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = await accessToken()
      const response = await fetchImpl(url, {
        ...init,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json;charset=UTF-8', ...(init.headers || {}) },
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const status = Number(response.status) || 0
        const transient = status === 429 || status >= 500
        if (attempt === 0 && transient) {
          await sleep(250)
          continue
        }
        const error = status === 401 || status === 403
          ? 'sheets_permission_denied'
          : transient ? 'sheets_temporarily_unavailable' : 'sheets_request_failed'
        throw new Error(error)
      }
      const result = await response.json().catch(() => null)
      if (!result || typeof result !== 'object') throw new Error('sheets_invalid_response')
      return result
    }
    throw new Error('sheets_temporarily_unavailable')
  }

  return {
    async getValues(tab, range) {
      const result = await request(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeRange(tab, range)}?majorDimension=ROWS`)
      return Array.isArray(result.values) ? result.values : []
    },
    async appendValues(tab, rows) {
      checkTab(tab)
      const result = await request(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeRange(tab, 'A1')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
        method: 'POST', body: JSON.stringify({ majorDimension: 'ROWS', values: rows }),
      })
      return { updatedRows: Number(result.updates?.updatedRows) || 0 }
    },
    async updateValues(tab, range, rows) {
      const result = await request(`${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeRange(tab, range)}?valueInputOption=RAW`, {
        method: 'PUT', body: JSON.stringify({ majorDimension: 'ROWS', values: rows }),
      })
      return { updatedRows: Number(result.updatedRows) || 0 }
    },
  }
}

export { ALLOWED_TABS }
