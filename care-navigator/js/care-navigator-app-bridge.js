(() => {
  let tracked = false

  document.addEventListener('click', (event) => {
    if (tracked) return
    const target = event.target instanceof Element ? event.target.closest('.goal-card') : null
    if (!target) return

    const accepted = globalThis.CareNavigatorEvents?.track('app_started', {
      discovery_source: 'direct',
      asset_type: 'care_navigator',
      asset_id: 'care_navigator',
      entry_variant: 'team1_goal_selected',
      app_version: globalThis.CareNavigatorEventConfig?.appVersion || 'beta-20260810',
    })
    if (accepted) tracked = true
  })
})()
