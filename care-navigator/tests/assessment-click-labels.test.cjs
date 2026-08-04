const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const pages = {
  'team4-walk-confidence-mockup.html': 2,
  'team4-return-strength-mockup.html': 2,
  'team4-parkinson-mobility-mockup.html': 3,
  'team4-bedbound-transfer-mockup.html': 3,
  'team4-hip-recovery-mockup.html': 3,
  'team4-knee-recovery-mockup.html': 3,
  'team4-stroke-arm-leg-mockup.html': 3,
}

let labelCount = 0

for (const [page, expectedCount] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, page), 'utf8')
  const labels = html.match(/คลิกเพื่อตอบ/g) || []

  assert.equal(labels.length, expectedCount, `${page} should clearly label every clickable assessment`)
  assert.doesNotMatch(html, /class="chev">(?:›|&gt;|>)/, `${page} should not use an arrow alone as the assessment prompt`)
  assert.doesNotMatch(html, /class="chevron"/, `${page} should not use a chevron alone as the assessment prompt`)
  assert.match(html, /assessment-attention\.css\?v=click-label-2/, `${page} should load the shared click-label styles without a stale cache`)
  labelCount += labels.length
}

assert.equal(labelCount, 19, 'all nineteen expandable assessment cards should use the clear click label')

const attentionCss = fs.readFileSync(path.join(root, 'css', 'assessment-attention.css'), 'utf8')
assert.match(attentionCss, /:has\(\.assessment-click-prompt\)[^{]*\{[^}]*grid-template-columns:[^;}]*auto/s, 'shared styles should reserve enough width for the click label')
assert.match(attentionCss, /\.assessment-click-prompt\s*\{[^}]*display:\s*inline-flex/s, 'the click label should look like an actionable badge')
assert.match(attentionCss, /\.assessment-score-prompt::after\s*\{[^}]*content:\s*attr\(data-click-prompt\)/s, 'score-based assessments should keep their score and show the click prompt')

console.log(`PASS assessment click labels are clear: ${labelCount}/19`)
