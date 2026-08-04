const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const appRoot = path.resolve(__dirname, '..')
const iconModulePath = path.join(appRoot, 'js', 'approved-assessment-icons.js')
const iconCssPath = path.join(appRoot, 'css', 'approved-assessment-icons.css')
const attentionModulePath = path.join(appRoot, 'js', 'assessment-attention.js')
const attentionCssPath = path.join(appRoot, 'css', 'assessment-attention.css')

assert.equal(fs.existsSync(iconModulePath), true, 'approved icon module must exist')
assert.equal(fs.existsSync(iconCssPath), true, 'approved icon stylesheet must exist')

const { PLAN_ICON_MAP } = require(iconModulePath)
const iconModuleSource = fs.readFileSync(iconModulePath, 'utf8')
const attentionModuleSource = fs.readFileSync(attentionModulePath, 'utf8')
const attentionCssSource = fs.readFileSync(attentionCssPath, 'utf8')

assert.match(iconModuleSource, /'\.summary'/, 'nested assessment summaries must keep their original layout')
assert.match(iconModuleSource, /\.condition-article-icon/, 'knowledge cards must replace their original icon')
assert.doesNotMatch(attentionModuleSource, /assessment-attention-sparks/, 'attention effect must not add orbiting spark elements')
assert.match(attentionCssSource, /assessment-attention-frame-flash/, 'the first unanswered assessment must flash its full frame')
assert.doesNotMatch(attentionCssSource, /offset-path/, 'the attention effect must not orbit small particles')
const expectedCounts = {
  'team4-walk-confidence-mockup.html': 5,
  'team4-return-strength-mockup.html': 5,
  'team4-stroke-arm-leg-mockup.html': 4,
  'team4-hip-recovery-mockup.html': 6,
  'team4-knee-recovery-mockup.html': 6,
  'team4-parkinson-mobility-mockup.html': 6,
  'team4-bedbound-transfer-mockup.html': 6,
}

const allItems = Object.values(PLAN_ICON_MAP).flat()
assert.equal(allItems.length, 38, 'all 38 approved icon placements must be mapped')
assert.equal(new Set(allItems.map((item) => item.id)).size, 38, 'icon placement IDs must be unique')

for (const [fileName, expectedCount] of Object.entries(expectedCounts)) {
  const items = PLAN_ICON_MAP[fileName]
  assert.equal(items?.length, expectedCount, `${fileName} must map ${expectedCount} approved icons`)

  const html = fs.readFileSync(path.join(appRoot, fileName), 'utf8')
  assert.match(html, /css\/approved-assessment-icons\.css/, `${fileName} must load approved icon CSS`)
  assert.match(html, /js\/approved-assessment-icons\.js/, `${fileName} must load approved icon JS`)
}

const expectedAssets = [
  'movement-pictograms-v4.png',
  'anatomy-pictograms-v4.png',
  'plan01-02-pictograms-v5.png',
  'plan03-pictograms-v5.png',
  'plan04-05-pictograms-v6.png',
  'plan06-pictograms-v6.png',
  'plan07-pictograms-v7.png',
]

for (const asset of expectedAssets) {
  assert.equal(
    fs.existsSync(path.join(appRoot, 'media', 'icon-review', asset)),
    true,
    `${asset} must remain available to the app`,
  )
}

console.log('Approved assessment icon mapping is complete: 38/38')
