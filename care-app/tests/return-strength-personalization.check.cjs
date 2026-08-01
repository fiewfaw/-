const assert = require('node:assert');
const { buildReturnStrengthPlan } = require('../public/js/return-strength-personalization.js');

function makeInput(overrides = {}) {
  return {
    walkTestCompleted: true,
    walkDistanceMeters: 120,
    postWalkExertion: 3,
    recoveryMinutes: 2,
    chairStandReps: 10,
    assistance: 'independent',
    redFlag: false,
    modifiers: [],
    painScore: 0,
    ...overrides,
  };
}

const advancing = buildReturnStrengthPlan(makeInput());
assert.equal(advancing.route, 'personal_plan');
assert.equal(advancing.levelId, 'advancing');
assert.match(advancing.levelLabelTh, /พร้อมเพิ่มความทนทาน/);
assert.equal(advancing.schedule.length, 7);
assert.equal(advancing.trackingBaseline.walkDistanceMeters, 120);
assert.doesNotMatch(JSON.stringify(advancing.intervalWalking), /120/,
  '2-minute distance is not reused as a walking dose');

const rebuilding = buildReturnStrengthPlan(makeInput({
  postWalkExertion: 5,
  recoveryMinutes: 4,
  chairStandReps: 7,
}));
assert.equal(rebuilding.levelId, 'rebuilding');
assert.match(rebuilding.intervalWalking.time, /1-2 นาที/);

const cautious = buildReturnStrengthPlan(makeInput({ chairStandReps: 3 }));
assert.equal(cautious.levelId, 'cautious');
assert.match(cautious.sitToStand.time, /1-3 ครั้ง/);
assert.match(cautious.intervalWalking.time, /30-60 วินาที/);

const lowestCapacityWins = buildReturnStrengthPlan(makeInput({
  postWalkExertion: 2,
  recoveryMinutes: 1,
  chairStandReps: 4,
}));
assert.equal(lowestCapacityWins.levelId, 'cautious');

const zeroChairStand = buildReturnStrengthPlan(makeInput({ chairStandReps: 0 }));
assert.equal(zeroChairStand.levelId, 'cautious');
assert.match(zeroChairStand.sitToStand.type, /ยกก้น|เก้าอี้สูง|ใช้มือ/);
assert.equal(zeroChairStand.ptPriority, 'recommended');

const cardiopulmonaryCap = buildReturnStrengthPlan(makeInput({
  modifiers: ['stable_cardiopulmonary_limit'],
}));
assert.equal(cardiopulmonaryCap.levelId, 'cautious');
assert.ok(cardiopulmonaryCap.modifierNotesTh.some((note) => /หัวใจ|ปอด/.test(note)));

const cancerCap = buildReturnStrengthPlan(makeInput({
  modifiers: ['cancer_rapid_loss'],
}));
assert.equal(cancerCap.levelId, 'cautious');
assert.ok(cancerCap.modifierNotesTh.some((note) => /น้ำหนัก|กล้ามเนื้อ/.test(note)));

const stableModifiers = buildReturnStrengthPlan(makeInput({
  modifiers: ['diabetes_foot', 'kidney_dialysis', 'osteoporosis'],
}));
assert.equal(stableModifiers.levelId, 'advancing',
  'stable diabetes, kidney disease, and osteoporosis add precautions without automatic down-ranking');
assert.ok(stableModifiers.modifierNotesTh.some((note) => /เท้า|น้ำตาล/.test(note)));
assert.ok(stableModifiers.modifierNotesTh.some((note) => /ฟอกไต|โรคไต/.test(note)));
assert.ok(stableModifiers.modifierNotesTh.some((note) => /กระดูกพรุน/.test(note)));

const painful = buildReturnStrengthPlan(makeInput({ painScore: 6 }));
assert.match(painful.sitToStand.type, /เก้าอี้สูง|ลดช่วง/);
assert.ok(painful.regressionRulesTh.some((rule) => /ปวด/.test(rule)));

const assisted = buildReturnStrengthPlan(makeInput({ assistance: 'physical_assist' }));
assert.equal(assisted.route, 'assisted_rehab');
assert.equal(assisted.schedule.length, 0);

const orthostatic = buildReturnStrengthPlan(makeInput({
  modifiers: ['new_orthostatic_symptoms'],
}));
assert.equal(orthostatic.route, 'medical_review');
assert.equal(orthostatic.schedule.length, 0);

const emergency = buildReturnStrengthPlan(makeInput({ redFlag: true }));
assert.equal(emergency.route, 'medical_review');
assert.equal(emergency.schedule.length, 0);

const incomplete = buildReturnStrengthPlan(makeInput({ walkTestCompleted: false }));
assert.equal(incomplete.route, 'assessment_incomplete');
assert.equal(incomplete.schedule.length, 0);

const invalid = buildReturnStrengthPlan(makeInput({ walkDistanceMeters: 0 }));
assert.equal(invalid.route, 'invalid_input');
assert.ok(invalid.validationErrorsTh.length > 0);

const normalized = buildReturnStrengthPlan(makeInput({
  walkDistanceMeters: 5000,
  postWalkExertion: 99,
  recoveryMinutes: -10,
  chairStandReps: 90,
  modifiers: 'not-an-array',
}));
assert.equal(normalized.route, 'invalid_input');
assert.deepEqual(normalized.input.modifiers, []);

console.log('PASS return-strength personalization rules');
