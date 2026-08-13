export function createStorageClient(options = {}) {
  const storageUrl = options.storageUrl || process.env.LEAD_STORAGE_URL
  const storageSecret = options.storageSecret || process.env.LEAD_STORAGE_SECRET
  const fetchImpl = options.fetchImpl || fetch
  const timeoutSignal = options.timeoutSignal || AbortSignal.timeout
  if (!storageUrl || !storageSecret) throw new Error('lead_storage_not_configured')

  return async function postStorageAction(action, payload, requestId) {
    const envelope = { action, gateway_secret: storageSecret, request_id: requestId, payload }
    const body = new URLSearchParams({ payload: JSON.stringify(envelope) })
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetchImpl(storageUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body,
          redirect: 'follow',
          signal: timeoutSignal(30000),
        })
        if (!response.ok) throw Object.assign(new Error('lead_storage_http_error'), { storageStatus: Number(response.status) || 0 })
        const result = await response.json()
        if (!result || typeof result !== 'object') throw new Error('lead_storage_invalid_response')
        return result
      } catch (error) {
        const transientHttp = error && error.message === 'lead_storage_http_error'
          && (error.storageStatus === 429 || error.storageStatus >= 500)
        const retryable = error && (error.name === 'TimeoutError' || error instanceof SyntaxError || error.message === 'lead_storage_invalid_response' || transientHttp)
        if (attempt === 0 && retryable) continue
        if (error && error.name === 'TimeoutError') throw error
        if (error && error.message === 'lead_storage_http_error') throw error
        throw new Error('lead_storage_invalid_response')
      }
    }
    throw new Error('lead_storage_invalid_response')
  }
}
