(function attachCareNavigatorEvents(root, factory) {
  const api = factory(root)
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.CareNavigatorEvents = api.client
})(typeof globalThis !== 'undefined' ? globalThis : this, function createApi(root) {
  const EVENT_NAMES = new Set([
    'discovery_entry', 'authority_asset_viewed', 'app_started',
    'team4_viewed', 'personal_plan_created', 'ai_summary_copied',
  ])
  const DIMENSION_KEYS = new Set([
    'discovery_source', 'asset_type', 'asset_id', 'entry_variant',
    'campaign_id', 'creative_id', 'app_version',
  ])
  const QUEUE_KEY = 'care_navigator_event_queue_v1'
  const SESSION_KEY = 'care_navigator_anonymous_session_v1'
  const ATTRIBUTION_KEY = 'care_navigator_attribution_v1'
  const MAX_QUEUE = 50
  const MAX_BATCH = 10
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const SAFE_VALUE_PATTERN = /^[A-Za-z0-9._-]{1,120}$/
  const FORBIDDEN_KEY_PATTERN = /name|phone|email|diagnosis|symptom|answer|score|plan|message|url|coordinate|latitude|longitude|location/i

  function safeAttributionValue(value, maxLength = 100) {
    const normalized = String(value || '').trim().replace(/[^A-Za-z0-9._-]/g, '-').slice(0, maxLength)
    return normalized || ''
  }

  function mapDiscoverySource(value, hasCampaign) {
    const source = String(value || '').toLowerCase()
    if (source.includes('facebook') || source === 'fb' || source === 'meta') {
      return hasCampaign ? 'facebook_paid' : 'facebook_organic'
    }
    if (source.includes('google')) return 'google_organic'
    if (/chatgpt|gemini|claude|perplexity|ai/.test(source)) return 'ai_referral'
    return source ? 'other' : ''
  }

  function readAttribution(browser, store) {
    try {
      const params = new URLSearchParams(browser.location?.search || '')
      const campaignId = safeAttributionValue(params.get('utm_campaign'))
      const creativeId = safeAttributionValue(params.get('utm_content'))
      const source = mapDiscoverySource(params.get('utm_source'), Boolean(campaignId))
      if (source) {
        const captured = { discovery_source: source }
        if (campaignId) captured.campaign_id = campaignId
        if (creativeId) captured.creative_id = creativeId
        store.setItem(ATTRIBUTION_KEY, JSON.stringify(captured))
        return captured
      }

      const stored = JSON.parse(store.getItem(ATTRIBUTION_KEY) || '{}')
      if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
      const restored = {}
      if (['google_organic', 'google_business_profile', 'facebook_organic', 'facebook_paid', 'ai_referral', 'word_of_mouth', 'direct', 'other'].includes(stored.discovery_source)) {
        restored.discovery_source = stored.discovery_source
      }
      const storedCampaign = safeAttributionValue(stored.campaign_id)
      const storedCreative = safeAttributionValue(stored.creative_id)
      if (storedCampaign) restored.campaign_id = storedCampaign
      if (storedCreative) restored.creative_id = storedCreative
      return restored
    } catch {
      return {}
    }
  }

  function applyAttribution(dimensions, attribution) {
    const enriched = Object.assign({}, dimensions)
    if (attribution.discovery_source && (!enriched.discovery_source || enriched.discovery_source === 'direct')) {
      enriched.discovery_source = attribution.discovery_source
    }
    if (!enriched.campaign_id && attribution.campaign_id) enriched.campaign_id = attribution.campaign_id
    if (!enriched.creative_id && attribution.creative_id) enriched.creative_id = attribution.creative_id
    return enriched
  }

  function normalizeEvent(event, context) {
    if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Invalid event')
    const eventKeys = new Set(['event_name', 'dimensions'])
    const unknownEventKeys = Object.keys(event).filter((key) => !eventKeys.has(key))
    if (unknownEventKeys.some((key) => FORBIDDEN_KEY_PATTERN.test(key))) throw new Error('Forbidden field')
    if (unknownEventKeys.length) throw new Error('Unknown field')
    if (!EVENT_NAMES.has(event.event_name)) throw new Error('Event is not allowlisted')
    if (!UUID_PATTERN.test(context.eventId || '') || !UUID_PATTERN.test(context.sessionId || '')) throw new Error('Invalid UUID')

    const supplied = event.dimensions || {}
    if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) throw new Error('Invalid dimensions')
    const keys = Object.keys(supplied)
    const unknownDimensionKeys = keys.filter((key) => !DIMENSION_KEYS.has(key))
    if (unknownDimensionKeys.some((key) => FORBIDDEN_KEY_PATTERN.test(key))) throw new Error('Forbidden field')
    if (unknownDimensionKeys.length) throw new Error('Unknown dimension')

    const dimensions = {}
    for (const key of keys) {
      if (typeof supplied[key] !== 'string' || !SAFE_VALUE_PATTERN.test(supplied[key])) throw new Error('Unsafe dimension')
      dimensions[key] = supplied[key]
    }
    if (!SAFE_VALUE_PATTERN.test(context.appVersion || '')) throw new Error('Invalid app version')
    dimensions.app_version = context.appVersion

    return {
      event_id: context.eventId,
      event_name: event.event_name,
      occurred_at: context.occurredAt,
      session_id: context.sessionId,
      dimensions,
    }
  }

  function createClient(options = {}) {
    const browser = options.root || root || {}
    const document = options.document || browser.document
    const script = options.script || document?.currentScript
    const store = options.storage || browser.sessionStorage
    const globalConfig = browser.CareNavigatorEventConfig || {}
    const endpoint = options.endpoint ?? script?.dataset?.endpoint ?? globalConfig.endpoint ?? ''
    const appVersion = options.appVersion ?? script?.dataset?.appVersion ?? globalConfig.appVersion ?? ''
    const uuid = options.uuid || (() => browser.crypto?.randomUUID?.())
    const now = options.now || (() => new Date().toISOString())
    const setTimer = options.setTimer || browser.setTimeout?.bind(browser)
    const doNotTrack = options.doNotTrack ?? browser.navigator?.doNotTrack
    const submitForm = options.submitForm || ((target, payload) => submitHiddenForm(document, target, payload))
    let flushScheduled = false

    function disabled() {
      try {
        return !store || doNotTrack === '1' || doNotTrack === 'yes' || store.getItem('care_navigator_analytics_opt_out') === '1'
      } catch {
        return true
      }
    }

    function readQueue() {
      try {
        const parsed = JSON.parse(store.getItem(QUEUE_KEY) || '[]')
        return Array.isArray(parsed) ? parsed.slice(-MAX_QUEUE) : []
      } catch {
        return []
      }
    }

    function writeQueue(queue) {
      store.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)))
    }

    function sessionId() {
      const existing = store.getItem(SESSION_KEY)
      if (UUID_PATTERN.test(existing || '')) return existing
      const created = uuid()
      if (!UUID_PATTERN.test(created || '')) throw new Error('Invalid session UUID')
      store.setItem(SESSION_KEY, created)
      return created
    }

    function scheduleFlush() {
      if (flushScheduled || typeof setTimer !== 'function') return
      flushScheduled = true
      setTimer(() => {
        flushScheduled = false
        void flush()
      }, 0)
    }

    function track(eventName, dimensions = {}) {
      if (disabled()) return false
      try {
        const queue = readQueue()
        const attributedDimensions = applyAttribution(dimensions, readAttribution(browser, store))
        const item = normalizeEvent({ event_name: eventName, dimensions: attributedDimensions }, {
          eventId: uuid(), sessionId: sessionId(), occurredAt: now(), appVersion,
        })
        if (!queue.some((event) => event.event_id === item.event_id)) queue.push(item)
        writeQueue(queue)
        scheduleFlush()
        return true
      } catch {
        return false
      }
    }

    async function flush() {
      if (disabled() || !endpoint) return
      try {
        const queue = readQueue()
        const events = queue.slice(0, MAX_BATCH)
        if (!events.length) return
        const dispatched = submitForm(endpoint, JSON.stringify({ schema_version: 1, events }))
        if (!dispatched) return
        const sentIds = new Set(events.map((event) => event.event_id))
        writeQueue(queue.filter((event) => !sentIds.has(event.event_id)))
      } catch {}
    }

    return { track, flush }
  }

  function submitHiddenForm(document, endpoint, payload) {
    if (!document?.body || !endpoint) return false
    const frameName = `care-event-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const iframe = document.createElement('iframe')
    iframe.name = frameName
    iframe.hidden = true
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = endpoint
    form.target = frameName
    form.hidden = true
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'payload'
    input.value = payload
    form.appendChild(input)
    document.body.append(iframe, form)
    form.submit()
    root.setTimeout?.(() => {
      form.remove()
      iframe.remove()
    }, 15000)
    return true
  }

  return { createClient, normalizeEvent, readAttribution, client: createClient() }
})
