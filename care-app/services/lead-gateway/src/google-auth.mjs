import { createSign } from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function createGoogleAccessTokenProvider(options = {}) {
  const clientEmail = String(options.clientEmail || '')
  const privateKey = String(options.privateKey || '')
  const fetchImpl = options.fetchImpl || fetch
  const now = options.now || (() => new Date())
  if (!clientEmail || !privateKey) throw new Error('google_credentials_not_configured')
  let cached = null

  return async function getAccessToken() {
    const nowSeconds = Math.floor(now().getTime() / 1000)
    if (cached && cached.expiresAt - nowSeconds > 60) return cached.value

    const header = encode({ alg: 'RS256', typ: 'JWT' })
    const claims = encode({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    })
    const unsigned = `${header}.${claims}`
    const signer = createSign('RSA-SHA256')
    signer.update(unsigned)
    signer.end()
    const assertion = `${unsigned}.${signer.sign(privateKey).toString('base64url')}`
    const response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error('google_auth_failed')
    const result = await response.json().catch(() => null)
    if (!result || typeof result.access_token !== 'string' || !result.access_token) throw new Error('google_auth_invalid_response')
    const expiresIn = Math.min(Math.max(Number(result.expires_in) || 3600, 60), 3600)
    cached = { value: result.access_token, expiresAt: nowSeconds + expiresIn }
    return cached.value
  }
}

