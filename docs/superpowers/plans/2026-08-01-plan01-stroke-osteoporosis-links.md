# Plan 01 Stroke And Osteoporosis Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link stroke and osteoporosis knowledge from Plan 01 and publish a focused osteoporosis fall-safety article.

**Architecture:** Extend the existing condition object records with article metadata; do not create a new UI surface. Publish the new article through the established Markdown, article-index, cover-image, sitemap, and Node-check pipeline.

**Tech Stack:** Static HTML, JavaScript, Markdown, JSON, XML sitemap, WebP image, Node assertion tests.

## Global Constraints

- Do not change Plan 01 clinical logic or lead collection.
- Use only the shared condition detail and optional article row.
- Keep medical claims educational and route suspected fractures to medical assessment.
- Publish the article separately from the app feature branch.

---

### Task 1: Osteoporosis Article And Cover

**Files:**
- Create: `content/posts/osteoporosis-falls-safe-exercise.md`
- Create: `blog/images/glossary/osteoporosis-falls-safe-exercise-cover.webp`
- Create: `blog/tests/osteoporosis-article.check.cjs`
- Modify: `blog/articles.json`
- Modify: `sitemap.xml`

**Interfaces:**
- Produces article slug `osteoporosis-falls-safe-exercise` and cover URL `/blog/images/glossary/osteoporosis-falls-safe-exercise-cover.webp`.

- [ ] Write a failing test for article frontmatter, dedicated cover, index entry, sitemap uniqueness, safety boundaries, and required evidence links.
- [ ] Run `node blog/tests/osteoporosis-article.check.cjs` and confirm failure because the article does not exist.
- [ ] Generate the dedicated cover and write the evidence-backed article.
- [ ] Add one index entry and one sitemap URL.
- [ ] Run the new test plus `article-seo.check.cjs` and `blog-card-image-fit.check.cjs`.

### Task 2: Plan 01 Condition Links

**Files:**
- Modify: `care-app/tests/team4-walk-confidence-personalization-ui.check.cjs`
- Modify: `care-app/public/team4-walk-confidence-mockup.html`

**Interfaces:**
- Consumes the new osteoporosis URL and existing `stroke-ep1` URL.

- [ ] Add failing assertions for stroke and osteoporosis inline links and article rows.
- [ ] Confirm the Plan 01 UI test fails.
- [ ] Add `bodyHtml`, `articleUrl`, and `articleLabel` to the stroke and osteoporosis condition records.
- [ ] Update the shared renderer to accept either a registry key or direct article URL.
- [ ] Run focused Plan 01 tests.
- [ ] Verify both chips visually at mobile width and confirm the article row hides on unrelated conditions.

### Task 3: Publish And Verify

- [ ] Commit and push the Care App branch for review without merging it.
- [ ] Copy only the approved article allowlist into a clean worktree based on current `origin/main`.
- [ ] Run article tests in the clean publishing worktree.
- [ ] Create and merge a focused website pull request.
- [ ] Verify the live article title, cover, and Plan 01 article URLs.
