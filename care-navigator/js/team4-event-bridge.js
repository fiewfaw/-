(function attachTeam4Events(root) {
  const events = root.CareNavigatorEvents
  if (!events || !root.document) return

  const safeValue = (value, fallback) => {
    const normalized = String(value || '').trim().replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 120)
    return normalized || fallback
  }
  const fileName = root.location?.pathname?.split('/').pop() || 'team4'
  const assetId = safeValue(fileName.replace(/\.html$/i, ''), 'team4')
  const search = new URLSearchParams(root.location?.search || '')
  const sourceValue = String(search.get('utm_source') || '').toLowerCase()
  const campaignId = safeValue(search.get('utm_campaign'), '').slice(0, 100)
  const discoverySource = sourceValue.includes('facebook') || sourceValue === 'fb' || sourceValue === 'meta'
    ? (campaignId ? 'facebook_paid' : 'facebook_organic')
    : sourceValue.includes('google') ? 'google_organic'
      : /chatgpt|gemini|claude|perplexity|ai/.test(sourceValue) ? 'ai_referral'
        : sourceValue ? 'other' : 'direct'
  const dimensions = {
    asset_type: 'care_navigator',
    asset_id: assetId,
    discovery_source: discoverySource,
    entry_variant: 'team4_result',
  }
  const creativeId = safeValue(search.get('utm_content'), '').slice(0, 100)
  if (campaignId) dimensions.campaign_id = campaignId
  if (creativeId) dimensions.creative_id = creativeId

  events.track('team4_viewed', dimensions)

  let planTracked = false
  const resultSelectors = [
    '.starter.personalized',
    '#personalPlan.show',
    '.personal-plan.show',
    '.personalized:not([hidden])',
    '[data-personal-plan-result].show',
  ]
  const resultIsVisible = () => resultSelectors.some((selector) => {
    const element = root.document.querySelector(selector)
    return element && !element.hidden
  })
  const trackPlan = () => {
    if (planTracked || !resultIsVisible()) return
    planTracked = true
    events.track('personal_plan_created', dimensions)
  }
  trackPlan()
  new MutationObserver(trackPlan).observe(root.document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['class', 'hidden'],
  })

  const clipboard = root.navigator?.clipboard
  if (clipboard?.writeText) {
    try {
      const originalWriteText = clipboard.writeText.bind(clipboard)
      clipboard.writeText = async (value) => {
        const result = await originalWriteText(value)
        events.track('ai_summary_copied', dimensions)
        return result
      }
    } catch {}
  }
})(globalThis)
