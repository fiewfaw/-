# Plan 01 Frailty Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold frailty education and personalization into the existing Plan 01 while standardizing 10-digit phone validation across all approved Team 4 plans.

**Architecture:** Preserve the approved standalone HTML plan pages and their existing personalization engines. Add one small shared phone-input module, enrich the existing return-strength Plan 01 with frailty content and quantitative interactions, and turn the obsolete frailty page into a compatibility redirect.

**Tech Stack:** Static HTML/CSS/JavaScript, CommonJS-compatible JavaScript modules, Node assertion tests, local mobile browser QA.

## Global Constraints

- User-facing Plan 01 stays named `แผนฟื้นกำลัง กลับมาช่วยเหลือตัวเอง`.
- `FRAIL-01` is internal only and must not appear as a separate plan.
- Exercise previews use the approved two-frame animation pattern.
- Phone fields accept digits only, maximum 10 digits, and final generation requires exactly 10 digits.
- Preserve the approved visual design of the knee, hip, Stroke, and walk-confidence plans.
- Stage and commit only the explicit Plan 01, shared validation, frailty articles, tests, and required media allowlist.

---

### Task 1: Import the approved plan baseline

**Files:**
- Create from approved workspace copies: `care-app/public/team4-return-strength-mockup.html`
- Create from approved workspace copies: `care-app/public/team4-walk-confidence-mockup.html`
- Create from approved workspace copies: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Create from approved workspace copies: `care-app/public/team4-hip-recovery-mockup.html`
- Create from approved workspace copies: `care-app/public/team4-knee-recovery-mockup.html`
- Create from approved workspace copies: corresponding personalization scripts and required media

**Interfaces:**
- Consumes: approved files from the main workspace.
- Produces: isolated feature-worktree copies that can be tested and modified without touching unrelated dirty files.

- [ ] **Step 1: Copy only the approved plan files, matching scripts, tests, and referenced media into the feature worktree.**
- [ ] **Step 2: Verify copied files are byte-identical to their approved sources before modifications.**

### Task 2: Define phone validation behavior

**Files:**
- Create: `care-app/tests/lead-phone.check.cjs`
- Create: `care-app/public/js/lead-phone.js`
- Modify: the five approved `team4-*-mockup.html` plan pages

**Interfaces:**
- Produces: `normalizePhone(value): string`, `isValidPhone(value): boolean`, and `bindPhoneInput(options): object`.

- [ ] **Step 1: Write a failing Node test that requires non-digits to be removed, values to be capped at 10 digits, and validity to require exactly 10 digits.**
- [ ] **Step 2: Run `node care-app/tests/lead-phone.check.cjs` and confirm it fails because the module is absent.**
- [ ] **Step 3: Implement the shared module and wire it into every approved lead form with `inputmode="numeric"`, `maxlength="10"`, and disabled-state synchronization.**
- [ ] **Step 4: Run the phone test and confirm it passes.**

### Task 3: Merge frailty into Plan 01

**Files:**
- Modify: `care-app/public/team4-return-strength-mockup.html`
- Modify: `care-app/public/js/return-strength-personalization.js`
- Modify: `care-app/public/js/frailty-content.js`
- Modify: `care-app/public/team4-frailty-independence-mockup.html`
- Test: `care-app/tests/team4-return-strength.check.cjs`
- Test: `care-app/tests/return-strength-personalization.check.cjs`

**Interfaces:**
- Consumes: Team 1-3 context, chair-rise count, walking tolerance, fatigue/recovery, comorbid modifiers, and internal frailty profile.
- Produces: one Plan 01 result with three problem blocks and a detailed personalized plan.

- [ ] **Step 1: Add failing assertions for Plan 01 naming, four frailty article links, 30-second timer controls, two-frame previews, detailed result sections, and absence of a second FRAIL-01 page.**
- [ ] **Step 2: Run the Plan 01 tests and confirm the new assertions fail.**
- [ ] **Step 3: Update Plan 01 copy and UI, embed the optional timer in the chair-rise assessment, and connect frailty education inline.**
- [ ] **Step 4: Extend the personalization output to include summary, up to four exercises, FITT, weekly schedule, progression, precautions, and PT-only assessments when required.**
- [ ] **Step 5: Replace the old frailty page content with a redirect to `team4-return-strength-mockup.html` while preserving query parameters.**
- [ ] **Step 6: Run all Plan 01 and frailty tests and confirm they pass.**

### Task 4: Verify content and interaction boundaries

**Files:**
- Verify: `content/posts/frailty-in-older-adults.md`
- Verify: `content/posts/frailty-assessment.md`
- Verify: `content/posts/frailty-recovery-potential.md`
- Verify: `content/posts/frailty-care-and-physical-therapy.md`
- Verify: `blog/articles.json`
- Verify: `sitemap.xml`

**Interfaces:**
- Consumes: four article slugs and Plan 01 links.
- Produces: a complete article cluster reachable from Plan 01 and discoverable by the website.

- [ ] **Step 1: Run article-cluster tests and verify every link target exists.**
- [ ] **Step 2: Run the complete focused Node test suite for all modified plans.**
- [ ] **Step 3: Serve the feature worktree locally and test Plan 01 at a 390 x 844 mobile viewport.**
- [ ] **Step 4: Verify timer countdown, two-frame motion, digits-only phone input, disabled/enabled plan button, location fallback, article links, and personalized-plan rendering.**

### Task 5: Finish and publish the approved scope

**Files:**
- Commit only files listed in Tasks 1-4.

**Interfaces:**
- Produces: one reviewable feature commit set with no `node_modules.failed`, `node_modules.partial`, or unrelated dirty workspace files.

- [ ] **Step 1: Run `git diff --check` and the focused test suite.**
- [ ] **Step 2: Inspect the staged allowlist before committing.**
- [ ] **Step 3: Commit the implementation and report the working local review URL.**
- [ ] **Step 4: Publish only after confirming the repository's live deployment branch and verifying the live article URLs.**

