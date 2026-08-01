const assert = require('node:assert');
const {
  buildKneeRecoveryPlan,
} = require('../public/js/knee-recovery-personalization.js');

function makeInput(overrides = {}) {
  return {
    treatmentType: 'total_knee_replacement',
    operationOrInjuryDate: '2026-07-10',
    affectedSide: 'left',
    weightBearingStatus: 'weight_bearing_as_tolerated',
    kneeMotionOrder: 'range_as_tolerated',
    maximumFlexionOrder: null,
    braceStatus: 'none',
    painAtRest: 2,
    painWithMovement: 4,
    swellingTrend: 'stable',
    kneeFlexionDegrees: 82,
    kneeExtensionDeficitDegrees: 8,
    mobilityBedChair: 2,
    mobilitySitToStand: 1,
    mobilityIndoorWalking: 1,
    walkingMinutes: 3,
    fiveTimesSitToStandSeconds: null,
    currentAid: 'walker',
    caregiverAvailable: true,
    homeRisks: ['bathroom'],
    redFlags: {},
    ankleMovementRestricted: false,
    ...overrides,
  };
}

const assisted = buildKneeRecoveryPlan(makeInput());
assert.equal(assisted.route, 'personal_plan');
assert.equal(assisted.levelId, 'level_2');
assert.equal(assisted.mobilityTotal, 4);
assert.equal(assisted.treatmentKnowledgeId, 'total_knee_replacement');
assert.equal(assisted.problemBlocks.length, 3);
assert.equal(assisted.starterActivities.length, 2);
assert.ok(assisted.activities.length >= 2 && assisted.activities.length <= 4);
assert.ok(assisted.activities.every((activity) => activity.fitt.frequency));
assert.equal(assisted.schedule.length, 7);
assert.equal(assisted.optionalAssessments.kneeRange, true);
assert.equal(assisted.optionalAssessments.fiveTimesSitToStand, false);
assert.ok(assisted.problemBlocks.every((block) => !block.titleTh.includes('คอขวด')));

const emergency = buildKneeRecoveryPlan(makeInput({ redFlags: { chest_pain: true } }));
assert.equal(emergency.route, 'emergency');
assert.equal(emergency.activities.length, 0);
assert.equal(emergency.schedule.length, 0);

const circulationEmergency = buildKneeRecoveryPlan(makeInput({ redFlags: { cold_numb_foot: true } }));
assert.equal(circulationEmergency.route, 'emergency');

const medicalReview = buildKneeRecoveryPlan(makeInput({ redFlags: { wound_infection: true } }));
assert.equal(medicalReview.route, 'medical_review');
assert.equal(medicalReview.activities.length, 0);

const unknownWeightBearing = buildKneeRecoveryPlan(makeInput({ weightBearingStatus: 'unknown' }));
assert.equal(unknownWeightBearing.route, 'verify_orders');
assert.ok(unknownWeightBearing.activities.length > 0);
assert.ok(unknownWeightBearing.activities.every((activity) => !/stand|walk|weight|stair/.test(activity.id)));
assert.ok(unknownWeightBearing.verificationTasksTh.some((item) => /ลงน้ำหนัก/.test(item)));

const unknownMotion = buildKneeRecoveryPlan(makeInput({ kneeMotionOrder: 'unknown' }));
assert.equal(unknownMotion.route, 'verify_orders');
assert.equal(unknownMotion.optionalAssessments.kneeRange, false);
assert.ok(unknownMotion.activities.every((activity) => !/heel_slide|knee_extension|knee_flexion/.test(activity.id)));
assert.ok(unknownMotion.verificationTasksTh.some((item) => /งอ|เหยียด|ขยับเข่า/.test(item)));

const fixedLimit = buildKneeRecoveryPlan(makeInput({
  kneeMotionOrder: 'fixed_limit',
  maximumFlexionOrder: 60,
  kneeFlexionDegrees: 50,
}));
assert.equal(fixedLimit.route, 'personal_plan');
assert.ok(fixedLimit.activeOrdersTh.some((item) => /60/.test(item)));
assert.ok(fixedLimit.activities
  .filter((activity) => activity.id === 'heel_slide')
  .every((activity) => /60/.test(activity.fitt.intensity)));

const lockedBrace = buildKneeRecoveryPlan(makeInput({
  kneeMotionOrder: 'locked_extension',
  braceStatus: 'locked',
  kneeFlexionDegrees: null,
  kneeExtensionDeficitDegrees: null,
}));
assert.equal(lockedBrace.optionalAssessments.kneeRange, false);
assert.ok(lockedBrace.activities.every((activity) => !/heel_slide|knee_extension/.test(activity.id)));

const protectedFracture = buildKneeRecoveryPlan(makeInput({
  treatmentType: 'tibial_plateau_fracture',
  weightBearingStatus: 'non_weight_bearing',
  kneeMotionOrder: 'fixed_limit',
  maximumFlexionOrder: 45,
  braceStatus: 'hinged',
  mobilityIndoorWalking: 0,
  walkingMinutes: null,
}));
assert.equal(protectedFracture.levelId, 'level_1');
assert.equal(protectedFracture.healingTimelineType, 'fracture');
assert.ok(protectedFracture.activities.every((activity) => !/stand|walk|weight|stair/.test(activity.id)));

const dependent = buildKneeRecoveryPlan(makeInput({
  mobilityBedChair: 0,
  mobilitySitToStand: 0,
  mobilityIndoorWalking: 0,
  walkingMinutes: null,
}));
assert.equal(dependent.levelId, 'level_0');
assert.ok(dependent.activities.every((activity) => !/stand|walk|weight|stair/.test(activity.id)));

const independent = buildKneeRecoveryPlan(makeInput({
  weightBearingStatus: 'full',
  mobilityBedChair: 2,
  mobilitySitToStand: 2,
  mobilityIndoorWalking: 2,
  walkingMinutes: 10,
  fiveTimesSitToStandSeconds: 16,
}));
assert.equal(independent.levelId, 'level_3');
assert.equal(independent.optionalAssessments.fiveTimesSitToStand, true);
assert.ok(independent.activities.some((activity) => /walk|sit_to_stand/.test(activity.id)));

const ankleRestricted = buildKneeRecoveryPlan(makeInput({ ankleMovementRestricted: true }));
assert.equal(ankleRestricted.circulationRoutine, null);
assert.ok(ankleRestricted.activeWarningsTh.some((item) => /ข้อเท้า|คำสั่ง/.test(item)));

const worseningSwelling = buildKneeRecoveryPlan(makeInput({ swellingTrend: 'increasing' }));
assert.ok(worseningSwelling.regressionRulesTh.some((item) => /บวม/.test(item)));
assert.ok(worseningSwelling.activeWarningsTh.some((item) => /บวม/.test(item)));

for (const invalidInput of [
  { treatmentType: 'mystery' },
  { weightBearingStatus: 'maybe' },
  { kneeMotionOrder: 'maybe' },
  { braceStatus: 'maybe' },
  { painAtRest: -1 },
  { painWithMovement: 11 },
  { kneeFlexionDegrees: 181 },
  { kneeExtensionDeficitDegrees: -1 },
  { mobilityBedChair: 3 },
  { mobilitySitToStand: -1 },
  { mobilityIndoorWalking: 1.5 },
]) {
  const result = buildKneeRecoveryPlan(makeInput(invalidInput));
  assert.equal(result.route, 'invalid_input');
  assert.ok(result.validationErrorsTh.length > 0);
}

console.log('PASS knee recovery personalization rules');
