const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const reviewPath = path.join(__dirname, '..', 'public', 'team4-walk-confidence-personalization-review.html');
assert.ok(fs.existsSync(reviewPath), 'personalization review page should exist');

const html = fs.readFileSync(reviewPath, 'utf8');
assert.match(html, /ตารางตรวจแผนเฉพาะตัว/);
assert.match(html, /ข้อมูลเข้า/);
assert.match(html, /FITT/);
assert.match(html, /เหตุผล/);
assert.match(html, /walk-confidence-personalization\.js/);
assert.match(html, /buildWalkConfidencePlan/);
assert.match(html, /data-filter="assistance"/);
assert.match(html, /data-filter="falls"/);
assert.match(html, /data-filter="chair"/);
assert.match(html, /36 สถานการณ์/);
assert.match(html, /physical_assist/);
assert.match(html, /sticky/);

console.log('PASS team4 walk-confidence personalization review page');
