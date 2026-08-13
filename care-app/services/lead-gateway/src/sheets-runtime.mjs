import { readFile as nodeReadFile } from 'node:fs/promises'

import { createGoogleAccessTokenProvider } from './google-auth.mjs'
import { createSheetsApi } from './sheets-api.mjs'
import { createSheetsStorage } from './sheets-storage.mjs'

export async function createSheetsStorageFromEnvironment(options = {}) {
  const env = options.env || process.env
  const readFile = options.readFile || ((path) => nodeReadFile(path, 'utf8'))
  const accessTokenFactory = options.accessTokenFactory || createGoogleAccessTokenProvider
  const sheetsApiFactory = options.sheetsApiFactory || createSheetsApi
  const spreadsheetId = String(env.LEAD_SPREADSHEET_ID || '')
  const credentialFile = String(env.GOOGLE_SERVICE_ACCOUNT_FILE || '')
  if (!spreadsheetId || !credentialFile) throw new Error('sheets_runtime_not_configured')

  let credential
  try {
    credential = JSON.parse(await readFile(credentialFile))
  } catch {
    throw new Error('google_service_account_invalid')
  }
  if (credential?.type !== 'service_account'
    || typeof credential.client_email !== 'string' || !credential.client_email.endsWith('.iam.gserviceaccount.com')
    || typeof credential.private_key !== 'string' || !credential.private_key) {
    throw new Error('google_service_account_invalid')
  }

  const accessToken = accessTokenFactory({ clientEmail: credential.client_email, privateKey: credential.private_key })
  const api = sheetsApiFactory({ spreadsheetId, allowedSpreadsheetId: spreadsheetId, accessToken })
  return createSheetsStorage({ api })
}

