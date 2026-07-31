const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

const source = fs.readFileSync(
  'care-app/public/js/frailty-independence-personalization.js',
  'utf8',
)
const context = { window: {} }
vm.runInNewContext(source, context)
const engine = context.window.FrailtyIndependencePlan

const supported = engine.buildFrailtyIndependencePlan({
  redFlag: false,
  chairStandReps: 0,
  transferAssist: 'physical_help',
  nearFalls30d: 3,
  householdWalking: 'assisted',
  fatigue010: 8,
  activityMinutes: 2,
  recoveryMinutes: 15,
  adlDecline: true,
  weightLossOrLowIntake: true,
  modifiers: ['osteoporosis', 'home_risk'],
})
assert.equal(supported.route, 'personal_plan')
assert.equal(supported.level, 'supported_start')
assert.equal(supported.problems.length, 3)
assert.ok(supported.activities.length <= 4)
assert.match(supported.ptAssessmentTh.join(' '), /Barthel/)

const rebuildInput = {
  redFlag: false,
  chairStandReps: 4,
  transferAssist: 'uses_arms',
  nearFalls30d: 2,
  householdWalking: 'furniture',
  fatigue010: 6,
  activityMinutes: 4,
  recoveryMinutes: 8,
  adlDecline: false,
  weightLossOrLowIntake: false,
  modifiers: ['osteoporosis'],
}
const rebuild = engine.buildFrailtyIndependencePlan(rebuildInput)
assert.equal(rebuild.level, 'rebuild')
assert.equal(rebuild.problems.length, 3)
assert.ok(rebuild.activities.length <= 4)
assert.doesNotMatch(rebuild.ptAssessmentTh.join(' '), /Barthel/)

const progressive = engine.buildFrailtyIndependencePlan({
  redFlag: false,
  chairStandReps: 13,
  transferAssist: 'independent',
  nearFalls30d: 0,
  householdWalking: 'independent',
  fatigue010: 2,
  activityMinutes: 20,
  recoveryMinutes: 3,
  adlDecline: false,
  weightLossOrLowIntake: false,
  modifiers: [],
})
assert.equal(progressive.level, 'progressive')

const medical = engine.buildFrailtyIndependencePlan({
  ...rebuildInput,
  redFlag: true,
})
assert.equal(medical.route, 'medical_review')
assert.equal(medical.activities.length, 0)

const needsReview = engine.buildFrailtyIndependencePlan({
  ...rebuildInput,
  chairStandReps: null,
  activityMinutes: null,
  recoveryMinutes: null,
  transferAssist: 'physical_help',
  householdWalking: 'assisted',
})
assert.equal(needsReview.route, 'professional_review')
assert.equal(needsReview.activities.length, 0)

const withCampaign = engine.buildFrailtyIndependencePlan({
  ...rebuildInput,
  campaign: 'facebook-frailty-a',
})
assert.deepEqual(JSON.parse(JSON.stringify(withCampaign)), JSON.parse(JSON.stringify(rebuild)))
assert.ok(supported.modifiers.length <= 2)
assert.ok(supported.activities.every((item) => item.fitt && item.safetyTh))

console.log('PASS FRAIL-01 personalization routes, problems, FITT, and boundaries')
