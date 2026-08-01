const assert = require('node:assert');
const { buildWalkConfidencePlan } = require('../public/js/walk-confidence-personalization.js');

function makeInput(overrides = {}) {
  return {
    fallEvents: 0,
    chairReps: 12,
    assistance: 'independent',
    canStand: true,
    dizziness: false,
    kneePain: 0,
    redFlag: false,
    modifiers: [],
    ...overrides,
  };
}

const independent = buildWalkConfidencePlan(makeInput());
assert.equal(independent.eligible, true);
assert.equal(independent.route, 'self_training');
assert.equal(independent.level, 'build_confidence');
assert.equal(independent.sitToStand.reps, 6);
assert.equal(independent.sitToStand.sets, 2);
assert.equal(independent.sitToStand.restSeconds, '45-60');
assert.equal(independent.weightShift.seconds, '20-30');
assert.equal(independent.weightShift.sets, 2);
assert.equal(independent.ptPriority, 'optional');

const supervision = buildWalkConfidencePlan(makeInput({
  fallEvents: 1,
  chairReps: 7,
  assistance: 'supervision',
}));
assert.equal(supervision.eligible, true);
assert.equal(supervision.level, 'safety_first');
assert.equal(supervision.sitToStand.reps, 3);
assert.equal(supervision.sitToStand.sets, 2);
assert.equal(supervision.sitToStand.restSeconds, '60-90');
assert.equal(supervision.weightShift.seconds, '10-20');
assert.equal(supervision.weightShift.support, 'จับสองมือและมีผู้ดูแลใกล้ ๆ');

const repeatedFalls = buildWalkConfidencePlan(makeInput({
  fallEvents: 2,
  chairReps: 6,
  assistance: 'supervision',
  modifiers: ['osteoporosis'],
}));
assert.equal(repeatedFalls.eligible, true);
assert.equal(repeatedFalls.weightShift.seconds, '10');
assert.equal(repeatedFalls.weightShift.support, 'จับสองมือและมีผู้ดูแลใกล้ ๆ');
assert.equal(repeatedFalls.weightShift.canReduceSupport, false);
assert.equal(repeatedFalls.ptPriority, 'recommended');
assert.ok(repeatedFalls.warningsTh.some((warning) => warning.includes('กระดูกพรุน')));

const zeroChairStand = buildWalkConfidencePlan(makeInput({
  chairReps: 0,
  assistance: 'supervision',
}));
assert.equal(zeroChairStand.eligible, true);
assert.equal(zeroChairStand.sitToStand.type, 'ลุกนั่งจากเก้าอี้สูงโดยใช้มือช่วย');
assert.equal(zeroChairStand.sitToStand.reps, '1-3');
assert.equal(zeroChairStand.sitToStand.sets, 1);
assert.equal(zeroChairStand.sitToStand.support, 'ใช้มือช่วยและมีผู้ดูแลใกล้ ๆ');

const kneePain = buildWalkConfidencePlan(makeInput({ kneePain: 6 }));
assert.equal(kneePain.sitToStand.type, 'เหยียดเข่าในท่านั่งชั่วคราว');
assert.ok(kneePain.sitToStand.substitutionReasonTh.includes('ปวดเข่า'));
assert.ok(kneePain.schedule.some((day) => day.activityTh.includes('เหยียดเข่า')));
assert.ok(!kneePain.schedule.some((day) => day.activityTh.includes('ลุกนั่ง')));

const dizzy = buildWalkConfidencePlan(makeInput({ dizziness: true }));
assert.equal(dizzy.eligible, true);
assert.equal(dizzy.route, 'seated_only_review');
assert.equal(dizzy.sitToStand.type, 'งดท่าลุกยืนชั่วคราว');
assert.equal(dizzy.weightShift.type, 'ถ่ายน้ำหนักลำตัวในท่านั่ง');
assert.equal(dizzy.ptPriority, 'recommended');
assert.ok(dizzy.schedule.some((day) => day.activityTh.includes('ท่านั่ง')));
assert.ok(!dizzy.schedule.some((day) => day.activityTh.includes('ลุกนั่ง')));
assert.ok(!dizzy.schedule.some((day) => day.activityTh.includes('เดิน')));

const dependent = buildWalkConfidencePlan(makeInput({
  assistance: 'physical_assist',
  chairReps: 0,
}));
assert.equal(dependent.eligible, false);
assert.equal(dependent.route, 'assisted_transfer_plan');
assert.equal(dependent.sitToStand, null);
assert.equal(dependent.weightShift, null);

const cannotStand = buildWalkConfidencePlan(makeInput({ canStand: false }));
assert.equal(cannotStand.eligible, false);
assert.equal(cannotStand.route, 'assisted_transfer_plan');

const emergency = buildWalkConfidencePlan(makeInput({ redFlag: true }));
assert.equal(emergency.eligible, false);
assert.equal(emergency.route, 'medical_review');
assert.equal(emergency.sitToStand, null);

const normalized = buildWalkConfidencePlan(makeInput({
  fallEvents: -4,
  chairReps: 100,
  modifiers: 'not-an-array',
}));
assert.equal(normalized.input.fallEvents, 0);
assert.equal(normalized.input.chairReps, 30);
assert.deepEqual(normalized.input.modifiers, []);
assert.equal(normalized.sitToStand.reps, 8);

const normalizedPain = buildWalkConfidencePlan(makeInput({ kneePain: 40 }));
assert.equal(normalizedPain.input.kneePain, 10);
assert.equal(normalizedPain.sitToStand.type, 'เหยียดเข่าในท่านั่งชั่วคราว');

console.log('PASS walk-confidence personalization rules');
