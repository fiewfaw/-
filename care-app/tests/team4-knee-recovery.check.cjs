const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'team4-knee-recovery-mockup.html');
assert.ok(fs.existsSync(htmlPath), 'Plan 05 result page exists');
const html = fs.readFileSync(htmlPath, 'utf8');

function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert.match(html, /<link rel="icon" href="data:,">/);
assert.match(html, /แผน 05/);
assert.match(html, /ฟื้นการงอเข่าและการเดินหลังผ่าตัดหรือกระดูกหักรอบเข่า/);
assert.equal(count(/data-treatment-id=/g), 8);
assert.equal(count(/data-treatment-category=/g), 4, 'knee treatment uses four primary categories');
assert.match(html, /id="treatmentSubtypeGrid"/);
assert.doesNotMatch(html, /class="treatment-tabs"/, 'knee treatment no longer uses horizontal tabs');
assert.match(html, /media\/team4-knee-treatment-xray-atlas\.png/);
assert.match(html, /คำที่อาจพบในใบจำหน่าย/);
assert.match(html, /ภาพตัวอย่าง อุปกรณ์จริงอาจแตกต่าง/);
assert.equal(count(/class="problem-card"/g), 3);
assert.equal(count(/class="assessment-drawer/g), 3);
assert.match(html, /โรคและภาวะที่เกี่ยวข้อง/);
assert.match(html, /การรักษาของคุณคืออะไร/);
assert.match(html, /คำสั่งที่ต้องยึดก่อนเริ่มฝึก/);
assert.match(html, /อาการบวมและปวดกำลังบอกว่าร่างกายรับกิจกรรมได้แค่ไหน/);
assert.match(html, /เข่ายังเหยียดหรืองอได้ไม่พอกับกิจกรรมที่ต้องทำ/);
assert.match(html, /กำลังขาและการเดินยังไม่กลับมาเพียงพอสำหรับการใช้ชีวิตในบ้าน/);
assert.match(html, /โปรแกรมเริ่มต้น/);
assert.match(html, /สร้างแผนเฉพาะตัวของฉัน/);
assert.match(html, /นักกายภาพประเมิน/);
assert.match(html, /ใช้ตำแหน่งปัจจุบัน/);
assert.match(html, /นำข้อมูลของฉันไปวิเคราะห์ต่อด้วย AI/);
assert.doesNotMatch(html, /id="leadEmail"|placeholder="อีเมล/);
assert.doesNotMatch(html, /คอขวด/);

for (const id of [
  'heroLineCanvas',
  'treatmentKnowledgePanel',
  'healingTimeline',
  'activeOrders',
  'symptomAssessment',
  'rangeAssessment',
  'mobilityAssessment',
  'starterPlan',
  'personalPlan',
  'leadForm',
  'manualAreaWrap',
  'copyAiButton',
]) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} is present`);
}

assert.match(html, /knee-recovery-personalization\.js/);
assert.match(html, /current-location-lead\.js/);
assert.match(html, /buildKneeRecoveryPlan\(collectKneeRecoveryInput\(\)\)/);
assert.match(html, /result\.problemBlocks/);
assert.match(html, /result\.starterActivities/);
assert.match(html, /result\.activities/);
assert.match(html, /result\.schedule/);
assert.match(html, /class="demo-frame demo-frame-a"/);
assert.match(html, /class="demo-frame demo-frame-b"/);
assert.match(html, /\.demo-stage\.is-playing \.demo-frame-a/);
assert.match(html, /@keyframes kneeFrameA/);
assert.match(html, /@keyframes kneeFrameB/);
assert.match(html, /let demoPlaybackTimer/);
assert.match(html, /clearInterval\(demoPlaybackTimer\)/);
assert.match(html, /classList\.toggle\('is-playing'/);
assert.match(html, /panel\.scrollIntoView\(\{ behavior: 'smooth', block: 'nearest' \}\)/);
assert.match(html, /focusAssessmentPanel\(panel\)/);
assert.match(html, /requestCurrentLocation\(navigator\.geolocation\)/);
assert.match(html, /navigator\.clipboard\.writeText/);
assert.match(html, /function initHeroLineEffect/);
assert.match(html, /function isCyanHologramPixel/);
assert.match(html, /function isHeroHologramRegion/);
assert.match(html, /function drawHeroSampleAsContain/);
assert.match(html, /drawHeroSampleAsContain\(sampleContext, image, sampleCanvas\.width, sampleCanvas\.height\)/);
assert.match(html, /isHeroHologramRegion\(x, y, sampleCanvas\.width, sampleCanvas\.height\)\s*&&\s*isCyanHologramPixel/);
assert.match(html, /requestAnimationFrame\(drawHeroLineFrame\)/);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=weight-bearing-after-surgery"/,
  'Plan 05 links its weight-bearing field to the shared article',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=weight-bearing-after-surgery"[^>]*target="_blank"[^>]*rel="noopener"/,
  'Plan 05 opens the shared article safely in a new tab',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=dvt-after-surgery"/,
  'Plan 05 links its swelling assessment to the shared DVT article',
);
assert.match(
  html,
  /href="\/blog\/post\.html\?slug=dvt-after-surgery"[^>]*target="_blank"[^>]*rel="noopener"/,
  'Plan 05 opens the DVT article safely in a new tab',
);
assert.doesNotMatch(html, /class="[^\"]*demo-arrow/);
assert.match(html, /\.hero-media\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5[^}]*max-height:\s*520px/s);
assert.match(html, /\.hero-media::before\s*\{[^}]*background-image:\s*url\("media\/plan-knee-recovery\.png"\)[^}]*background-size:\s*cover/s);
assert.match(html, /\.hero-media img\s*\{[^}]*object-fit:\s*contain[^}]*object-position:\s*center/s);
assert.match(html, /\.hero-glow\s*\{[^}]*background-size:\s*contain[^}]*background-position:\s*center[^}]*background-repeat:\s*no-repeat/s);
assert.match(html, /\.hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/s);
assert.match(html, /\.topbar\s*\{[^}]*overflow:\s*hidden/s);
assert.match(html, /@media \(max-width:\s*480px\)[\s\S]*?\.step-badge\s*\{\s*display:\s*none/s);
assert.match(html, /\.demo-stage\s*\{[^}]*aspect-ratio:\s*1/s);

for (const stateField of [
  'treatmentType',
  'operationOrInjuryDate',
  'affectedSide',
  'weightBearingStatus',
  'kneeMotionOrder',
  'maximumFlexionOrder',
  'braceStatus',
  'painAtRest',
  'painWithMovement',
  'swellingTrend',
  'kneeFlexionDegrees',
  'kneeExtensionDeficitDegrees',
  'mobilityBedChair',
  'mobilitySitToStand',
  'mobilityIndoorWalking',
  'walkingMinutes',
  'fiveTimesSitToStandSeconds',
  'currentAid',
  'caregiverAvailable',
  'homeRisks',
  'redFlags',
  'ankleMovementRestricted',
]) {
  assert.match(html, new RegExp(`${stateField}:`), `${stateField} is sent to the engine`);
}

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((source) => source.trim());
assert.ok(inlineScripts.length > 0, 'page has an inline interaction script');
for (const source of inlineScripts) new Function(source);

for (const asset of [
  'media/plan-knee-recovery.png',
  'media/team4-knee-demo-grid-a.png',
  'media/team4-knee-demo-grid-b.png',
  'media/team4-knee-demo-grid-c.png',
  'media/team4-knee-treatment-xray-atlas.png',
]) {
  assert.match(html, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', asset)), `${asset} exists`);
}

console.log('PASS team4 knee recovery structure');
