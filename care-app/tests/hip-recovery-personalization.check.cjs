const assert = require('node:assert');
const {
  buildHipRecoveryPlan,
} = require('../public/js/hip-recovery-personalization.js');

function makeInput(overrides = {}) {
  return {
    treatmentType: 'hemiarthroplasty',
    operationDate: '2026-07-01',
    operatedSide: 'left',
    weightBearingStatus: 'weight_bearing_as_tolerated',
    hipPrecautionStatus: 'posterior_standard',
    painAtRest: 2,
    painWithMovement: 4,
    casBedTransfer: 2,
    casChairTransfer: 1,
    casIndoorWalking: 1,
    barthelTotal: null,
    walkingMinutes: 2,
    sitToStandSeconds: null,
    currentAid: 'walker',
    caregiverAvailable: true,
    homeRisks: ['bathroom'],
    redFlags: {},
    ankleMovementRestricted: false,
    ...overrides,
  };
}

const assisted = buildHipRecoveryPlan(makeInput());
assert.equal(assisted.route, 'personal_plan');
assert.equal(assisted.levelId, 'level_2');
assert.equal(assisted.casTotal, 4);
assert.equal(assisted.circulationRoutine.id, 'ankle_pump');
assert.ok(assisted.activePrecautionsTh.some((item) => /90/.test(item)));
assert.ok(assisted.activities.length >= 2 && assisted.activities.length <= 4);
assert.ok(assisted.activities.every((item) => item.fitt.frequency));
assert.equal(assisted.schedule.length, 7);

const emergency = buildHipRecoveryPlan(makeInput({ redFlags: { chest_pain: true } }));
assert.equal(emergency.route, 'emergency');
assert.equal(emergency.activities.length, 0);
assert.equal(emergency.schedule.length, 0);

const medicalReview = buildHipRecoveryPlan(makeInput({ redFlags: { wound_infection: true } }));
assert.equal(medicalReview.route, 'medical_review');
assert.equal(medicalReview.activities.length, 0);

const verify = buildHipRecoveryPlan(makeInput({ weightBearingStatus: 'unknown' }));
assert.equal(verify.route, 'verify_orders');
assert.ok(verify.activities.length > 0);
assert.ok(verify.activities.every((item) => !/stand|walk|weight_accept|stair/.test(item.id)));
assert.ok(verify.verificationTasksTh.length >= 2);

const fixation = buildHipRecoveryPlan(makeInput({
  treatmentType: 'dynamic_hip_screw',
  hipPrecautionStatus: 'explicitly_none',
}));
assert.equal(fixation.activePrecautionsTh.length, 0);
assert.equal(fixation.treatmentKnowledgeId, 'dynamic_hip_screw');

const arthroplastyUnknownPrecautions = buildHipRecoveryPlan(makeInput({
  treatmentType: 'total_hip_replacement',
  hipPrecautionStatus: 'unknown',
}));
assert.ok(arthroplastyUnknownPrecautions.activePrecautionsTh.length >= 3);
assert.ok(arthroplastyUnknownPrecautions.verificationTasksTh.some((item) => /ข้อห้าม|คำสั่ง/.test(item)));

const dependent = buildHipRecoveryPlan(makeInput({
  casBedTransfer: 0,
  casChairTransfer: 0,
  casIndoorWalking: 0,
  walkingMinutes: null,
}));
assert.equal(dependent.levelId, 'level_0');
assert.equal(dependent.barthelRequired, true);
assert.ok(dependent.activities.every((item) => !/stand|walk|weight_accept|stair/.test(item.id)));

const protectedWeightBearing = buildHipRecoveryPlan(makeInput({
  weightBearingStatus: 'non_weight_bearing',
  casBedTransfer: 2,
  casChairTransfer: 2,
  casIndoorWalking: 0,
  walkingMinutes: null,
}));
assert.equal(protectedWeightBearing.levelId, 'level_1');
assert.ok(protectedWeightBearing.activities.every((item) => !/stand|walk|weight_accept|stair/.test(item.id)));

const independent = buildHipRecoveryPlan(makeInput({
  casBedTransfer: 2,
  casChairTransfer: 2,
  casIndoorWalking: 2,
  walkingMinutes: 8,
  sitToStandSeconds: 15,
}));
assert.equal(independent.levelId, 'level_3');
assert.equal(independent.barthelRequired, false);
assert.equal(independent.optionalAssessments.fiveTimesSitToStand, true);
assert.ok(independent.activities.some((item) => /walk|turn|sit_to_stand/.test(item.id)));

const conditionalBarthel = buildHipRecoveryPlan(makeInput({
  casBedTransfer: 1,
  casChairTransfer: 1,
  casIndoorWalking: 1,
  barthelTotal: 12,
}));
assert.equal(conditionalBarthel.casTotal, 3);
assert.equal(conditionalBarthel.barthelRequired, true);
assert.equal(conditionalBarthel.trackingBaseline.barthelTotal, 12);

const ankleRestricted = buildHipRecoveryPlan(makeInput({ ankleMovementRestricted: true }));
assert.equal(ankleRestricted.circulationRoutine, null);
assert.ok(ankleRestricted.activeWarningsTh.some((item) => /ข้อเท้า|คำสั่ง/.test(item)));

for (const invalidInput of [
  { treatmentType: 'mystery' },
  { weightBearingStatus: 'maybe' },
  { hipPrecautionStatus: 'maybe' },
  { painAtRest: -1 },
  { painWithMovement: 11 },
  { casBedTransfer: 3 },
  { casChairTransfer: -1 },
  { casIndoorWalking: 1.5 },
  { barthelTotal: 21 },
]) {
  const result = buildHipRecoveryPlan(makeInput(invalidInput));
  assert.equal(result.route, 'invalid_input');
  assert.ok(result.validationErrorsTh.length > 0);
}

assert.equal(assisted.starterActivities.length, 2);
assert.equal(assisted.starterActivities[0].id, 'ankle_pump');
assert.ok(assisted.problemBlocks.length === 3);
assert.ok(assisted.problemBlocks.some((block) => block.titleTh === 'กำลังขาและการลุกยืนยังไม่กลับมาเต็มที่'));
assert.ok(assisted.problemBlocks.every((block) => !block.titleTh.includes('คอขวด')));
assert.ok(assisted.ptAssessmentTh.length >= 3);
assert.ok(assisted.progressionRulesTh.length >= 2);
assert.ok(assisted.regressionRulesTh.length >= 2);
assert.equal(assisted.trackingBaseline.casTotal, 4);

console.log('PASS hip recovery personalization rules');
