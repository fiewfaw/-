const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'team4-stroke-arm-leg-mockup.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredVisualAssets = [
  'team4-stroke-type-atlas.png',
  'team4-stroke-lesion-atlas.png',
  'team4-stroke-function-pictograms.png',
];

for (const fileName of requiredVisualAssets) {
  const assetPath = path.join(__dirname, '..', 'public', 'media', fileName);
  assert.ok(fs.existsSync(assetPath), `${fileName} exists`);
  assert.ok(fs.statSync(assetPath).size > 100_000, `${fileName} is a production image`);
}

const attributionPath = path.join(
  __dirname,
  '..',
  'public',
  'media',
  'stroke-ct-attribution.json',
);
assert.ok(fs.existsSync(attributionPath), 'CT attribution manifest exists');
const attribution = JSON.parse(fs.readFileSync(attributionPath, 'utf8'));
assert.ok(attribution.sources.length >= 2, 'CT sources are attributed');

function count(pattern) {
  return (html.match(pattern) || []).length;
}

assert.match(html, /แผน 03/);
assert.match(html, /ฟื้นการใช้แขนขาหลังโรคหลอดเลือดสมอง/);
assert.equal(count(/class="problem-card/g), 3, 'exactly three patient-problem cards');
assert.equal(count(/<label class="barthel-item" data-barthel-item=/g), 10, 'Barthel has ten required items');
assert.equal(count(/data-fac-option=/g), 6, 'FAC has levels zero through five');
assert.equal(count(/data-arm-option=/g), 6, 'arm-use heuristic has levels zero through five');
assert.equal(
  count(/data-shoulder-pain-option=/g),
  4,
  'shoulder pain and instability impact has levels zero through three',
);
assert.equal(count(/class="exercise-card/g), 2, 'starter plan has exactly two activities');

assert.match(html, /id="assessmentProgress"/);
assert.match(html, /id="barthelTotal"/);
assert.match(html, /id="buildPlan"[^>]*disabled/);
assert.match(html, /id="leadForm"/);
assert.match(html, /id="useCurrentLocation"/);
assert.match(html, /id="manualAreaFields"[^>]*hidden/);
assert.match(html, /id="personalizedActivities"/);
assert.match(html, /id="weeklySchedule"/);
assert.match(html, /id="progressionGuidance"/);
assert.match(html, /id="regressionGuidance"/);
assert.match(html, /id="copySummary"/);
assert.match(html, /ปรึกษานักกายภาพ/);
assert.doesNotMatch(
  html,
  /data-condition-id="spasticity"/,
  'Spasticity is supporting knowledge, not a separate condition chip',
);
assert.equal(
  count(/class="glossary-link"/g),
  0,
  'knowledge terms do not create separate full-width cards',
);
assert.ok(
  count(/class="inline-term"/g) >= 2,
  'Neuroplasticity and Spasticity are embedded as readable inline terms',
);
assert.match(html, /slug=neuroplasticity-stroke-recovery/);
assert.match(html, /slug=spasticity-after-stroke/);
assert.match(html, /slug=shoulder-pain-after-stroke/);
assert.match(html, /อาการปวดหรือความไม่มั่นคงของไหล่รบกวนแค่ไหน/);
assert.match(html, /shoulderPainImpact/);

assert.match(html, /media\/plan-stroke-arm-leg\.png/);
assert.match(html, /media\/team4-stroke-type-atlas\.png/);
assert.match(html, /media\/team4-stroke-lesion-atlas\.png/);
assert.match(html, /media\/team4-stroke-function-pictograms\.png/);
assert.match(html, /js\/stroke-knowledge-profile\.js/);
assert.match(html, /id="strokeKnowledge"/);
assert.match(html, /id="strokeTypeVisual"/);
assert.match(html, /id="strokeLesionVisual"/);
assert.match(html, /id="strokeKnowledgeEdit"/);
assert.match(html, /ภาพ CT ตัวอย่างและวงตำแหน่งโดยประมาณ/);
assert.match(html, /id="strokeImageCredits"/);
assert.doesNotMatch(html, /["']\/blog\/post\.html/);
assert.match(html, /https:\/\/baankaiyaphap-chonburi\.com\/blog\/post\.html\?slug=stroke-ep1/);
assert.match(html, /https:\/\/baankaiyaphap-chonburi\.com\/blog\/post\.html\?slug=neuroplasticity-stroke-recovery/);
assert.match(html, /class="consult-button" href="https:\/\/baankaiyaphap-chonburi\.com\/"/);
assert.match(html, /ขั้นการฝึกของคุณตอนนี้/);
assert.match(html, /ข้อมูลที่ใช้จัดแผนของคุณ/);
assert.doesNotMatch(html, /ระดับการฟื้นตัวตอนนี้/);
assert.doesNotMatch(html, /เหตุผลที่คุณได้รับโปรไฟล์นี้/);
assert.match(html, /class="hero-fx"/);
assert.match(html, /class="fx-path arm-flow"/);
assert.match(html, /class="fx-path leg-flow"/);
assert.match(html, /media\/team4-stroke-demo-grid-a\.png/);
assert.match(html, /js\/exercise-library\.js/);
assert.match(html, /js\/stroke-arm-leg-personalization\.js/);
assert.match(html, /js\/current-location-lead\.js/);
assert.match(html, /buildStrokeArmLegPlan/);
assert.match(html, /requestCurrentLocation/);
assert.match(html, /starterPlan\.classList\.add\(['"]personalized['"]\)/);
assert.ok(
  html.indexOf('js/exercise-library.js') < html.indexOf('js/stroke-arm-leg-personalization.js'),
  'exercise library loads before Stroke personalization',
);
assert.match(html, /demoMarkup\(item\)/);
assert.doesNotMatch(html, /const frames=\{/);
assert.match(html, /exerciseId:'caregiver_bed_rolling'/);
assert.match(html, /exerciseId:'partial_bridge_supported'/);
assert.match(html, /exerciseId:'trunk_transfer_supported'/);
assert.match(html, /CareExerciseLibrary\.getExercise/);

assert.doesNotMatch(html, />\s*คัดลอก prompt\s*</i, 'patient-facing copy avoids technical prompt wording');
assert.doesNotMatch(html, /ข้อมูลถูกส่ง/, 'mockup does not claim backend submission');

console.log('PASS team4 stroke arm-leg structure');
