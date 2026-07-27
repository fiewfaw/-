# Stroke CT Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Stroke type brain renders with vessel-mechanism illustrations and replace the lesion-location renders with honestly annotated real CT reference images while preserving the approved Team 4 flow.

**Architecture:** Keep the existing selected-only `StrokeKnowledgeProfile` interface and CSS sprite switching. Replace the two atlas assets in place, add a structured attribution manifest plus a compact credits disclosure, and keep the current male cover unchanged. Build the CT atlas deterministically from licensed source images so circles indicate a visible lesion when present and an approximate region when CT does not visibly show the lesion.

**Tech Stack:** Static HTML/CSS/JavaScript, Node CommonJS checks, generated PNG assets, real CT images licensed for reuse, Sharp or bundled image tooling for deterministic atlas assembly, Playwright mobile visual checks.

## Global Constraints

- Preserve `care-app/public/media/plan-stroke-arm-leg.png`; the approved cover already uses a male patient.
- Do not expose patient identifiers or source-image metadata.
- Never present an approximate circle as a visible lesion on CT.
- Keep the disclaimer: `ภาพ CT ตัวอย่างและวงตำแหน่งโดยประมาณ ไม่ใช่ภาพ CT ของคุณ ตำแหน่งจริงควรตรวจสอบจากใบสรุปการรักษาหรือแพทย์ผู้ดูแล`.
- Use only Public Domain, CC0, CC BY, or CC BY-SA assets with file-level licensing evidence.
- Do not use non-commercial-only datasets or unlicensed hospital/Radiopaedia images.
- Preserve selected-only switching, the `แก้ไขข้อมูล` control, all assessment logic, the exercise plan, lead form, location capture, consultation link, and AI summary behavior.

---

### Task 1: Lock Source Attribution And Asset Contracts

**Files:**
- Create: `care-app/public/media/stroke-ct-attribution.json`
- Modify: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Produces: `stroke-ct-attribution.json` containing `title`, `sourceUrl`, `creator`, `license`, `licenseUrl`, and `modifications` for every source image.
- Produces: test assertions that both atlas files, the attribution manifest, the disclaimer, and credits control exist.

- [ ] **Step 1: Add failing structure assertions**

Add checks equivalent to:

```js
const attributionPath = path.join(__dirname, '..', 'public', 'media', 'stroke-ct-attribution.json');
assert.ok(fs.existsSync(attributionPath), 'CT attribution manifest exists');
const attribution = JSON.parse(fs.readFileSync(attributionPath, 'utf8'));
assert.ok(attribution.sources.length >= 2, 'CT sources are attributed');
assert.match(html, /ภาพ CT ตัวอย่างและวงตำแหน่งโดยประมาณ/);
assert.match(html, /id="strokeImageCredits"/);
```

- [ ] **Step 2: Run the structure check and confirm failure**

Run:

```powershell
node care-app\tests\team4-stroke-arm-leg.check.cjs
```

Expected: FAIL because the manifest and credits control do not exist.

- [ ] **Step 3: Create the attribution manifest**

Record each selected source with exact Commons/article URL, author, license, license URL, and modifications such as crop, grayscale normalization, mirroring, and annotation circle.

- [ ] **Step 4: Commit the source contract**

```powershell
git add -- care-app/tests/team4-stroke-arm-leg.check.cjs care-app/public/media/stroke-ct-attribution.json
git commit -m "test: lock stroke CT attribution"
```

### Task 2: Replace The Stroke Type Atlas With Vessel Mechanisms

**Files:**
- Replace: `care-app/public/media/team4-stroke-type-atlas.png`
- Test: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Consumes: existing CSS classes `type-ischemic`, `type-hemorrhagic`, and `type-unknown`.
- Produces: one 3-column PNG sprite with identical framing in all three cells.

- [ ] **Step 1: Generate the medical vessel atlas**

Generate three matching panels without text:

```text
Panel 1: cerebral artery with a clearly localized clot and reduced downstream flow.
Panel 2: cerebral artery wall rupture with restrained localized bleeding.
Panel 3: neutral cerebral arterial tree with no pathology highlight.
Premium clinical illustration, pale blue-white background, navy and cyan vessels, coral only for bleeding, no brain render, no labels, no arrows, no watermark.
```

- [ ] **Step 2: Inspect the output before replacing the project asset**

Verify that the same vessel scale and viewpoint are used in all cells, the mechanism is understandable without labels, and the hemorrhage does not look graphic.

- [ ] **Step 3: Copy the approved output over the existing atlas path**

Keep the filename unchanged so no UI logic changes are required.

- [ ] **Step 4: Run the asset contract**

```powershell
node care-app\tests\team4-stroke-arm-leg.check.cjs
```

Expected: the type atlas exists and remains larger than 100 KB.

### Task 3: Build The Real CT Location Atlas

**Files:**
- Create: `care-app/scripts/build-stroke-ct-atlas.mjs`
- Create: `care-app/public/media/stroke-ct-sources/ischemic-mca.png`
- Create: `care-app/public/media/stroke-ct-sources/intracerebral-hemorrhage.jpg`
- Create: `care-app/public/media/stroke-ct-sources/normal-reference.png`
- Replace: `care-app/public/media/team4-stroke-lesion-atlas.png`
- Modify: `care-app/public/media/stroke-ct-attribution.json`

**Interfaces:**
- Produces: `team4-stroke-lesion-atlas.png`, a 3x3 sprite matching the existing CSS positions.
- Cell order remains `left-mca`, `left-aca`, `left-pca`, `right-mca`, `right-aca`, `right-pca`, `brainstem`, `bilateral-other`, `unknown`.

- [ ] **Step 1: Download only the approved licensed source files**

Use file-level metadata from Wikimedia Commons or a CC BY 4.0 open-access article. Strip metadata when saving project copies.

- [ ] **Step 2: Implement deterministic atlas composition**

The script must:

```js
const cells = [
  'left-mca', 'left-aca', 'left-pca',
  'right-mca', 'right-aca', 'right-pca',
  'brainstem', 'bilateral-other', 'unknown',
];
```

Normalize every source to a square CT frame, preserve the skull and brain outline, add a thin cyan circle for ischemic location, add a thin coral circle only for hemorrhagic reference, and leave `unknown` without a circle. Do not paint a lesion into the CT.

- [ ] **Step 3: Render the atlas and inspect every cell**

Confirm the circle stays inside the brain, does not cover the lesion, left/right mappings match the app labels, and no source text or identifiers remain.

- [ ] **Step 4: Run asset checks**

```powershell
node care-app\tests\team4-stroke-arm-leg.check.cjs
```

Expected: PASS for file presence and production image size.

- [ ] **Step 5: Commit the CT atlas unit**

```powershell
git add -- care-app/scripts/build-stroke-ct-atlas.mjs care-app/public/media/stroke-ct-sources care-app/public/media/team4-stroke-lesion-atlas.png care-app/public/media/stroke-ct-attribution.json
git commit -m "feat: add annotated stroke CT atlas"
```

### Task 4: Add Honest Patient-Facing Disclosure

**Files:**
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Test: `care-app/tests/team4-stroke-arm-leg.check.cjs`

**Interfaces:**
- Consumes: existing selected-only cards and `StrokeKnowledgeProfile` output.
- Produces: `#strokeImageCredits`, a compact disclosure that does not disturb the approved layout.

- [ ] **Step 1: Add the disclaimer beneath the lesion card**

Use the exact copy from Global Constraints and keep it visually secondary.

- [ ] **Step 2: Add a compact image-source disclosure**

Add a small `แหล่งภาพ CT` button or details element that reveals source title, creator, and license from the committed manifest content without opening a large new card.

- [ ] **Step 3: Preserve selected-only behavior**

Verify the page still renders one type panel and one location panel after changing `strokeType`, `strokeHemisphere`, and `strokeLesion`.

- [ ] **Step 4: Run Stroke checks**

```powershell
$tests = @(
  'care-app\tests\stroke-knowledge-profile.check.cjs',
  'care-app\tests\stroke-arm-leg-personalization.check.cjs',
  'care-app\tests\team4-stroke-arm-leg.check.cjs'
)
foreach ($test in $tests) { node $test; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

Expected: all three checks PASS.

### Task 5: Mobile Visual And Regression Acceptance

**Files:**
- Verify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Verify: `care-app/public/media/team4-stroke-type-atlas.png`
- Verify: `care-app/public/media/team4-stroke-lesion-atlas.png`

**Interfaces:**
- Produces: a review URL with selected ischemic, left MCA, and walking-stage query parameters.

- [ ] **Step 1: Start the static review server**

```powershell
python -m http.server 3005 -d care-app\public
```

- [ ] **Step 2: Check the selected result at mobile width**

Open:

```text
http://127.0.0.1:3005/team4-stroke-arm-leg-mockup.html?strokeType=ischemic&strokeHemisphere=left&strokeLesion=mca&stage=walk
```

At 390x844 verify no horizontal overflow, both selected images are fully visible, the circle remains legible, and the male cover remains unchanged.

- [ ] **Step 3: Check alternate and unknown states**

Switch to hemorrhagic/right/brainstem and then unknown/unknown/unknown. Verify titles, sprite positions, ring color semantics, neutral unknown image, editor close behavior, and zero console errors.

- [ ] **Step 4: Run the app regression suite serially**

```powershell
npm.cmd test -- --maxWorkers=1 --fileParallelism=false
```

Record any pre-existing unrelated failure separately. Do not change unrelated product copy to make a stale assertion pass.

- [ ] **Step 5: Commit the UI integration**

```powershell
git add -- care-app/public/team4-stroke-arm-leg-mockup.html care-app/tests/team4-stroke-arm-leg.check.cjs care-app/public/media/team4-stroke-type-atlas.png
git commit -m "feat: refresh stroke medical visuals"
```
