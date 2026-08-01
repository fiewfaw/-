# Plan 01 Inline Frailty Knowledge Design

## Goal

Make frailty education feel like part of the clinical explanation in Plan 01, not a separate article promotion block.

## Approved Direction

Use the same interaction pattern as the condition section in the approved Stroke plan.

- Remove the standalone frailty knowledge heading, helper copy, and four-link grid.
- Add `ผู้สูงอายุเปราะบาง` as a condition chip alongside balance loss, leg weakness, post-stroke status, and osteoporosis.
- Keep one shared condition detail panel. Selecting a chip replaces the panel content; selecting another chip replaces it again.
- When `ผู้สูงอายุเปราะบาง` is selected, explain how reduced physiologic reserve can connect weakness, slower recovery, balance loss, and functional decline.
- Embed three contextual inline links inside that explanation:
  - `ภาวะเปราะบาง` -> definition article
  - `การประเมินภาวะเปราะบาง` -> assessment article
  - `โอกาสฟื้นตัว` -> recovery article
- Show one compact full-article row below the explanation:
  - `อ่านแนวทางดูแลและใช้กายภาพเมื่อไร` -> care article
- Hide the article row for condition chips that do not have a dedicated article in this iteration.

## Visual Rules

- Match the approved Stroke condition-detail rhythm: title, explanatory paragraph, optional article row.
- Inline links must look readable but subordinate to the condition explanation.
- The article row must be smaller than the problem cards and must not compete with the three main problems.
- Keep the existing Plan 01 teal palette and mobile spacing.
- Do not create another knowledge section, carousel, modal, or navigation layer.

## Behavior And Accessibility

- Condition chips are real buttons with `aria-expanded` and one shared `aria-controls` target.
- Selecting the currently open chip closes its detail; selecting another chip replaces the detail.
- External articles open in a new tab with `rel="noopener"`.
- The first condition remains open on initial load so the section does not appear empty.

## Testing

- Assert the standalone frailty link grid no longer exists.
- Assert the frailty chip and all four article URLs exist in the condition data.
- Assert the shared condition panel exposes one optional article row.
- Verify at mobile width that the section has no horizontal overflow and no broken links or console errors.

## Scope Boundary

This change only restructures the knowledge presentation in Plan 01. It does not alter screening scores, personalization logic, exercise prescription, or lead collection.
