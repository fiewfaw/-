# Team 4 Stroke Flagship Design

**Date:** 2026-07-26  
**Status:** Approved direction, ready for implementation planning  
**Target:** `care-app/public/team4-stroke-arm-leg-mockup.html`

## Objective

Upgrade Plan 03 into the flagship Stroke result experience. The page must help patients understand their Stroke, understand the training stage that fits their current function, complete relevant assessments, and receive a practical personalized programme. It must not look like an AI-generated report or imply that a public questionnaire is a clinical examination.

## Product Boundary

- Care Navigator remains a public education, screening, starter-plan, and lead flow.
- A clinical Body Chart is out of scope. It belongs in the separate clinical care app after a physiotherapist has examined the patient and linked findings to patient goals.
- Stroke type and lesion information explain the condition and precautions. They do not independently determine exercise selection.
- Functional findings remain the primary programme inputs.

## Page Structure

1. Case-specific hero image with the existing restrained neurological light effect.
2. Selected Stroke knowledge atlas.
3. Related condition explanation with links to existing articles.
4. Action-based training stage.
5. Plain-language explanation of the information used to arrange the plan.
6. Three main problems, each containing its management approach and relevant assessment.
7. Starter programme.
8. Personalized programme with FITT, seven-day schedule, progression, regression, precautions, lead form, location capture, consultation, and AI summary.

## Selected Stroke Atlas

### Inputs

```ts
type StrokeKnowledge = {
  type: "ischemic" | "hemorrhagic" | "unknown";
  hemisphere: "left" | "right" | "bilateral" | "unknown";
  lesion: "mca" | "aca" | "pca" | "brainstem" | "other" | "unknown";
};
```

### Behaviour

- Team 4 receives these values from Team 3 when available.
- The result shows one combined atlas visual matching the selected type, hemisphere, and lesion.
- Do not keep all atlas options visible after selection.
- A small `แก้ไขข้อมูล` command opens the options without navigating away.
- Unknown values produce a neutral Stroke visual and advise checking the hospital discharge summary. The app never guesses.
- The atlas explains typical relationships only and clearly avoids diagnostic claims.

### Visual Standard

- Use a polished raster medical illustration set comparable to the approved hip and knee treatment atlases.
- The selected lesion should be visible through restrained cyan, blue, or coral highlighting.
- Keep labels outside the anatomy where possible.
- Avoid dense radiology-style annotations on the patient-facing view.

## Training Stage Language

Do not use `Recovery Profile`, `ระดับการฟื้นตัว`, or AI-style archetype wording as the primary patient-facing heading.

Use:

1. `เคลื่อนไหวบนเตียง`
2. `ฝึกนั่งและย้ายตัว`
3. `ฝึกลุกยืนและเริ่มก้าว`
4. `ฝึกเดินและใช้แขนในชีวิตประจำวัน`

The selected stage is derived from Barthel Index, sitting and transfer ability, FAC, and real functional ability. The stage name summarizes the starting point; it does not replace the source measures.

## Information Used To Arrange The Plan

Use the heading `ข้อมูลที่ใช้จัดแผนของคุณ`.

Show four compact rows:

- Daily activity and assistance level.
- Sitting and transfer ability.
- Walking and assistance level.
- Affected-arm use and shoulder protection.

Each row uses a custom medical pictogram, not an English abbreviation. The copy explains how that input changes the programme. Clinical tool names may appear in supporting text when useful, but never as the visual lead.

## Functional Personalization

Preserve the current inputs and rules unless a failing test or clinical contradiction is found:

- Barthel Index.
- Sitting and transfer level.
- Functional Ambulation Category.
- Affected-arm use.
- Arm and leg spasticity impact.
- Shoulder pain or instability impact.
- Existing location and lead form behaviour.

The programme keeps the current function-first branching:

- Low function: bed mobility, positioning, bridging, rolling, assisted arm activity.
- Mid function: sitting control, transfers, sit-to-stand readiness, supported stepping, protected arm activity.
- Higher function: gait, weight transfer, task-specific arm use, and activity progression.

Stroke knowledge metadata may add explanations or precautions but must not override functional safety rules.

## Visual Icon System

- The temporary line icons in the visual companion are not final assets.
- Build a consistent set for bed mobility, sitting and transfer, walking with assistance, arm and hand use, and shoulder protection.
- Medical pictograms share line weight, color, framing, and visual tone with the Stroke atlas.
- Familiar interface commands use the app's normal icon system; medical state illustrations use the custom pictogram set.

## Safety And Accessibility

- Preserve existing red-flag routing and exercise stop criteria.
- Do not infer lesion type, hemisphere, or vascular territory.
- Make `ไม่ทราบ` a valid non-blocking answer.
- All interactive elements require visible focus, touch targets suitable for mobile, and plain Thai labels.
- Respect reduced-motion preferences.
- The page must remain usable when atlas images fail by showing the selected text summary.

## Verification

- Only the selected atlas result is visible after selection.
- Unknown metadata displays the neutral fallback.
- No Body Map or Body Chart appears in the public result.
- All current assessments still open, calculate, and unlock the personalized plan.
- Existing personalization tests pass.
- Desktop and mobile screenshots show no overflow, clipped text, or incoherent overlap.
- Atlas and pictogram assets render at their intended aspect ratios.
- Location permission, denial fallback, consultation link, and AI-copy action still work.

## Non-Goals

- Clinical Body Chart.
- Diagnosis from symptoms or imaging.
- Detailed radiology interpretation.
- Rebuilding Team 3 in this implementation pass.
- Replacing the separate clinical backend or its patient record.
