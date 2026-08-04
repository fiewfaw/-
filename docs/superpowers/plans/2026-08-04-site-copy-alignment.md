# Site Copy Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align public website claims, prices, and the Care Navigator to LINE OA journey before paid advertising.

**Architecture:** Keep the existing static HTML and Markdown structure. Update the homepage and linked service article as one content contract, enforced by the existing Node content test and verified on the deployed public routes.

**Tech Stack:** Static HTML, Markdown rendered by Marked.js, Node assert tests, GitHub Pages.

## Global Constraints

- Do not change the approved visual layout.
- Keep the 12,000-baht ten-visit course and 1,500-baht single visit.
- Use a 20% saving claim for the ten-visit course.
- Care Navigator comes before LINE OA in the customer journey.
- Do not promise outcomes, recovery timelines, or a specific manual technique every visit.

---

### Task 1: Lock the approved content contract

**Files:**
- Modify: `tests/homepage-content.check.cjs`

**Interfaces:**
- Consumes: `index.html` and `content/posts/กายภาพบำบัดถึงบ้าน-ชลบุรี.md`
- Produces: a failing test that defines approved public copy and retired phrases

- [ ] **Step 1: Add assertions for the approved hero, free conversation, prices, 20% saving, and Care Navigator-first article flow.**
- [ ] **Step 2: Add negative assertions for outcome guarantees, review exchange, 52%, mandatory manual treatment, and retired packages.**
- [ ] **Step 3: Run `node tests/homepage-content.check.cjs` and confirm it fails against the old copy.**

### Task 2: Align homepage content

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: the copy contract from Task 1
- Produces: the approved homepage hero, service cards, prices, and claims

- [ ] **Step 1: Replace the Stroke-only hero claim with the approved inclusive rehabilitation positioning.**
- [ ] **Step 2: Convert the free assessment card into a free initial conversation with explicit boundaries and no review condition.**
- [ ] **Step 3: Correct the course saving to 20% and replace fixed-result and mandatory-manual wording.**
- [ ] **Step 4: Run `node tests/homepage-content.check.cjs` and confirm only article assertions remain failing.**

### Task 3: Align the service article

**Files:**
- Modify: `content/posts/กายภาพบำบัดถึงบ้าน-ชลบุรี.md`

**Interfaces:**
- Consumes: the homepage service and journey contract
- Produces: matching Care Navigator-first steps and current price list

- [ ] **Step 1: Rewrite the service steps to begin with Care Navigator and continue to LINE OA.**
- [ ] **Step 2: Replace the retired price list with free initial conversation, online 500, home visit 1,500, and ten visits 12,000.**
- [ ] **Step 3: Run `node tests/homepage-content.check.cjs` and confirm it passes.**

### Task 4: Publish and verify

**Files:**
- Modify: `index.html`
- Modify: `content/posts/กายภาพบำบัดถึงบ้าน-ชลบุรี.md`
- Modify: `tests/homepage-content.check.cjs`

**Interfaces:**
- Consumes: tested static files
- Produces: deployed public homepage and article with matching content

- [ ] **Step 1: Review the explicit three-file diff and run the content test.**
- [ ] **Step 2: Commit only the spec, plan, homepage, service article, and content test.**
- [ ] **Step 3: Push to GitHub Pages and wait for deployment.**
- [ ] **Step 4: Verify the public homepage and service article return 200 and contain the approved copy.**

