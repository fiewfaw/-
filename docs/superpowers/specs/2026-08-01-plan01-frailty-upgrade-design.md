# Plan 01 Frailty Upgrade Design

## Decision

The existing user-facing **Plan 01: แผนฟื้นกำลัง กลับมาช่วยเหลือตัวเอง** remains the only Plan 01. `FRAIL-01` may exist only as an internal routing/profile identifier and must never appear as a separate user-facing plan.

## Product Role

Plan 01 is the result for older adults whose combined Team 1-3 answers show recoverable loss of strength, mobility, endurance, or independence. Frailty content explains why the person is vulnerable and how rehabilitation can improve independence; it does not create a second result path.

## Result Composition

- Open with one Plan 01 identity and a case-specific summary.
- Show the three highest-priority problem blocks generated from Team 1-3 answers.
- Link four concise frailty education articles from relevant inline context.
- Allow optional quantitative self-assessment inside the relevant problem block.
- Include a 30-second countdown beside the chair-rise count field.
- Keep exercise demonstrations as two-frame motion previews using the approved visual pattern from the knee, hip, and Stroke plans.
- Generate a detailed personalized result in the approved format: summary, exercise cards, FITT, weekly schedule, progression rules, precautions, and optional PT assessment.

## Lead Form Rules

- Name and a valid Thai-style 10-digit phone number are required.
- Phone inputs accept digits only and are capped at 10 digits.
- The final plan button remains disabled until all plan-specific requirements and the 10-digit phone requirement are satisfied.
- Current-location behavior remains unchanged: manual address appears only after location permission is denied or unavailable.

## Compatibility

- The old frailty mockup URL redirects to Plan 01 so saved links do not break.
- Existing approved plans keep their visual design; only the shared phone rule is added.
- No unrelated website or application files are changed.

## Verification

- Node contract tests verify the Plan 01 structure, timer, animation hooks, article links, personalization engine, redirect, and phone helper.
- Browser QA is performed at a mobile viewport, including timer behavior, phone sanitization, button state, and generated-plan rendering.

