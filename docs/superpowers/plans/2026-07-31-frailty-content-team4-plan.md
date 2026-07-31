# Frailty Content Cluster and Team 4 Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish four evidence-based frailty articles and add a mobile-first Team 4 FRAIL-01 result that combines three priority problems, contextual article links, and a fixed-rule personalized FITT plan.

**Architecture:** Keep the existing static blog pipeline (`content/posts` + `blog/articles.json` + `sitemap.xml`) and the existing Team 4 prototype pattern (`public/*.html` + `public/js/*.js`). Add one shared frailty content registry so the four canonical article URLs and labels are not duplicated across plan pages. Keep calculation campaign-agnostic and use a pure JavaScript personalization engine that can be tested independently from the page.

**Tech Stack:** Static HTML/CSS, Markdown with HTML content blocks, CommonJS Node checks, browser JavaScript, existing Care App public assets, image generation for raster covers.

## Global Constraints

- The app is the primary paid-ad destination; articles are contextual education and organic-search content.
- Team 1 is identical for all users. Campaign source never alters questions, scoring, plan selection, or recommendations.
- Team 4 uses one main profile, exactly three primary problems, and no more than two supporting modifiers.
- Starter plan contains no more than two activities; personalized plan contains no more than four activities.
- Use `พบสัญญาณ` or `เข้าได้กับ`, never diagnose frailty from self-report.
- Red flags and medical instability block normal exercise progression.
- Article links open in a new tab and return to the unmodified main app path.
- Do not reproduce a licensed assessment instrument without confirmed permission.
- No real patient data in fixtures, tests, analytics, or article examples.
- Preserve unrelated dirty-worktree files. Stage only the explicit files from each task.

---

## File Map

### Create

- `blog/tests/frailty-article-cluster.check.cjs` - verifies four posts, metadata, safety language, index entries, images, internal links, and sitemap entries.
- `content/posts/frailty-in-older-adults.md` - foundational definition article.
- `content/posts/frailty-assessment.md` - screening and assessment article.
- `content/posts/frailty-recovery-potential.md` - rehabilitation-potential article.
- `content/posts/frailty-care-and-physical-therapy.md` - management and paid-care decision article.
- `blog/images/glossary/frailty-in-older-adults-cover.webp` - article 1 cover.
- `blog/images/glossary/frailty-assessment-cover.webp` - article 2 cover.
- `blog/images/glossary/frailty-recovery-potential-cover.webp` - article 3 cover.
- `blog/images/glossary/frailty-care-cover.webp` - article 4 cover.
- `care-app/tests/frailty-content-registry.check.cjs` - verifies canonical URL registry and article labels.
- `care-app/public/js/frailty-content.js` - shared browser-safe article metadata.
- `care-app/tests/frailty-independence-personalization.check.cjs` - tests fixed-rule plan construction.
- `care-app/public/js/frailty-independence-personalization.js` - pure fixed-rule FRAIL-01 engine.
- `care-app/tests/team4-frailty-independence.check.cjs` - verifies Team 4 structure and article integration.
- `care-app/public/team4-frailty-independence-mockup.html` - reviewable Team 4 FRAIL-01 page.
- `care-app/public/media/plan-frailty-independence.webp` - FRAIL-01 cover image.
- `care-app/public/media/team4-frailty-demo-grid.webp` - starter/personalized activity frames.

### Modify

- `blog/articles.json` - add the four published article records.
- `sitemap.xml` - add exactly one canonical URL per article.

## Shared Interfaces

```js
// care-app/public/js/frailty-content.js
window.FrailtyContent = {
  articles: {
    definition: { slug, titleTh, url, linkLabelTh },
    assessment: { slug, titleTh, url, linkLabelTh },
    recovery: { slug, titleTh, url, linkLabelTh },
    care: { slug, titleTh, url, linkLabelTh },
  },
  getArticle(key) {},
};

// care-app/public/js/frailty-independence-personalization.js
window.FrailtyIndependencePlan = {
  buildFrailtyIndependencePlan(input) {},
};
```

`buildFrailtyIndependencePlan(input)` consumes:

```js
{
  redFlag: false,
  chairStandReps: 0,
  transferAssist: "independent" | "uses_arms" | "supervision" | "physical_help",
  nearFalls30d: 0,
  householdWalking: "independent" | "furniture" | "device" | "assisted" | "unable",
  fatigue010: 0,
  activityMinutes: 0,
  recoveryMinutes: 0,
  adlDecline: false,
  weightLossOrLowIntake: false,
  modifiers: string[],
}
```

It returns:

```js
{
  route: "personal_plan" | "professional_review" | "medical_review",
  level: "supported_start" | "rebuild" | "progressive",
  levelLabelTh: string,
  mainPlanTitleTh: "แผนฟื้นกำลัง กลับมาช่วยเหลือตัวเอง",
  problems: [{ id, titleTh, summaryTh, score }],
  modifiers: [{ id, labelTh, guidanceTh }],
  activities: [{ id, titleTh, purposeTh, fitt, safetyTh, visualKey }],
  weeklySchedule: [{ dayTh, itemsTh }],
  progressionTh: string[],
  regressionTh: string[],
  ptAssessmentTh: string[],
  stopPointTh: string,
}
```

---

### Task 1: Add the Frailty Article Contract Test

**Files:**
- Create: `blog/tests/frailty-article-cluster.check.cjs`

**Interfaces:**
- Consumes: `content/posts/*.md`, `blog/articles.json`, `sitemap.xml`, and cover paths.
- Produces: one executable acceptance check for all four articles.

- [ ] **Step 1: Write the failing cluster test**

Create a CommonJS check that defines the four records and asserts each file,
cover, frontmatter field, blog index entry, and unique sitemap entry:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const records = [
  ['frailty-in-older-adults', 'frailty-in-older-adults-cover.webp'],
  ['frailty-assessment', 'frailty-assessment-cover.webp'],
  ['frailty-recovery-potential', 'frailty-recovery-potential-cover.webp'],
  ['frailty-care-and-physical-therapy', 'frailty-care-cover.webp'],
];
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

for (const [slug, cover] of records) {
  const postPath = path.join(root, 'content', 'posts', `${slug}.md`);
  const coverPath = path.join(root, 'blog', 'images', 'glossary', cover);
  assert.ok(fs.existsSync(postPath), `${slug} post exists`);
  assert.ok(fs.existsSync(coverPath), `${slug} cover exists`);
  const post = fs.readFileSync(postPath, 'utf8');
  for (const field of ['title', 'seo_title', 'description', 'date', 'updated', 'image', 'tags']) {
    assert.match(post, new RegExp(`^${field}:`, 'm), `${slug} includes ${field}`);
  }
  assert.ok(articles.some((item) => item.slug === slug), `${slug} is indexed`);
  assert.equal((sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length, 1, `${slug} is in sitemap once`);
}

assert.match(fs.readFileSync(path.join(root, 'content', 'posts', 'frailty-in-older-adults.md'), 'utf8'), /ไม่ใช่(?:ส่วนหนึ่ง|ผลลัพธ์).*ความแก่|ไม่ใช่.*แก่ตามวัย/s);
assert.match(fs.readFileSync(path.join(root, 'content', 'posts', 'frailty-assessment.md'), 'utf8'), /คัดกรอง[\s\S]+ไม่ใช่การวินิจฉัย/);
assert.match(fs.readFileSync(path.join(root, 'content', 'posts', 'frailty-recovery-potential.md'), 'utf8'), /ไม่(?:สามารถ|ควร).*รับประกัน.*ฟื้น|ไม่รับประกัน.*ฟื้น/s);
assert.match(fs.readFileSync(path.join(root, 'content', 'posts', 'frailty-care-and-physical-therapy.md'), 'utf8'), /ไม่จำเป็นต้องจ้าง|ลด.*การจ้าง|ยุติ.*การจ้าง/s);
console.log('PASS frailty article cluster, index, safety copy, and sitemap');
```

- [ ] **Step 2: Run the test and confirm the expected failure**

Run: `node blog/tests/frailty-article-cluster.check.cjs`

Expected: FAIL because `frailty-in-older-adults.md` does not exist.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- blog/tests/frailty-article-cluster.check.cjs
git commit -m "test: define frailty article cluster"
```

---

### Task 2: Write and Register the Four Articles

**Files:**
- Create: the four `content/posts/frailty-*.md` files.
- Create: the four `blog/images/glossary/frailty-*.webp` files.
- Modify: `blog/articles.json`.
- Modify: `sitemap.xml`.
- Test: `blog/tests/frailty-article-cluster.check.cjs`.

**Interfaces:**
- Consumes: existing article frontmatter, `.tldr-box`, `.toc-box`, `.article-figure`, `.highlight-box`, and `.faq-list` styles.
- Produces: four canonical article slugs and URLs used by the Care App registry.

- [ ] **Step 1: Generate four coherent 16:9 covers**

Use a premium Thai home-care visual system: realistic Thai older adult and
adult child/caregiver, bright accessible home, teal/cyan clinical overlays used
sparingly, no text baked into images, no distress marketing, and a distinct
activity for each article. Export at 1600x900 WebP using the exact filenames in
the file map.

- [ ] **Step 2: Write Article 1 with its complete content**

Include a concise TL;DR, definition, distinction from ageing/disease/disability/
sarcopenia, the small-stressor explanation, observable signals, stable-state
caveat, next step, FAQ, references, and CTA:

```html
<a class="article-cta" href="/care-app/">เริ่มประเมินจากแอพหลัก</a>
```

- [ ] **Step 3: Write Article 2 with its complete content**

Explain observation versus screening versus functional testing versus CGA.
Describe the Fried domains without reproducing a copyrighted form. Include
chair rise, gait speed, balance, ADL/IADL, safe self-entry boundaries, FAQ,
references, and CTA:

```html
<a class="article-cta" href="/care-app/">กลับไปตอบแบบประเมินของฉัน</a>
```

- [ ] **Step 4: Write Article 3 with its complete content**

Explain rehabilitation potential, why age alone is insufficient, favorable
signals, limiting factors, measurable functional gains, reassessment, no-cure
guarantee, FAQ, references, and CTA:

```html
<a class="article-cta" href="/care-app/">ดูแผนและเป้าหมายของฉัน</a>
```

- [ ] **Step 5: Write Article 4 with its complete content**

Cover person-centred goals, progressive activity, strength/balance/mobility/
endurance, nutrition and medication boundaries, home risks, self-management,
home PT assessment, medical-first situations, paid-care stop point, FAQ,
references, and CTA:

```html
<a class="article-cta" href="/care-app/">กลับไปดูสิ่งที่ทำเองได้และสิ่งที่ควรให้กายภาพช่วย</a>
```

- [ ] **Step 6: Add four records to the start of the blog index**

Each object must use the canonical slug, a plain Thai description, date
`2026-07-31`, the matching `/blog/images/glossary/*.webp` path, and relevant
Thai/English tags. Preserve all existing records.

- [ ] **Step 7: Add four unique sitemap entries**

Use the canonical URL form:

```xml
<url>
  <loc>https://baankaiyaphap-chonburi.com/blog/post.html?slug=frailty-in-older-adults</loc>
  <lastmod>2026-07-31</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

Repeat with the other three canonical slugs.

- [ ] **Step 8: Run article and existing SEO checks**

Run:

```powershell
node blog/tests/frailty-article-cluster.check.cjs
node blog/tests/article-seo.check.cjs
node tests/site-navigation.check.cjs
```

Expected: all print `PASS` and exit 0.

- [ ] **Step 9: Commit the article cluster only**

```powershell
git add -- content/posts/frailty-in-older-adults.md content/posts/frailty-assessment.md content/posts/frailty-recovery-potential.md content/posts/frailty-care-and-physical-therapy.md blog/images/glossary/frailty-in-older-adults-cover.webp blog/images/glossary/frailty-assessment-cover.webp blog/images/glossary/frailty-recovery-potential-cover.webp blog/images/glossary/frailty-care-cover.webp blog/articles.json sitemap.xml
git commit -m "feat: publish frailty knowledge cluster"
```

---

### Task 3: Add the Shared Frailty Content Registry

**Files:**
- Create: `care-app/tests/frailty-content-registry.check.cjs`.
- Create: `care-app/public/js/frailty-content.js`.

**Interfaces:**
- Consumes: the four canonical article slugs from Task 2.
- Produces: `window.FrailtyContent.getArticle(key)` for Team 4 pages.

- [ ] **Step 1: Write the failing registry test**

Use `vm.runInNewContext` to load the browser script and assert four keys, live
absolute URLs, target-safe metadata, and a thrown error for an unknown key.

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('care-app/public/js/frailty-content.js', 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const registry = context.window.FrailtyContent;
assert.deepEqual(Object.keys(registry.articles), ['definition', 'assessment', 'recovery', 'care']);
for (const item of Object.values(registry.articles)) {
  assert.match(item.url, /^https:\/\/baankaiyaphap-chonburi\.com\/blog\/post\.html\?slug=frailty-/);
}
assert.throws(() => registry.getArticle('missing'), /Unknown frailty article/);
console.log('PASS shared frailty content registry');
```

- [ ] **Step 2: Run and confirm failure**

Run: `node care-app/tests/frailty-content-registry.check.cjs`

Expected: FAIL because the registry script does not exist.

- [ ] **Step 3: Implement the registry**

Create an IIFE that freezes the four records and exposes `getArticle(key)`.
Use the exact live URLs and Thai labels from the design spec.

- [ ] **Step 4: Run and confirm pass**

Run: `node care-app/tests/frailty-content-registry.check.cjs`

Expected: `PASS shared frailty content registry`.

- [ ] **Step 5: Commit**

```powershell
git add -- care-app/tests/frailty-content-registry.check.cjs care-app/public/js/frailty-content.js
git commit -m "feat: add frailty knowledge registry"
```

---

### Task 4: Build the FRAIL-01 Personalization Engine

**Files:**
- Create: `care-app/tests/frailty-independence-personalization.check.cjs`.
- Create: `care-app/public/js/frailty-independence-personalization.js`.

**Interfaces:**
- Consumes: the exact `input` object in Shared Interfaces.
- Produces: the exact `result` object in Shared Interfaces.

- [ ] **Step 1: Write failing tests for three functional levels and rerouting**

Test at least:

- a supported-start profile with physical transfer help and assisted walking;
- a rebuild profile using arms, furniture walking, moderate fatigue;
- a progressive profile with independent mobility and low fatigue;
- a red-flag profile that returns `medical_review` and no activities;
- a professional-review profile when safe self-testing data are incomplete but
  assistance is substantial;
- no more than three problems, two modifiers, and four activities;
- Barthel is requested only when `adlDecline === true`;
- no campaign field affects output.

Representative assertion:

```js
const result = engine.buildFrailtyIndependencePlan({
  redFlag: false,
  chairStandReps: 4,
  transferAssist: 'uses_arms',
  nearFalls30d: 2,
  householdWalking: 'furniture',
  fatigue010: 6,
  activityMinutes: 4,
  recoveryMinutes: 8,
  adlDecline: true,
  weightLossOrLowIntake: false,
  modifiers: ['osteoporosis'],
});
assert.equal(result.level, 'rebuild');
assert.equal(result.problems.length, 3);
assert.ok(result.activities.length <= 4);
assert.match(result.ptAssessmentTh.join(' '), /Barthel/);
```

- [ ] **Step 2: Run and confirm failure**

Run: `node care-app/tests/frailty-independence-personalization.check.cjs`

Expected: FAIL because the engine script does not exist.

- [ ] **Step 3: Implement validation and route priority**

Validate required enum and number ranges. Apply route priority:

1. `redFlag === true` -> `medical_review`.
2. Substantial assistance with insufficient safe data -> `professional_review`.
3. Otherwise -> `personal_plan`.

- [ ] **Step 4: Implement three problem scores**

Calculate independent scores for:

- `transfer_strength` from chair stand and transfer assistance;
- `gait_balance` from near falls and household walking;
- `activity_tolerance` from fatigue, activity time, recovery, and ADL decline.

Always return the three problems in descending score, with stable tie priority:
transfer, gait/balance, activity tolerance.

- [ ] **Step 5: Implement level and activity selection**

- `supported_start`: bed mobility/bridging or assisted transfer, supported
  stepping, short task practice.
- `rebuild`: sit-to-stand, supported weight shift/balance, interval household
  walking, meaningful ADL practice.
- `progressive`: controlled chair rise, multidirectional balance, longer
  walking intervals, goal-specific task practice.

Every activity includes all FITT fields and a stop-condition sentence.

- [ ] **Step 6: Implement modifier and stop-point output**

Support known modifiers for nutrition/sarcopenia, cognition, osteoporosis,
cardiopulmonary disease, metabolic disease, and home/caregiver risk. Deduplicate
and return at most two actionable modifiers.

- [ ] **Step 7: Run the engine test**

Run: `node care-app/tests/frailty-independence-personalization.check.cjs`

Expected: `PASS FRAIL-01 personalization routes, FITT, modifiers, and limits`.

- [ ] **Step 8: Commit**

```powershell
git add -- care-app/tests/frailty-independence-personalization.check.cjs care-app/public/js/frailty-independence-personalization.js
git commit -m "feat: add frailty independence FITT engine"
```

---

### Task 5: Build the Reviewable Team 4 FRAIL-01 Page

**Files:**
- Create: `care-app/tests/team4-frailty-independence.check.cjs`.
- Create: `care-app/public/team4-frailty-independence-mockup.html`.
- Create: `care-app/public/media/plan-frailty-independence.webp`.
- Create: `care-app/public/media/team4-frailty-demo-grid.webp`.
- Reuse: `care-app/public/js/current-location-lead.js`.
- Reuse: `care-app/public/js/frailty-content.js`.
- Reuse: `care-app/public/js/frailty-independence-personalization.js`.

**Interfaces:**
- Consumes: `FrailtyContent` and `FrailtyIndependencePlan` globals.
- Produces: a mobile-first interactive review page with three problem cards,
  contextual article links, assessments, personalized result, and lead step.

- [ ] **Step 1: Write the failing page structure test**

Assert:

- patient-facing title and frailty profile label;
- exactly three `.problem-card` elements;
- four registry keys used at the specified contexts;
- scripts for registry, engine, and location capture;
- two starter `.exercise-card` elements;
- quantitative inputs for chair stand, transfer assistance, near falls,
  walking level, fatigue, activity duration, and recovery time;
- Barthel prompt hidden unless ADL decline is selected;
- professional-only boxes use warning styling and do not masquerade as buttons;
- personalized activity container, FITT fields, weekly schedule, progression,
  regression, PT assessment, and stop point;
- article links use `target="_blank" rel="noopener"`;
- plan generation scrolls back to the upgraded plan.

- [ ] **Step 2: Run and confirm failure**

Run: `node care-app/tests/team4-frailty-independence.check.cjs`

Expected: FAIL because the HTML file does not exist.

- [ ] **Step 3: Generate the plan cover and demo grid**

Use the same premium realistic Thai household and subtle clinical-overlay style
as the approved plan family. The cover shows an older adult completing a
meaningful household activity with an adult child nearby but not lifting them.
The demo grid contains clean full-body frames for supported rising, supported
stepping/walking, bridging, and task practice. No baked-in arrows or text.

- [ ] **Step 4: Implement the hero and condition knowledge block**

Show the title, plain opening summary, expandable `ผู้สูงอายุเปราะบาง`
description, and Article 1 link from `FrailtyContent`.

- [ ] **Step 5: Implement exactly three problem cards**

Each card leads with the problem explanation, then self-entry assessment,
contextual Article 2 help, and a compact professional-only assessment strip.
Keep the professional strip visually secondary.

- [ ] **Step 6: Implement recovery rationale and Article 3 link**

Explain which answers suggest trainable function without promising recovery.
Use the shared registry for the link.

- [ ] **Step 7: Implement starter and personalized plans**

Render two starter activities before completion. On generation, call
`buildFrailtyIndependencePlan`, replace the starter section with up to four
activities, render complete FITT, weekly schedule, progression/regression,
modifiers, PT assessment, and stop point, then smooth-scroll to the plan.

- [ ] **Step 8: Implement Article 4 and lead actions**

Place Article 4 beside the self-care/professional decision explanation. Reuse
the current-location-first lead interaction without adding email. Preserve the
manual-area reveal behavior only after geolocation denial.

- [ ] **Step 9: Run page and engine checks**

Run:

```powershell
node care-app/tests/team4-frailty-independence.check.cjs
node care-app/tests/frailty-content-registry.check.cjs
node care-app/tests/frailty-independence-personalization.check.cjs
node care-app/tests/current-location-lead.check.cjs
```

Expected: all print `PASS` and exit 0.

- [ ] **Step 10: Commit**

```powershell
git add -- care-app/tests/team4-frailty-independence.check.cjs care-app/public/team4-frailty-independence-mockup.html care-app/public/media/plan-frailty-independence.webp care-app/public/media/team4-frailty-demo-grid.webp
git commit -m "feat: add frailty independence Team 4 plan"
```

---

### Task 6: Full Verification and Visual Acceptance

**Files:**
- Verify only; edit the smallest relevant file if a check exposes a defect.

**Interfaces:**
- Consumes: all artifacts from Tasks 1-5.
- Produces: verified local URLs and screenshots for user review.

- [ ] **Step 1: Run all related static checks**

```powershell
node blog/tests/frailty-article-cluster.check.cjs
node blog/tests/article-seo.check.cjs
node tests/site-navigation.check.cjs
node care-app/tests/frailty-content-registry.check.cjs
node care-app/tests/frailty-independence-personalization.check.cjs
node care-app/tests/team4-frailty-independence.check.cjs
node care-app/tests/current-location-lead.check.cjs
```

Expected: all checks print `PASS` and exit 0.

- [ ] **Step 2: Run broader Care App tests**

Run from `care-app`:

```powershell
npm.cmd test -- --run
```

Expected: all Vitest files pass with no unhandled error.

- [ ] **Step 3: Start an available local server**

Use an unused port and serve the repository root. Do not terminate another
server that the user may be using.

- [ ] **Step 4: Inspect Team 4 at mobile and desktop sizes**

Check 390x844 and 1440x1000:

- full hero subject is visible;
- no text overlaps;
- exactly three problems scan clearly;
- assessment expansion does not make navigation confusing;
- professional strips stay secondary;
- personalized activities animate without resizing the layout;
- article links open a new tab;
- back navigation preserves the generated page state.

- [ ] **Step 5: Inspect all four articles**

For each slug verify cover crop, TL;DR, headings, table/list wrapping, references,
FAQ interaction, article CTA, canonical metadata, and mobile readability.

- [ ] **Step 6: Verify clean intended scope**

Run:

```powershell
git diff --check
git status --short
```

Confirm no unrelated dirty file has been staged or committed by this work.
