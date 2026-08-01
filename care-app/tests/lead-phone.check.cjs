const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  normalizePhone,
  isValidPhone,
} = require('../public/js/lead-phone.js');

assert.equal(normalizePhone('081-234-5678'), '0812345678');
assert.equal(normalizePhone('08A1 234 567890'), '0812345678');
assert.equal(normalizePhone(''), '');
assert.equal(isValidPhone('0812345678'), true);
assert.equal(isValidPhone('081234567'), false);
assert.equal(isValidPhone('08123456789'), false);
assert.equal(isValidPhone('08A2345678'), false);

const plans = [
  ['team4-walk-confidence-mockup.html', 'phone', 'submitPlan'],
  ['team4-return-strength-mockup.html', 'phone', 'submitPlan'],
  ['team4-stroke-arm-leg-mockup.html', 'phone', 'submitPlan'],
  ['team4-hip-recovery-mockup.html', 'leadPhone', 'showPersonalPlan'],
  ['team4-knee-recovery-mockup.html', 'leadPhone', 'showPersonalPlan'],
];

for (const [filename, phoneId, buttonId] of plans) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', filename), 'utf8');
  assert.match(html, /js\/lead-phone\.js/, `${filename} loads shared phone rules`);
  assert.match(
    html,
    new RegExp(`<input[^>]+id="${phoneId}"[^>]+inputmode="numeric"[^>]+maxlength="10"`),
    `${filename} exposes a digits-only 10-character phone field`,
  );
  assert.match(html, new RegExp(`id="${buttonId}"[^>]*disabled`), `${filename} starts with plan button disabled`);
  assert.match(html, /CareLeadPhone\.bindPhoneInput/, `${filename} binds shared phone rules`);
}

console.log('PASS shared 10-digit lead phone rules');
