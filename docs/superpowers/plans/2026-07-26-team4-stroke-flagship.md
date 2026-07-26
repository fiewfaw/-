# Team 4 Stroke Flagship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the real Plan 03 Stroke result page with a selected-only Stroke knowledge atlas, action-based training stages, final-quality medical pictograms, and clear explanations of the functional data used to arrange the plan without breaking current personalization.

**Architecture:** Keep the existing standalone HTML result and personalization engine. Add one focused CommonJS/browser module that validates Stroke knowledge metadata and resolves the selected copy plus sprite positions. Store final raster atlases under `public/media`, render one selected type and one selected lesion crop, and preserve the current Barthel/FAC/arm/spasticity/shoulder programme logic.

**Tech Stack:** Static HTML/CSS/JavaScript, CommonJS-compatible browser modules, Node `assert` check scripts, raster PNG sprite atlases, Playwright visual verification through the bundled runtime.

## Global Constraints

- Do not display a public Body Map or clinical Body Chart.
- Stroke type, hemisphere, and lesion explain the condition; they do not independently select exercises.
- Functional measures remain the source for programme level and FITT.
- Render only the selected Stroke type and selected lesion result after selection.
- Unknown values are valid and must not be guessed.
- Preserve the existing Barthel, transfer, FAC, arm-use, spasticity, shoulder, location, lead, consultation, and AI-copy behaviour.
- Keep the page mobile-first and respect `prefers-reduced-motion`.

---

### Task 1: Selected Stroke Knowledge Model

**Files:**
- Create: `care-app/public/js/stroke-knowledge-profile.js`
- Create: `care-app/tests/stroke-knowledge-profile.check.cjs`

**Interfaces:**
- Consumes: `{ type, hemisphere, lesion }` strings from the result-page state.
- Produces: `buildStrokeKnowledgeProfile(input)` returning `{ type, hemisphere, lesion, typeTitleTh, typeBodyTh, lesionTitleTh, lesionBodyTh, typeSprite, lesionSprite, isComplete }`.

- [ ] **Step 1: Write the failing model check**

```js
const assert = require('node:assert');
const { buildStrokeKnowledgeProfile } = require('../public/js/stroke-knowledge-profile.js');

const ischemic = buildStrokeKnowledgeProfile({ type: 'ischemic', hemisphere: 'left', lesion: 'mca' });
assert.equal(ischemic.typeTitleTh, 'เส้นเลือดสมองตีบหรืออุดตัน');
assert.match(ischemic.lesionTitleTh, /สมองซีกซ้าย.*MCA/);
assert.equal(ischemic.typeSprite, 'type-ischemic');
assert.equal(ischemic.lesionSprite, 'lesion-left-mca');
assert.equal(ischemic.isComplete, true);

const unknown = buildStrokeKnowledgeProfile({ type: 'unknown', hemisphere: 'unknown', lesion: 'unknown' });
assert.equal(unknown.typeSprite, 'type-unknown');
assert.equal(unknown.lesionSprite, 'lesion-unknown');
assert.equal(unknown.isComplete, false);
assert.match(unknown.lesionBodyTh, /ใบสรุปการรักษา/);

for (const invalid of [
  { type: 'clot' },
  { hemisphere: 'middle' },
  { lesion: 'cerebellum_guess' },
]) {
  assert.throws(() => buildStrokeKnowledgeProfile(invalid), /ข้อมูล Stroke ไม่ถูกต้อง/);
}
```

- [ ] **Step 2: Run the check and confirm it fails**

Run: `node care-app/tests/stroke-knowledge-profile.check.cjs`  
Expected: FAIL because `stroke-knowledge-profile.js` does not exist.

- [ ] **Step 3: Implement the minimal browser/CommonJS module**

Implement fixed allowlists:

```js
const TYPES = ['ischemic', 'hemorrhagic', 'unknown'];
const HEMISPHERES = ['left', 'right', 'bilateral', 'unknown'];
const LESIONS = ['mca', 'aca', 'pca', 'brainstem', 'other', 'unknown'];

function buildStrokeKnowledgeProfile(input = {}) {
  const type = input.type || 'unknown';
  const hemisphere = input.hemisphere || 'unknown';
  const lesion = input.lesion || 'unknown';
  // Validate, resolve Thai copy, and return deterministic sprite class names.
}
```

Expose the function as `module.exports` in Node and `window.StrokeKnowledgeProfile` in the browser.

- [ ] **Step 4: Run the model check**

Run: `node care-app/tests/stroke-knowledge-profile.check.cjs`  
Expected: `PASS stroke knowledge profile`.

---

### Task 2: Final Stroke Atlas And Functional Pictograms

**Files:**
- Create: `care-app/public/media/team4-stroke-type-atlas.png`
- Create: `care-app/public/media/team4-stroke-lesion-atlas.png`
- Create: `care-app/public/media/team4-stroke-function-pictograms.png`
- Modify: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Consumes: sprite class names from Task 1.
- Produces: three stable PNG sprite sheets used by CSS background positions.

- [ ] **Step 1: Add failing asset assertions**

```js
for (const asset of [
  'team4-stroke-type-atlas.png',
  'team4-stroke-lesion-atlas.png',
  'team4-stroke-function-pictograms.png',
]) {
  const assetPath = path.join(__dirname, '..', 'public', 'media', asset);
  assert.ok(fs.existsSync(assetPath), `${asset} exists`);
  assert.ok(fs.statSync(assetPath).size > 100000, `${asset} is a real raster asset`);
}
```

- [ ] **Step 2: Run the structure check and confirm it fails**

Run: `node care-app/tests/team4-stroke-arm-leg.check.cjs`  
Expected: FAIL on the first missing atlas asset.

- [ ] **Step 3: Generate the three coordinated raster atlases**

Create:

- Type atlas: three equal cells for ischemic, hemorrhagic, and neutral/unknown.
- Lesion atlas: selected crops for left/right MCA, ACA, PCA, brainstem, bilateral/other, and unknown.
- Function pictogram atlas: four equal cells for bed mobility, sitting/transfer, assisted walking, and affected-arm/shoulder protection.

Use the approved brand palette, clean medical illustration, dark navy labels area without embedded text, and consistent cyan/blue/coral highlights. Do not add decorative arrows or dense radiology annotations.

- [ ] **Step 4: Verify the PNG files and dimensions**

Run:

```powershell
node care-app/tests/team4-stroke-arm-leg.check.cjs
```

Expected: asset assertions pass; later HTML assertions may still fail.

---

### Task 3: Selected-Only Atlas Result And Edit Flow

**Files:**
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Modify: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Consumes: `window.StrokeKnowledgeProfile.buildStrokeKnowledgeProfile(input)` and the Task 2 sprite assets.
- Produces: `renderStrokeKnowledge(profile)` and `setStrokeKnowledge(input)` page functions.

- [ ] **Step 1: Add failing HTML assertions**

```js
assert.match(html, /js\/stroke-knowledge-profile\.js/);
assert.match(html, /id="strokeKnowledgeResult"/);
assert.match(html, /id="strokeTypeVisual"/);
assert.match(html, /id="strokeLesionVisual"/);
assert.match(html, /id="editStrokeKnowledge"/);
assert.match(html, /id="strokeKnowledgeEditor"[^>]*hidden/);
assert.match(html, /buildStrokeKnowledgeProfile/);
assert.doesNotMatch(html, /class="body-map"|class="body-chart"/i);
assert.doesNotMatch(html, /Stroke ของคุณเกิดแบบไหน[\s\S]*atlas-grid[\s\S]*atlas-grid/);
```

- [ ] **Step 2: Run the structure check and confirm it fails**

Run: `node care-app/tests/team4-stroke-arm-leg.check.cjs`  
Expected: FAIL because the real page does not contain the selected-only result.

- [ ] **Step 3: Add selected-only markup and CSS**

Place the Stroke knowledge section after the hero and before related-condition chips. Render:

- One type crop.
- One lesion crop.
- One concise Thai explanation for each.
- `แก้ไขข้อมูล` as a quiet secondary command.
- A collapsed editor containing type, hemisphere, and lesion options plus `ไม่ทราบ`.

Keep all unselected atlas choices hidden when the editor is closed.

- [ ] **Step 4: Add deterministic page behaviour**

Load `js/stroke-knowledge-profile.js` before the inline page script. Initialize from URL parameters:

```js
const params = new URLSearchParams(location.search);
setStrokeKnowledge({
  type: params.get('strokeType') || 'unknown',
  hemisphere: params.get('hemisphere') || 'unknown',
  lesion: params.get('lesion') || 'unknown',
});
```

Editing updates the selected result in place. Unknown values show the neutral fallback. Do not change the exercise-plan input.

- [ ] **Step 5: Run structure and model checks**

Run:

```powershell
node care-app/tests/stroke-knowledge-profile.check.cjs
node care-app/tests/team4-stroke-arm-leg.check.cjs
```

Expected: both PASS.

---

### Task 4: Action-Based Training Stage And Plan-Evidence Rows

**Files:**
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Modify: `care-app/public/js/stroke-arm-leg-personalization.js`
- Modify: `care-app/tests/stroke-arm-leg-personalization.check.cjs`
- Modify: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Consumes: existing plan result fields and source assessment state.
- Produces: patient-facing `stageLabelTh` and four rendered plan-evidence rows.

- [ ] **Step 1: Add failing stage-label assertions**

```js
assert.equal(foundation.stageLabelTh, 'เคลื่อนไหวบนเตียง');
assert.equal(rebuilding.stageLabelTh, 'ฝึกลุกยืนและเริ่มก้าว');
assert.equal(independent.stageLabelTh, 'ฝึกเดินและใช้แขนในชีวิตประจำวัน');
```

Add HTML assertions:

```js
assert.match(html, /ขั้นการฝึกของคุณตอนนี้/);
assert.match(html, /ข้อมูลที่ใช้จัดแผนของคุณ/);
assert.equal(count(/class="plan-evidence-row/g), 4);
assert.doesNotMatch(html, />\s*(ADL|TR|FAC)\s*</);
```

- [ ] **Step 2: Run checks and confirm they fail**

Run:

```powershell
node care-app/tests/stroke-arm-leg-personalization.check.cjs
node care-app/tests/team4-stroke-arm-leg.check.cjs
```

Expected: FAIL on missing `stageLabelTh` and missing evidence rows.

- [ ] **Step 3: Add action-based stage labels to the existing plan result**

Map existing levels without changing thresholds:

```js
const STAGE_LABELS = {
  level_a: 'เคลื่อนไหวบนเตียง',
  level_b: 'ฝึกลุกยืนและเริ่มก้าว',
  level_c: 'ฝึกเดินและใช้แขนในชีวิตประจำวัน',
};
```

For assisted rehabilitation, use `ฝึกนั่งและย้ายตัว` when transfer data supports sitting work; otherwise use `เคลื่อนไหวบนเตียง`.

- [ ] **Step 4: Render four pictogram evidence rows**

Use the pictogram sprite atlas and plain Thai copy for:

- Daily activity assistance.
- Sitting and transfer.
- Walking and assistance.
- Affected arm and shoulder.

Each row explains how the source answer changes the plan. Keep clinical scale names in supporting copy only.

- [ ] **Step 5: Run checks**

Run:

```powershell
node care-app/tests/stroke-arm-leg-personalization.check.cjs
node care-app/tests/team4-stroke-arm-leg.check.cjs
```

Expected: both PASS.

---

### Task 5: Full Regression And Visual Acceptance

**Files:**
- Modify only if verification finds a defect: files changed in Tasks 1-4.

**Interfaces:**
- Consumes: completed page, model, assets, and existing personalization system.
- Produces: a browser-ready Stroke Flagship page and verification evidence.

- [ ] **Step 1: Run all standalone Care App checks**

Run:

```powershell
Get-ChildItem care-app/tests/*.check.cjs | ForEach-Object { node $_.FullName }
```

Expected: every script prints PASS and exits zero.

- [ ] **Step 2: Run the Care App test suite**

Run:

```powershell
cd care-app
npm.cmd test -- --run
```

Expected: all Vitest tests pass with the repository's one-worker configuration.

- [ ] **Step 3: Start a local server on an available port**

Run:

```powershell
cd care-app
npm.cmd run dev
```

Open the selected demo state:

```text
/team4-stroke-arm-leg-mockup.html?strokeType=ischemic&hemisphere=left&lesion=mca
```

- [ ] **Step 4: Verify selected-only and unknown states with Playwright**

Check desktop `1440x1000` and mobile `390x844`:

- Selected state shows one ischemic crop and one left-MCA crop.
- Editor opens and updates the result without navigation.
- Unknown state shows a neutral image and discharge-summary guidance.
- No Body Map appears.
- All assessment panels still open.
- Completing required assessments still unlocks and builds the personalized plan.
- Location permission and denial paths remain usable.
- No horizontal overflow or clipped Thai text.

- [ ] **Step 5: Run `git diff --check` on the allowlist**

Run:

```powershell
git diff --check -- care-app/public/team4-stroke-arm-leg-mockup.html care-app/public/js/stroke-knowledge-profile.js care-app/public/js/stroke-arm-leg-personalization.js care-app/tests/stroke-knowledge-profile.check.cjs care-app/tests/stroke-arm-leg-personalization.check.cjs care-app/tests/team4-stroke-arm-leg.check.cjs
```

Expected: no whitespace errors.
