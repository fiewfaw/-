(function attachLeadPhoneValidation(root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.LeadPhoneValidation = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function createApi() {
  function normalizePhone(value) {
    return String(value ?? '').replace(/\D/g, '').slice(0, 10)
  }

  function isCompletePhone(value) {
    return /^[0-9]{10}$/.test(String(value ?? ''))
  }

  function attachPhoneInput(input, options = {}) {
    if (!input) throw new Error('A phone input is required')

    input.setAttribute('type', 'tel')
    input.setAttribute('inputmode', 'numeric')
    input.setAttribute('minlength', '10')
    input.setAttribute('maxlength', '10')
    input.setAttribute('pattern', '[0-9]{10}')
    input.setAttribute('autocomplete', 'tel')
    input.setAttribute('placeholder', 'เบอร์โทรศัพท์ 10 หลัก')

    function sync() {
      input.value = normalizePhone(input.value)
      const complete = isCompletePhone(input.value)
      input.setAttribute('aria-invalid', String(!complete))
      options.onChange?.(complete, input.value)
      return complete
    }

    input.addEventListener('input', sync)
    sync()

    return {
      isComplete: () => isCompletePhone(input.value),
      destroy() {
        input.removeEventListener('input', sync)
      },
    }
  }

  return {
    attachPhoneInput,
    isCompletePhone,
    normalizePhone,
  }
})
