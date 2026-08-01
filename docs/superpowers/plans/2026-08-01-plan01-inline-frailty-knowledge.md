# Plan 01 Inline Frailty Knowledge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the standalone frailty article grid in Plan 01 with a Stroke-style condition chip and contextual knowledge links.

**Architecture:** Keep the existing single-page Plan 01 implementation and extend its condition data model from tuple values to objects containing title, HTML body, and an optional article row. One shared detail panel renders every condition, while only the frailty condition exposes contextual links and the care article row.

**Tech Stack:** Static HTML, inline CSS, browser JavaScript, Node assertion tests.

## Global Constraints

- Do not change screening scores, personalization logic, exercise prescription, or lead collection.
- Remove the standalone frailty heading, helper copy, and four-link grid.
- Match the approved Stroke condition-detail interaction and visual hierarchy.
- Keep all four frailty articles discoverable from the frailty condition detail.
- Preserve mobile layout and accessibility attributes.

---

### Task 1: Inline Frailty Knowledge In The Condition Detail

**Files:**
- Modify: `care-app/tests/team4-walk-confidence-personalization-ui.check.cjs`
- Modify: `care-app/public/team4-walk-confidence-mockup.html`

**Interfaces:**
- Consumes: `FrailtyContent.getArticle(key)` from `care-app/public/js/frailty-content.js`.
- Produces: `conditions[key]` objects with `title`, `bodyHtml`, optional `articleKey`, and optional `articleLabel`.

- [ ] **Step 1: Write the failing structure test**

Add assertions that the old `.frailty-context`, `.frailty-links`, and heading text are absent; the `data-c="frailty"` chip exists; all four `data-article-key` values exist in the frailty condition definition; and the shared detail includes `#conditionArticleLink`.

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
node care-app/tests/team4-walk-confidence-personalization-ui.check.cjs
```

Expected: FAIL because the old standalone block still exists and the frailty chip does not.

- [ ] **Step 3: Implement the shared condition-detail presentation**

In `team4-walk-confidence-mockup.html`:

- Delete the standalone `.frailty-context` markup and styles.
- Add a `ผู้สูงอายุเปราะบาง` condition chip using `data-c="frailty"`.
- Change `#condition` to contain a title element, body element, and optional article row.
- Add restrained `.inline-term` and `.condition-article-link` styles matching the existing Plan 01 palette.
- Convert `conditions` to object records.
- Build the frailty body with inline anchors for definition, assessment, and recovery.
- Populate the article row from the care article and hide it for other conditions.
- Keep the first condition visible on load and update `aria-expanded` on every chip selection.

- [ ] **Step 4: Run focused regression tests**

Run:

```powershell
node care-app/tests/team4-walk-confidence-personalization-ui.check.cjs
node care-app/tests/team4-walk-confidence-personalization-review.check.cjs
node care-app/tests/walk-confidence-personalization.check.cjs
node care-app/tests/frailty-content-registry.check.cjs
```

Expected: all four commands print `PASS` and exit with code 0.

- [ ] **Step 5: Verify the mobile page**

At `390 x 844`, verify the frailty chip replaces the detail content, the three inline links and one article row are visible only inside that detail, the page has no horizontal overflow, and the console has no errors.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- care-app/tests/team4-walk-confidence-personalization-ui.check.cjs care-app/public/team4-walk-confidence-mockup.html
git commit -m "fix: blend frailty knowledge into Plan 01"
```
