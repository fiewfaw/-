(function attachSiteEvents(root) {
  const events = root.CareNavigatorEvents
  if (!events || !root.location) return

  const safeValue = (value, fallback) => {
    const normalized = String(value || '').trim().replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 120)
    return normalized || fallback
  }
  const path = root.location.pathname.replace(/\/+$/, '') || '/'
  const search = new URLSearchParams(root.location.search || '')
  const isArticle = /\/blog\/post\.html$/i.test(path)
  const isAbout = /\/about\.html$/i.test(path)
  const isBlogIndex = /\/blog$/i.test(path)
  const assetType = isArticle || isBlogIndex ? 'knowledge_article' : isAbout ? 'about_profile' : 'service_page'
  const assetId = isArticle
    ? safeValue(search.get('slug'), 'article')
    : isAbout ? 'about' : isBlogIndex ? 'blog_index' : 'home'
  const sourceValue = String(search.get('utm_source') || '').toLowerCase()
  const campaignId = safeValue(search.get('utm_campaign'), '')
  const discoverySource = sourceValue.includes('facebook') || sourceValue === 'fb' || sourceValue === 'meta'
    ? (campaignId ? 'facebook_paid' : 'facebook_organic')
    : sourceValue.includes('google') ? 'google_organic'
      : /chatgpt|gemini|claude|perplexity|ai/.test(sourceValue) ? 'ai_referral'
        : sourceValue ? 'other' : 'direct'
  const dimensions = {
    discovery_source: discoverySource,
    asset_type: assetType,
    asset_id: assetId,
    entry_variant: isArticle ? 'article' : isAbout ? 'about_profile' : 'website_home',
  }
  const creativeId = safeValue(search.get('utm_content'), '')
  if (campaignId) dimensions.campaign_id = campaignId
  if (creativeId) dimensions.creative_id = creativeId

  events.track('discovery_entry', dimensions)
  if (isArticle || isAbout) events.track('authority_asset_viewed', dimensions)
})(globalThis)
