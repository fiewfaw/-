const assert = require('node:assert/strict');
const fs = require('node:fs');

const path = 'care-app/public/team4-frailty-independence-mockup.html';
assert.ok(fs.existsSync(path), 'legacy frailty URL remains available');
const html = fs.readFileSync(path, 'utf8');

assert.match(html, /team4-walk-confidence-mockup\.html/, 'legacy URL redirects to Plan 01');
assert.match(html, /location\.search/, 'redirect preserves Team 1-3 query context');
assert.doesNotMatch(html, /class="problem-card/, 'legacy URL does not render a duplicate result plan');
assert.doesNotMatch(html, /FRAIL-01/, 'internal frailty id is not patient-facing');

console.log('PASS legacy frailty URL redirects to existing Plan 01');
