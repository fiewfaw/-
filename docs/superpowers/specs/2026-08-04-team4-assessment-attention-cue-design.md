# Team 4 Assessment Attention Cue Design

## Goal

Help users notice that Team 4 contains additional self-assessments that can be opened and completed to generate a more personalized plan, without changing the approved UI layout.

## Scope

- Apply to all seven published Team 4 plan pages.
- Highlight only the first incomplete self-assessment.
- Do not add new cards, labels, instructions, or permanent visual clutter.
- Do not alter clinical content, personalization rules, forms, or navigation.

## Interaction

1. When the first incomplete assessment enters the viewport, its existing clickable control receives a short two-pass edge shimmer and a subtle lift.
2. After the introduction, the same control keeps a restrained breathing emphasis until it is opened.
3. Opening or completing that assessment removes the effect.
4. The effect then moves to the next incomplete assessment.
5. After every required assessment is complete, no attention effect remains.
6. The cue must not replay continuously after the user has already interacted with that assessment during the current page session.

## Accessibility And Stability

- Preserve the existing focus and keyboard behavior.
- Under `prefers-reduced-motion: reduce`, replace animation with a static emphasized outline.
- Do not cause layout shift, scrolling, resizing, or automatic opening.
- The effect must not cover text, icons, inputs, or images.

## Implementation Boundary

- Use one shared CSS and JavaScript helper loaded by the seven Team 4 HTML pages.
- Each page supplies selectors for its existing clickable assessment controls and a completion predicate where required.
- The helper owns viewport detection, first-incomplete selection, animation state, and cleanup.
- Existing per-plan personalization scripts remain the source of truth for completion and plan generation.

## Verification

- Static route check confirms all seven Team 4 pages load the shared helper.
- Automated helper tests cover first-incomplete selection, progression, completion, and reduced-motion behavior.
- Desktop and mobile checks confirm no layout changes and only one active cue at a time.
