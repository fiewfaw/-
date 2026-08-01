const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'team4-hip-recovery-mockup.html');
assert.ok(fs.existsSync(htmlPath), 'Plan 04 result page exists');
const html = fs.readFileSync(htmlPath, 'utf8');

function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert.match(html, /แผน 04/);
assert.doesNotMatch(html, /คอขวด/);
assert.match(html, /ฟื้นการลุกเดินหลังผ่าตัดหรือกระดูกสะโพกหัก/);
assert.equal(count(/data-treatment-id=/g), 6);
assert.equal(count(/data-treatment-category=/g), 4, 'hip treatment uses four primary categories');
assert.match(html, /id="treatmentSubtypeGrid"/);
assert.match(html, /media\/team4-hip-treatment-xray-atlas\.png/);
assert.match(html, /คำที่อาจพบในใบจำหน่าย/);
assert.match(html, /ภาพตัวอย่าง อุปกรณ์จริงอาจแตกต่าง/);
assert.equal(count(/class="problem-card"/g), 3);
assert.match(html, /วันนี้ทำอะไรได้/);
assert.match(html, /ตอนนี้ยังไม่ควรทำ/);
assert.match(html, /โรคและภาวะที่เกี่ยวข้อง/);
assert.match(html, /การรักษาของคุณคืออะไร/);
assert.match(html, /กระดูกจะติดเมื่อไร|ระยะฟื้นตัว/);
assert.match(html, /ข้อควรระวังเฉพาะสะโพก/);
assert.match(html, /Ankle Pump/);
assert.match(html, /คะแนนการเคลื่อนไหวช่วงแรก/);
assert.match(html, /Barthel Index/);
assert.match(html, /สร้างแผนเฉพาะตัวของฉัน/);
assert.match(html, /นักกายภาพประเมิน/);
assert.match(html, /ใช้ตำแหน่งปัจจุบัน/);
assert.doesNotMatch(html, /id="leadEmail"|placeholder="อีเมล/);
assert.match(html, /นำข้อมูลของฉันไปวิเคราะห์ต่อด้วย AI/);
assert.match(html, /hip-recovery-personalization\.js/);
assert.match(html, /current-location-lead\.js/);
assert.match(html, /media\/plan-hip-recovery\.png/);
assert.match(html, /media\/team4-hip-demo-grid-a\.png/);
assert.match(html, /media\/team4-hip-demo-grid-b\.png/);
assert.match(html, /media\/team4-hip-demo-grid-c\.png/);
assert.match(html, /media\/team4-hip-precautions\.png/);
assert.match(html, /class="hero-glow"/);
assert.match(html, /class="hero-line-canvas"/);
assert.match(html, /function initHeroLineEffect/);
assert.match(html, /isCyanHologramPixel/);
assert.match(html, /requestAnimationFrame\(drawHeroLineFrame\)/);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=weight-bearing-after-surgery"/,
  'Plan 04 links its weight-bearing field to the shared article',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=weight-bearing-after-surgery"[^>]*target="_blank"[^>]*rel="noopener"/,
  'Plan 04 opens the shared article safely in a new tab',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=dvt-after-surgery"/,
  'Plan 04 links swelling and Ankle Pump guidance to the shared DVT article',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=dvt-after-surgery"[^>]*target="_blank"[^>]*rel="noopener"/,
  'Plan 04 opens the DVT article safely in a new tab',
);
assert.match(html, /\.routine-media[^}]*aspect-ratio:1/);
assert.match(html, /\.demo-stage[^}]*aspect-ratio:1/);
assert.equal(count(/class="assessment-drawer/g), 3, 'each problem owns one assessment drawer');
assert.match(html, /class="problem-card"[\s\S]*id="safetyPanel"[\s\S]*<\/article>/);
assert.match(html, /class="problem-card"[\s\S]*id="casAssessment"[\s\S]*<\/article>/);
assert.match(html, /class="problem-card"[\s\S]*id="walkingAssessment"[\s\S]*<\/article>/);
assert.match(html, /panel\.scrollIntoView\(\{behavior:'smooth',block:'nearest'\}\)/);
assert.match(html, /focusAssessmentPanel\(panel\)/);
assert.match(html, /walkingButton\.classList\.toggle\('hidden',!walkingAvailable\)/);

for (const id of [
  'treatmentKnowledgePanel',
  'healingTimeline',
  'precautionBlock',
  'circulationRoutine',
  'casAssessment',
  'barthelAssessment',
  'walkingAssessment',
  'sitToStandAssessment',
  'starterPlan',
  'personalPlan',
  'manualAreaWrap',
  'copyAiButton',
]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} is present`);
}

assert.ok(count(/aria-expanded=/g) >= 6, 'expandable controls expose state');
assert.doesNotMatch(html, /ข้อมูลถูกส่งแล้ว|ส่งข้อมูลสำเร็จ/);
assert.doesNotMatch(html, />[^<]*prompt[^<]*</i);

for (const stateField of [
  'treatmentType',
  'operationDate',
  'operatedSide',
  'weightBearingStatus',
  'hipPrecautionStatus',
  'painAtRest',
  'painWithMovement',
  'casBedTransfer',
  'casChairTransfer',
  'casIndoorWalking',
  'barthelTotal',
  'walkingMinutes',
  'sitToStandSeconds',
  'currentAid',
  'caregiverAvailable',
  'homeRisks',
  'redFlags',
]) {
  assert.match(html, new RegExp(`${stateField}:`), `${stateField} is sent to the plan engine`);
}
assert.match(html, /buildHipRecoveryPlan\(collect\(\)\)/);
assert.match(html, /result\.problemBlocks/);
assert.match(html, /renderProblemBlocks/);
assert.match(html, /result\.starterActivities/);
assert.match(html, /result\.activities/);
assert.match(html, /result\.schedule/);
assert.match(html, /requestCurrentLocation\(navigator\.geolocation\)/);
assert.match(html, /manualAreaWrap.*classList\.remove\('hidden'\)/s);
assert.match(html, /navigator\.clipboard\.writeText/);
assert.match(html, /'weight-acceptance':\['demo-c'/);
assert.match(html, /'standing-hip-abduction':\['demo-c'/);

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((source) => source.trim());
assert.ok(inlineScripts.length > 0, 'page has an inline interaction script');
for (const source of inlineScripts) new Function(source);

for (const asset of [
  'media/plan-hip-recovery.png',
  'media/team4-hip-demo-grid-a.png',
  'media/team4-hip-demo-grid-b.png',
  'media/team4-hip-demo-grid-c.png',
  'media/team4-hip-precautions.png',
  'media/team4-hip-treatment-xray-atlas.png',
]) {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', asset)), `${asset} exists`);
}

console.log('PASS team4 hip recovery structure');
