import { createHmac, randomBytes as nodeRandomBytes, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

import { validateCreateInput, validateRecoveryInput } from './contracts.mjs'
import { createStorageClient } from './storage-client.mjs'

const MAX_BODY_BYTES = 16 * 1024
const PRODUCTION_ORIGIN = 'https://baankaiyaphap-chonburi.com'

function isAllowedOrigin(origin) {
  return origin === PRODUCTION_ORIGIN || /^http:\/\/(?:localhost|127\.0\.0\.1):[0-9]{2,5}$/.test(origin || '')
}

function sendJson(response, status, value, origin) {
  const body = JSON.stringify(value)
  response.statusCode = status
  response.setHeader('content-type', 'application/json;charset=UTF-8')
  response.setHeader('cache-control', 'no-store')
  response.setHeader('x-content-type-options', 'nosniff')
  if (origin && isAllowedOrigin(origin)) {
    response.setHeader('access-control-allow-origin', origin)
    response.setHeader('vary', 'Origin')
  }
  response.end(body)
}

async function readJsonBody(request) {
  const declared = Number(request.headers['content-length'] || 0)
  if (declared > MAX_BODY_BYTES) throw Object.assign(new Error('body_too_large'), { status: 413 })
  const chunks = []
  let total = 0
  for await (const chunk of request) {
    total += chunk.length
    if (total > MAX_BODY_BYTES) throw Object.assign(new Error('body_too_large'), { status: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('invalid_json'), { status: 400 })
  }
}

function createRateLimiter({ max = 30, windowMs = 60000 } = {}) {
  const buckets = new Map()
  return function allow(key) {
    const now = Date.now()
    const current = buckets.get(key)
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }
    current.count += 1
    return current.count <= max
  }
}

function safeLog(logger, level, value) {
  const method = logger && typeof logger[level] === 'function' ? logger[level] : null
  if (method) method(value)
}

function storageFailureCode(error) {
  if (error && error.name === 'TimeoutError') return 'timeout'
  if (error && error.message === 'lead_storage_http_error') return 'http_error'
  if (error && error.message === 'lead_storage_invalid_response') return 'invalid_response'
  if (error && error.message === 'storage_rejected') return 'rejected'
  return 'unknown'
}

export function createLeadGateway(options = {}) {
  const storageClient = options.storageClient || createStorageClient(options)
  const tokenBytes = options.tokenBytes || nodeRandomBytes
  const recoverySecret = options.recoverySecret || process.env.LEAD_RECOVERY_SECRET || ''
  if (!options.storageClient && recoverySecret.length < 32) throw new Error('lead_recovery_secret_not_configured')
  const logger = options.logger || console
  const allowRequest = createRateLimiter(options.rateLimit)

  return createServer(async (request, response) => {
    const origin = String(request.headers.origin || '')
    const path = new URL(request.url || '/', 'http://gateway.local').pathname
    let requestId = randomUUID()
    let resultCode = 'unknown'
    let failureCode = ''
    let status = 500
    try {
      if (request.method === 'GET' && path === '/healthz') {
        status = 200; resultCode = 'healthy'; return sendJson(response, status, { ok: true })
      }
      if (!isAllowedOrigin(origin)) {
        status = 403; resultCode = 'origin_rejected'; return sendJson(response, status, { ok: false, error: 'origin_rejected' })
      }
      if (request.method === 'OPTIONS') {
        response.statusCode = 204
        response.setHeader('access-control-allow-origin', origin)
        response.setHeader('access-control-allow-methods', 'POST, OPTIONS')
        response.setHeader('access-control-allow-headers', 'content-type')
        response.setHeader('access-control-max-age', '600')
        status = 204; resultCode = 'preflight'; return response.end()
      }
      if (request.method !== 'POST' || !['/v1/leads', '/v1/leads/recover'].includes(path)) {
        status = 404; resultCode = 'not_found'; return sendJson(response, status, { ok: false, error: 'not_found' }, origin)
      }
      if (!String(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
        status = 415; resultCode = 'unsupported_media_type'; return sendJson(response, status, { ok: false, error: 'json_required' }, origin)
      }
      const rateKey = `${request.socket.remoteAddress || 'unknown'}|${origin}`
      if (!allowRequest(rateKey)) {
        status = 429; resultCode = 'rate_limited'; return sendJson(response, status, { ok: false, error: 'try_again_later' }, origin)
      }
      const input = await readJsonBody(request)
      if (typeof input.request_id === 'string') requestId = input.request_id.slice(0, 64)
      if (path === '/v1/leads') {
        const checked = validateCreateInput(input)
        if (!checked.ok) {
          status = 400; resultCode = checked.error; return sendJson(response, status, { ok: false, error: 'invalid_input' }, origin)
        }
        const recoveryToken = recoverySecret
          ? createHmac('sha256', recoverySecret).update(checked.value.request_id).digest('base64url')
          : Buffer.from(tokenBytes(32)).toString('base64url')
        const stored = await storageClient('createLead', { ...checked.value, source: 'care-navigator', recovery_token: recoveryToken }, checked.value.request_id)
        if (!stored.ok) throw new Error('storage_rejected')
        status = stored.duplicate ? 200 : 201; resultCode = stored.duplicate ? 'duplicate' : 'created'
        return sendJson(response, status, { ok: true, lead_code: stored.lead_code, recovery_token: recoveryToken, expires_at: stored.expires_at }, origin)
      }
      const checked = validateRecoveryInput(input)
      if (!checked.ok) {
        status = 400; resultCode = checked.error; return sendJson(response, status, { ok: false, error: 'invalid_input' }, origin)
      }
      const recovered = await storageClient('recoverPlan', checked.value, requestId)
      if (!recovered.ok) {
        status = 404; resultCode = 'not_available'; return sendJson(response, status, { ok: false, error: 'not_available' }, origin)
      }
      status = 200; resultCode = 'recovered'
      return sendJson(response, status, { ok: true, lead_code: recovered.lead_code, plan_type: recovered.plan_type, plan_summary: recovered.plan_summary, expires_at: recovered.expires_at }, origin)
    } catch (error) {
      status = Number(error && error.status) || 503
      resultCode = status === 413 ? 'body_too_large' : status === 400 ? 'invalid_json' : 'storage_unavailable'
      if (status >= 500) failureCode = storageFailureCode(error)
      return sendJson(response, status, { ok: false, error: resultCode }, origin)
    } finally {
      const logEntry = { event: 'lead_gateway_request', request_id: requestId, path, result_code: resultCode, status }
      if (failureCode) logEntry.failure_code = failureCode
      safeLog(logger, status >= 500 ? 'error' : 'info', logEntry)
    }
  })
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  const port = Number(process.env.PORT || 8787)
  createLeadGateway().listen(port, '0.0.0.0', () => console.log(JSON.stringify({ event: 'lead_gateway_started', port })))
}
