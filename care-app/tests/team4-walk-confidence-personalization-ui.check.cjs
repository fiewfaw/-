const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'team4-walk-confidence-mockup.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert.match(html, /js\/walk-confidence-personalization\.js/, 'loads the shared FITT engine');
assert.match(html, /js\/current-location-lead\.js/, 'loads the current-location capture module');
assert.match(html, /id="leadForm"/, 'contains the short lead form');
assert.match(html, /id="useCurrentLocation"/, 'contains the current-location action');
assert.match(html, /id="locationStatus"[^>]*aria-live="polite"/, 'announces location state accessibly');
assert.match(html, /id="locationMapLink"/, 'contains a link for reviewing the captured pin');
assert.match(html, /id="manualAreaFields"[^>]*hidden/, 'hides manual area entry initially');
assert.match(html, /id="personalPlan"/, 'contains the generated plan summary');
assert.match(html, /data-fitt="frequency"/, 'shows FITT frequency');
assert.match(html, /data-fitt="intensity"/, 'shows FITT intensity');
assert.match(html, /data-fitt="time"/, 'shows FITT time');
assert.match(html, /data-fitt="type"/, 'shows FITT type');
assert.match(html, /ตารางฝึก 7 วัน/, 'contains the weekly schedule');
assert.match(html, /id="progressionRules"/, 'contains progression rules');
assert.match(html, /id="regressionRules"/, 'contains regression rules');
assert.match(html, /หากต้องใช้มือช่วย ให้หยุดและบันทึก 0 ครั้ง/, 'uses the standardized chair-stand instruction');
assert.match(html, /buildWalkConfidencePlan/, 'calls the shared personalization engine');
assert.match(html, /id="submitPlan"/, 'has a final plan generation action');
assert.match(html, /id="personalLevel"/, 'shows a patient-facing plan level');
assert.match(html, /CurrentLocationLead\.requestCurrentLocation/, 'requests one location snapshot through the shared module');
assert.match(html, /let capturedLocation=null,currentLeadData=null/, 'keeps location and lead data in page state');
assert.match(html, /result\.code==="permission_denied"/, 'reveals manual entry only from the denied-permission branch');
assert.match(html, /locationButton\.classList\.add\("denied"\)/, 'fades the denied location action');
assert.match(html, /locationButton\.disabled=true/, 'disables location action after permission denial');
assert.match(html, /manualAreaFields\.hidden=false;areaInput\.focus\(\)/, 'reveals and focuses manual area after denial');
assert.match(html, /ไม่ได้แชร์ตำแหน่ง/, 'labels the denied state clearly');
assert.match(html, /manualAllowed=!manualAreaFields\.hidden/, 'uses the reveal state to authorize manual entry');
assert.match(html, /if\(!capturedLocation&&!manualAllowed\)/, 'requires a location attempt before manual fallback');
assert.match(html, /if\(manualAllowed&&!area\)/, 'requires area text after permission denial');
assert.match(html, /location:capturedLocation/, 'attaches the captured pin to lead data');
assert.match(html, /แนบตำแหน่งไว้กับข้อมูลเคสในหน้านี้แล้ว/, 'does not falsely claim the lead was sent');
assert.doesNotMatch(html, /data-exercise="new-exercise"/, 'does not add an unnecessary new exercise');

assert.match(html, /js\/frailty-content\.js/, 'loads the frailty education registry inside Plan 01');
assert.doesNotMatch(html, /class="frailty-context"/, 'removes the standalone frailty knowledge block');
assert.doesNotMatch(html, /class="frailty-links"/, 'removes the standalone frailty link grid');
assert.doesNotMatch(html, /คำสำคัญสำหรับครอบครัวผู้สูงอายุเปราะบาง/, 'removes the detached knowledge heading');
assert.match(html, /data-c="frailty"/, 'offers frailty as a related condition chip');
assert.match(html, /id="conditionArticleLink"/, 'uses one optional article row in the shared condition detail');
assert.match(html, /\.condition-article-link\[hidden\]\{display:none!important\}/, 'fully hides the optional article row for unrelated conditions');
for (const key of ['definition', 'assessment', 'recovery', 'care']) {
  assert.match(html, new RegExp(`data-article-key="${key}"`), `keeps the ${key} frailty article in the condition detail`);
}
assert.match(html, /id="chairTimer"/, 'keeps the 30-second chair-rise timer in Plan 01');
assert.match(html, /id="chairClock"/, 'shows the chair-rise countdown');
assert.ok((html.match(/class="pose-frame frame-a"/g) || []).length >= 2, 'starter exercises have first motion frames');
assert.ok((html.match(/class="pose-frame frame-b"/g) || []).length >= 2, 'starter exercises have second motion frames');
assert.match(html, /id="weekGrid"/, 'personalized result has a weekly schedule');
assert.match(html, /id="personalPt"/, 'personalized result keeps optional PT assessment separate');
assert.doesNotMatch(html, /FRAIL-01/, 'internal frailty route id is not shown to patients');

console.log('PASS team4 walk-confidence personalization UI structure');
