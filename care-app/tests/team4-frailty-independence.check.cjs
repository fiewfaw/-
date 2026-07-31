const assert = require('node:assert/strict')
const fs = require('node:fs')

const path = 'care-app/public/team4-frailty-independence-mockup.html'
assert.ok(fs.existsSync(path), 'Team 4 FRAIL-01 page exists')
const html = fs.readFileSync(path, 'utf8')

assert.match(html, /แผนฟื้นกำลัง กลับมาช่วยเหลือตัวเอง/)
assert.match(html, /สำหรับผู้สูงอายุที่เริ่มมีสัญญาณเปราะบาง/)
assert.equal((html.match(/class="problem-card/g) || []).length, 3)
assert.equal((html.match(/class="exercise-card starter-exercise/g) || []).length, 2)

for (const key of ['definition', 'assessment', 'recovery', 'care']) {
  assert.match(html, new RegExp(`data-article="${key}"`), `places ${key} article`)
}
assert.match(html, /FrailtyContent\.getArticle\(key\)/)

for (const script of [
  'js/frailty-content.js',
  'js/frailty-independence-personalization.js',
  'js/current-location-lead.js',
]) {
  assert.match(html, new RegExp(script.replaceAll('.', '\\.')), `loads ${script}`)
}

for (const id of [
  'chairStandReps',
  'transferAssist',
  'nearFalls30d',
  'householdWalking',
  'fatigue010',
  'activityMinutes',
  'recoveryMinutes',
]) {
  assert.match(html, new RegExp(`id="${id}"`), `includes ${id}`)
}

assert.match(html, /id="barthelPrompt"[^>]*hidden/)
assert.match(html, /class="professional-strip"/)
assert.doesNotMatch(html, /<button[^>]+class="professional-strip"/)
assert.match(html, /id="personalizedActivities"/)
assert.match(html, /data-fitt="frequency"/)
assert.match(html, /id="weeklySchedule"/)
assert.match(html, /id="progressionRules"/)
assert.match(html, /id="regressionRules"/)
assert.match(html, /id="ptAssessment"/)
assert.match(html, /id="stopPoint"/)
assert.match(html, /target="_blank" rel="noopener"/)
assert.match(html, /scrollIntoView\(\{ behavior: 'smooth'/)
assert.doesNotMatch(html, /type="email"|placeholder="[^"]*อีเมล/)
assert.match(html, /id="manualAreaFields" hidden/)

console.log('PASS Team 4 FRAIL-01 structure, content links, and interactions')
