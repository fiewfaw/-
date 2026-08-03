# Team 4 Assessment Attention Cue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restrained attention cue to the first unopened or incomplete self-assessment on every Team 4 plan without changing the approved layout.

**Architecture:** A shared browser helper owns target selection, one-at-a-time progression, viewport activation, and cleanup. A shared stylesheet draws the two-pass edge shimmer, breathing emphasis, and reduced-motion fallback. Each Team 4 page loads both shared assets and identifies its existing assessment trigger selector through a script data attribute.

**Tech Stack:** Static HTML, CSS animations, browser JavaScript, Vitest with jsdom, Node static route checks.

## Global Constraints

- Apply to all seven published Team 4 plan pages.
- Highlight only the first incomplete or unopened self-assessment.
- Do not add cards, labels, instructions, or permanent visual clutter.
- Do not alter clinical content, personalization rules, forms, or navigation.
- Do not cause layout shift, automatic scrolling, resizing, or automatic opening.
- Under `prefers-reduced-motion: reduce`, use a static emphasized outline.

---

### Task 1: Shared cue state manager

**Files:**
- Create: `care-app/public/js/assessment-attention.js`
- Test: `care-app/tests/assessment-attention.test.ts`

**Interfaces:**
- Produces: `AssessmentAttention.createAssessmentAttention(options)` where `options.root` is a document-like root, `options.selector` finds assessment triggers, and `options.observerFactory` optionally supplies an IntersectionObserver-compatible observer.
- Produces: controller methods `refresh()` and `destroy()`.

- [ ] **Step 1: Write failing tests**

Test that the helper selects only the first eligible trigger, advances after click, skips `.done`, and removes listeners/classes on `destroy()`.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm.cmd test -- tests/assessment-attention.test.ts`

Expected: FAIL because `public/js/assessment-attention.js` does not exist.

- [ ] **Step 3: Implement the minimal shared helper**

Create a CommonJS/browser-compatible module that adds `assessment-attention-active`, adds `assessment-attention-intro` when the active target becomes visible, records a target as visited on click or keyboard activation, advances to the next eligible target, observes class and attribute changes, and exposes cleanup.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `npm.cmd test -- tests/assessment-attention.test.ts`

Expected: PASS.

### Task 2: Shared visual treatment

**Files:**
- Create: `care-app/public/css/assessment-attention.css`
- Modify: `care-app/tests/beta-static-routes.check.cjs`

**Interfaces:**
- Consumes: `assessment-attention-active` and `assessment-attention-intro` classes from Task 1.
- Produces: edge shimmer, restrained breathing emphasis, and static reduced-motion state.

- [ ] **Step 1: Extend the static check first**

Require the shared stylesheet and script to exist, require reduced-motion CSS, and require every Team 4 page to load both assets.

- [ ] **Step 2: Run the static check and confirm RED**

Run: `npm.cmd run test:beta:static`

Expected: FAIL because the stylesheet and page references are missing.

- [ ] **Step 3: Add the visual CSS**

Use a masked conic-gradient border for two passes, a low-amplitude box-shadow breathing animation after the introduction, and an outline-only reduced-motion fallback. Keep all overlays pointer-transparent and contained within the existing border radius.

### Task 3: Connect all seven Team 4 plans

**Files:**
- Modify: `care-app/public/team4-walk-confidence-mockup.html`
- Modify: `care-app/public/team4-return-strength-mockup.html`
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Modify: `care-app/public/team4-hip-recovery-mockup.html`
- Modify: `care-app/public/team4-knee-recovery-mockup.html`
- Modify: `care-app/public/team4-parkinson-mobility-mockup.html`
- Modify: `care-app/public/team4-bedbound-transfer-mockup.html`

**Interfaces:**
- Consumes: shared stylesheet and auto-initializing script.
- Selector for walk confidence: `.quant-assessment`.
- Selector for return strength: `.quant-assessment`.
- Selector for Stroke: `.assessment-toggle`.
- Selector for hip recovery: `.self-assess`.
- Selector for knee recovery: `.self-assess`.
- Selector for Parkinson: `.self-card`.
- Selector for bedbound transfer: `.assessment-button`.

- [ ] **Step 1: Load the shared stylesheet in every plan**

Add `<link rel="stylesheet" href="css/assessment-attention.css">` without changing existing styles or markup hierarchy.

- [ ] **Step 2: Load and configure the shared script in every plan**

Add `<script src="js/assessment-attention.js" data-assessment-selector="..."></script>` immediately before `</body>` using the page's existing assessment trigger selector.

- [ ] **Step 3: Run the static check and focused unit test**

Run: `npm.cmd run test:beta:static`

Run: `npm.cmd test -- tests/assessment-attention.test.ts`

Expected: both PASS.

### Task 4: Regression, build, publication, and live verification

**Files:**
- Modify only the explicit deployment allowlist from Tasks 1-3 in the clean deployment clone.

**Interfaces:**
- Consumes: verified source files.
- Produces: updated public Care Navigator beta under `/care-navigator/`.

- [ ] **Step 1: Run the complete local verification**

Run: `npm.cmd test`

Run: `npm.cmd run test:beta:static`

Run: `npm.cmd run build`

Expected: all tests and static export pass.

- [ ] **Step 2: Copy only the explicit allowlist into the clean deployment clone**

Copy the shared CSS, shared JS, seven Team 4 HTML pages, and static route check. Do not stage unrelated dirty files.

- [ ] **Step 3: Commit and push the deployment clone**

Stage only the allowlist, commit with `feat: guide users through Team 4 assessments`, and push the deployment branch.

- [ ] **Step 4: Verify the public boundary**

Confirm HTTP 200 for the Care Navigator and all seven Team 4 pages, confirm each page loads the shared CSS and JS, and visually inspect one mobile and one desktop plan to ensure only one cue appears and no layout shifts occur.
