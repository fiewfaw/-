export function createStorageClient(options = {}) {
  const storageUrl = options.storageUrl || process.env.LEAD_STORAGE_URL
  const storageSecret = options.storageSecret || process.env.LEAD_STORAGE_SECRET
  const fetchImpl = options.fetchImpl || fetch
  if (!storageUrl || !storageSecret) throw new Error('lead_storage_not_configured')

  return async function postStorageAction(action, payload, requestId) {
    const envelope = { action, gateway_secret: storageSecret, request_id: requestId, payload }
    const body = new URLSearchParams({ payload: JSON.stringify(envelope) })
    const response = await fetchImpl(storageUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('lead_storage_http_error')
    const result = await response.json()
    if (!result || typeof result !== 'object') throw new Error('lead_storage_invalid_response')
    return result
  }
}
