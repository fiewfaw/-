const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const source = fs.readFileSync('care-app/public/js/frailty-content.js', 'utf8')
const context = { window: {} }
vm.runInNewContext(source, context)

const registry = context.window.FrailtyContent
assert.deepEqual(
  Array.from(Object.keys(registry.articles)),
  ['definition', 'assessment', 'recovery', 'care'],
)

for (const item of Object.values(registry.articles)) {
  assert.match(
    item.url,
    /^https:\/\/baankaiyaphap-chonburi\.com\/blog\/post\.html\?slug=frailty-/,
  )
  assert.ok(item.titleTh.length > 12)
  assert.ok(item.linkLabelTh.length > 6)
}

assert.equal(registry.getArticle('assessment').slug, 'frailty-assessment')
assert.throws(() => registry.getArticle('missing'), /Unknown frailty article/)
console.log('PASS shared frailty content registry')
