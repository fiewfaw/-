(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CareLeadPhone = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '').slice(0, 10);
  }

  function isValidPhone(value) {
    return /^\d{10}$/.test(String(value || ''));
  }

  function bindPhoneInput(options) {
    const input = options && options.input;
    const button = options && options.button;
    if (!input || !button) throw new TypeError('input and button are required');

    function update() {
      input.value = normalizePhone(input.value);
      const valid = isValidPhone(input.value);
      input.setAttribute('aria-invalid', valid || input.value === '' ? 'false' : 'true');
      button.disabled = !valid;
      button.dataset.phoneValid = String(valid);
      return valid;
    }

    input.addEventListener('input', update);
    input.addEventListener('paste', function () {
      setTimeout(update, 0);
    });
    update();
    return Object.freeze({ update, isValid: () => isValidPhone(input.value) });
  }

  return Object.freeze({ normalizePhone, isValidPhone, bindPhoneInput });
});
