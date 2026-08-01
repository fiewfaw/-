const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'team4-return-strength-personalization-review.html');
assert.ok(fs.existsSync(htmlPath), 'return-strength personalization review page exists');

const html = fs.readFileSync(htmlPath, 'utf8');
const count = (pattern) => (html.match(pattern) || []).length;

assert.match(html, /return-strength-personalization\.js/, 'loads the same rule engine as the app');
assert.equal(count(/class="review-case/g), 6, 'contains six representative review cases');
assert.match(html, /ข้อมูลเข้า/, 'shows input data');
assert.match(html, /ระยะเดิน 2 นาที/, 'shows the progress baseline');
assert.match(html, /ความเหนื่อยหลังเดิน/, 'shows post-walk exertion');
assert.match(html, /เวลาฟื้น/, 'shows recovery time');
assert.match(html, /ลุกยืน 30 วินาที/, 'shows chair-stand repetitions');
assert.match(html, /FITT ลุกยืน/, 'shows sit-to-stand FITT');
assert.match(html, /FITT เดินเป็นช่วง/, 'shows interval-walking FITT');
assert.match(html, /ตาราง 7 วัน/, 'shows the weekly schedule');
assert.match(html, /Modifiers/, 'shows modifier effects');
assert.match(html, /นักกายภาพ/, 'shows physiotherapist assessment tasks');
assert.match(html, /เหตุผล/, 'explains why each case receives its result');
assert.match(html, /buildReturnStrengthPlan/, 'calculates cases with the shared engine');

console.log('PASS team4 return-strength personalization review page');
