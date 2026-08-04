(function attachAssessmentAttention(root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.AssessmentAttention = api
  if (root && root.document) api.autoInit(root.document)
})(typeof globalThis !== 'undefined' ? globalThis : this, function createApi() {
  const ACTIVE_CLASS = 'assessment-attention-active'
  const INTRO_CLASS = 'assessment-attention-intro'

  function isEligible(target, visited) {
    if (!target || visited.has(target) || target.disabled || target.hidden) return false
    if (target.getAttribute?.('aria-disabled') === 'true') return false
    if (target.dataset?.attentionComplete === 'true') return false

    return !['done', 'is-complete', 'hidden'].some((name) => target.classList?.contains(name))
  }

  function findNextAttentionTarget(targets, visited = new Set()) {
    return Array.from(targets || []).find((target) => isEligible(target, visited)) || null
  }

  function createAssessmentAttention(options = {}) {
    const root = options.root || (typeof document !== 'undefined' ? document : null)
    const targets = Array.from(options.targets || root?.querySelectorAll?.(options.selector || '') || [])
    const visited = new Set()
    const schedule = options.schedule || ((callback) => setTimeout(callback, 0))
    const setTimer = options.setTimer || ((callback, delay) => setTimeout(callback, delay))
    const clearTimer = options.clearTimer || ((timer) => clearTimeout(timer))
    const observerFactory = options.observerFactory || (
      typeof IntersectionObserver !== 'undefined'
        ? (callback) => new IntersectionObserver(callback, { threshold: 0.35 })
        : null
    )

    let current = null
    let observer = null
    let introTimer = null
    let destroyed = false

    function clearCurrent() {
      if (observer) observer.disconnect()
      observer = null
      if (introTimer) clearTimer(introTimer)
      introTimer = null
      if (current) {
        current.classList.remove(ACTIVE_CLASS, INTRO_CLASS)
      }
      current = null
    }

    function beginIntro(target) {
      if (destroyed || target !== current) return
      target.classList.add(INTRO_CLASS)
      introTimer = setTimer(() => {
        target.classList.remove(INTRO_CLASS)
        introTimer = null
      }, 2400)
      introTimer?.unref?.()
    }

    function watchVisibility(target) {
      if (!observerFactory) {
        beginIntro(target)
        return
      }

      observer = observerFactory((entries) => {
        const entry = entries.find((item) => item.target === target)
        if (!entry?.isIntersecting) return
        observer?.disconnect()
        observer = null
        beginIntro(target)
      })
      observer.observe(target)
    }

    function refresh() {
      if (destroyed) return
      const next = findNextAttentionTarget(targets, visited)
      if (next === current) return
      clearCurrent()
      current = next
      if (!current) return
      current.classList.add(ACTIVE_CLASS)
      watchVisibility(current)
    }

    function markVisited(target) {
      if (destroyed || visited.has(target)) return
      visited.add(target)
      schedule(refresh)
    }

    const listeners = targets.map((target) => {
      const onClick = () => markVisited(target)
      const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') markVisited(target)
      }
      target.addEventListener('click', onClick)
      target.addEventListener('keydown', onKeyDown)
      return { target, onClick, onKeyDown }
    })

    const onExternalRefresh = () => refresh()
    root?.addEventListener?.('assessment-attention:refresh', onExternalRefresh)
    refresh()

    return {
      refresh,
      destroy() {
        if (destroyed) return
        destroyed = true
        clearCurrent()
        listeners.forEach(({ target, onClick, onKeyDown }) => {
          target.removeEventListener('click', onClick)
          target.removeEventListener('keydown', onKeyDown)
          target.classList.remove(ACTIVE_CLASS, INTRO_CLASS)
        })
        root?.removeEventListener?.('assessment-attention:refresh', onExternalRefresh)
      },
    }
  }

  function autoInit(doc) {
    const script = doc.currentScript
    const selector = script?.dataset?.assessmentSelector
    if (!selector) return

    const start = () => {
      doc.assessmentAttentionController?.destroy?.()
      doc.assessmentAttentionController = createAssessmentAttention({ root: doc, selector })
    }

    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true })
    else start()
  }

  return {
    createAssessmentAttention,
    findNextAttentionTarget,
    autoInit,
  }
})
