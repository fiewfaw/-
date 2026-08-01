const assert = require('node:assert');
const {
  buildStrokeArmLegPlan,
} = require('../public/js/stroke-arm-leg-personalization.js');
const exerciseLibrary = require('../public/js/exercise-library.js');

function makeInput(overrides = {}) {
  return {
    barthelTotal: 12,
    facLevel: 3,
    armUseLevel: 3,
    armSpasticityImpact: 0,
    legSpasticityImpact: 0,
    shoulderPainImpact: 0,
    redFlag: false,
    modifiers: [],
    ...overrides,
  };
}

const rebuilding = buildStrokeArmLegPlan(makeInput());
assert.equal(rebuilding.route, 'personal_plan');
assert.equal(rebuilding.levelId, 'level_b');
assert.match(rebuilding.levelLabelTh, /เชื่อมการเคลื่อนไหว/);
assert.equal(rebuilding.schedule.length, 7);
assert.ok(rebuilding.activities.length >= 2 && rebuilding.activities.length <= 4);
assert.ok(rebuilding.activities.every((activity) => activity.fitt.frequency));
assert.ok(rebuilding.activities.every((activity) => activity.exerciseId === activity.id));
assert.ok(rebuilding.activities.every((activity) => activity.familyId));
assert.ok(rebuilding.activities.every((activity) => activity.visual.frames.length === 2));
assert.equal(
  rebuilding.activities[0].titleTh,
  exerciseLibrary.getExercise(rebuilding.activities[0].exerciseId).titleTh,
);

const armSpasticity = buildStrokeArmLegPlan(makeInput({
  armSpasticityImpact: 2,
}));
assert.ok(
  armSpasticity.activities.some((activity) => activity.id === 'spasticity_arm_preparation'),
  'arm spasticity changes the actual exercise plan',
);
assert.ok(armSpasticity.activities.length <= 4);
assert.ok(armSpasticity.modifierNotesTh.some((note) => /เกร็ง.*แขน|แขน.*เกร็ง/.test(note)));

const legSpasticity = buildStrokeArmLegPlan(makeInput({
  legSpasticityImpact: 2,
}));
assert.ok(
  legSpasticity.activities.some((activity) => activity.id === 'spasticity_leg_preparation'),
  'leg spasticity changes the actual exercise plan',
);
assert.ok(legSpasticity.activities.length <= 4);
assert.ok(legSpasticity.modifierNotesTh.some((note) => /เกร็ง.*ขา|ขา.*เกร็ง/.test(note)));

const armAndLegSpasticity = buildStrokeArmLegPlan(makeInput({
  armSpasticityImpact: 2,
  legSpasticityImpact: 2,
}));
assert.ok(armAndLegSpasticity.activities.some((activity) => activity.id === 'spasticity_arm_preparation'));
assert.ok(armAndLegSpasticity.activities.some((activity) => activity.id === 'spasticity_leg_preparation'));
assert.ok(armAndLegSpasticity.activities.length <= 4);

const highImpactSpasticity = buildStrokeArmLegPlan(makeInput({
  armSpasticityImpact: 3,
  legSpasticityImpact: 3,
}));
assert.equal(highImpactSpasticity.ptPriority, 'recommended');
assert.ok(highImpactSpasticity.ptAssessmentTh.some((item) => /เกร็ง|ข้อติด|การจัดท่า/.test(item)));
assert.ok(highImpactSpasticity.modifierNotesTh.some((note) => /ไม่ฝืน|ไม่ดัด|ประเมิน/.test(note)));
assert.ok(
  highImpactSpasticity.activities.every((activity) => !/ยืดแรง|ดัดแรง|ฝืนสุด/.test(
    `${activity.titleTh} ${activity.purposeTh} ${activity.safetyTh}`,
  )),
);

const foundation = buildStrokeArmLegPlan(makeInput({
  barthelTotal: 7,
  facLevel: 3,
  armUseLevel: 3,
}));
assert.equal(foundation.levelId, 'level_a');
assert.match(foundation.activities[0].safetyTh, /ผู้ดูแล|จุดจับ/);
assert.equal(foundation.ptPriority, 'recommended');

const independent = buildStrokeArmLegPlan(makeInput({
  barthelTotal: 17,
  facLevel: 4,
  armUseLevel: 4,
}));
assert.equal(independent.levelId, 'level_c');
assert.match(independent.levelLabelTh, /กิจวัตรจริง/);
assert.equal(independent.activities.length, 4);

const barthelBoundary = [
  [5, 'level_a'], [8, 'level_a'], [9, 'level_b'], [14, 'level_b'], [15, 'level_c'], [20, 'level_c'],
];
for (const [barthelTotal, expected] of barthelBoundary) {
  const result = buildStrokeArmLegPlan(makeInput({ barthelTotal, facLevel: 5, armUseLevel: 5 }));
  assert.equal(result.levelId, expected, `Barthel ${barthelTotal} maps to ${expected}`);
}

const facBoundary = [
  [1, 'level_a'], [2, 'level_b'], [3, 'level_b'], [4, 'level_c'], [5, 'level_c'],
];
for (const [facLevel, expected] of facBoundary) {
  const result = buildStrokeArmLegPlan(makeInput({ barthelTotal: 20, facLevel, armUseLevel: 5 }));
  assert.equal(result.levelId, expected, `FAC ${facLevel} maps to ${expected}`);
}

const armBoundary = [
  [0, 'level_a'], [1, 'level_a'], [2, 'level_b'], [3, 'level_b'], [4, 'level_c'], [5, 'level_c'],
];
for (const [armUseLevel, expected] of armBoundary) {
  const result = buildStrokeArmLegPlan(makeInput({ barthelTotal: 20, facLevel: 5, armUseLevel }));
  assert.equal(result.levelId, expected, `arm-use ${armUseLevel} maps to ${expected}`);
}

const lowestCapacityWins = buildStrokeArmLegPlan(makeInput({
  barthelTotal: 18,
  facLevel: 4,
  armUseLevel: 1,
}));
assert.equal(lowestCapacityWins.levelId, 'level_a');

const assistedByBarthel = buildStrokeArmLegPlan(makeInput({ barthelTotal: 4 }));
assert.equal(assistedByBarthel.route, 'assisted_rehab');
assert.equal(assistedByBarthel.activities.length, 0);

const assistedByWalking = buildStrokeArmLegPlan(makeInput({ facLevel: 0 }));
assert.equal(assistedByWalking.route, 'assisted_rehab');

const medicalReview = buildStrokeArmLegPlan(makeInput({ redFlag: true }));
assert.equal(medicalReview.route, 'medical_review');
assert.equal(medicalReview.schedule.length, 0);

const shoulderModifier = buildStrokeArmLegPlan(makeInput({
  shoulderPainImpact: 2,
  modifiers: ['walking_aid'],
}));
assert.ok(shoulderModifier.modifierNotesTh.some((note) => /ไหล่/.test(note)));
assert.ok(shoulderModifier.modifierNotesTh.some((note) => /อุปกรณ์ช่วยเดิน/.test(note)));
assert.ok(shoulderModifier.ptAssessmentTh.some((item) => /ไหล่|สะบัก/.test(item)));
assert.ok(
  shoulderModifier.activities.some((activity) => /ไหล่|ประคอง|ช่วงที่สบาย/.test(
    `${activity.fitt.intensity} ${activity.fitt.time} ${activity.fitt.type} ${activity.safetyTh}`,
  )),
  'moderate shoulder impact changes the actual arm activity prescription',
);

const severeShoulderPain = buildStrokeArmLegPlan(makeInput({
  shoulderPainImpact: 3,
}));
assert.equal(severeShoulderPain.route, 'medical_review');
assert.match(severeShoulderPain.routeMessageTh, /ไหล่|ปวด|ประเมิน/);

for (const invalidInput of [
  { barthelTotal: -1 }, { barthelTotal: 21 }, { facLevel: 6 }, { armUseLevel: 7 },
  { armSpasticityImpact: 4 }, { legSpasticityImpact: -1 }, { shoulderPainImpact: 4 },
]) {
  const result = buildStrokeArmLegPlan(makeInput(invalidInput));
  assert.equal(result.route, 'invalid_input');
  assert.ok(result.validationErrorsTh.length > 0);
}

assert.deepEqual(rebuilding.trackingBaseline, {
  barthelTotal: 12,
  facLevel: 3,
  armUseLevel: 3,
  armSpasticityImpact: 0,
  legSpasticityImpact: 0,
  shoulderPainImpact: 0,
});
assert.ok(rebuilding.progressionRulesTh.length >= 2);
assert.ok(rebuilding.regressionRulesTh.some((rule) => /หยุด|ลด/.test(rule)));

console.log('PASS stroke arm-leg personalization rules');
