const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const pages = [
  'team4-walk-confidence-mockup.html',
  'team4-return-strength-mockup.html',
  'team4-parkinson-mobility-mockup.html',
]

let labelCount = 0

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8')
  const labels = html.match(/class="chev">คลิกเพื่อตอบ<\/[^>]+>/g) || []

  assert.ok(labels.length > 0, `${page} should clearly label clickable assessments`)
  assert.doesNotMatch(html, /class="chev">(?:›|&gt;|>)/, `${page} should not use an arrow alone as the assessment prompt`)
  assert.match(html, /assessment-attention\.css\?v=click-label-1/, `${page} should load the click-label styles without a stale cache`)
  labelCount += labels.length
}

assert.equal(labelCount, 7, 'all seven expandable assessment cards should use the clear click label')

const attentionCss = fs.readFileSync(path.join(root, 'css', 'assessment-attention.css'), 'utf8')
assert.match(attentionCss, /\.summary:has\(\.chev\)[^{]*\{[^}]*grid-template-columns:[^;}]*auto/s, 'shared styles should reserve enough width for the click label')
assert.match(attentionCss, /\.chev\s*\{[^}]*display:\s*inline-flex/s, 'the click label should look like an actionable badge')

console.log(`PASS assessment click labels are clear: ${labelCount}/7`)
