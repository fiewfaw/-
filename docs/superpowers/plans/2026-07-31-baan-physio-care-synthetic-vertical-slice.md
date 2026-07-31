# Baan Physio Care Synthetic Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, interactive three-tab prototype with synthetic patient data so the owner can test the complete clinical viewing and editing workflow before any real patient data, Supabase, Hermes, or Google Calendar integration is enabled.

**Architecture:** Create a standalone private-ready Next.js repository beside the existing `web` repository. UI components consume a typed `ClinicalRepository` contract; Phase 1 provides only an in-memory synthetic adapter, which never persists to browser storage and deliberately simulates server acknowledgements and failures. This boundary lets a later plan replace the adapter with the Clinical Gateway without rewriting the three-tab UI.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, Zod 4.4.3, plain CSS with design tokens, Vitest 4.1.9, Testing Library 16.3.2, jsdom 29.1.1.

## Global Constraints

- Repository root: `C:\Users\fiewf\OneDrive - Srinakharinwirot University\Project\My business\baan-physio-care`.
- The existing `web` repository and `care-app` remain separate and are not modified by implementation tasks.
- Use synthetic Thai fixtures only; no real name, phone, address, diagnosis, appointment, image, video, audio, PDF, SOAP, or credential.
- Display a persistent `ข้อมูลตัวอย่าง — ห้ามใช้ข้อมูลคนไข้จริง` banner in every Phase 1 screen.
- Do not use `localStorage`, IndexedDB, cookies, files, or browser caches for clinical fixture changes; refresh resets the prototype.
- A save is shown as successful only after `ClinicalRepository` returns a `SaveReceipt`.
- On simulated network failure, retain typed text only in React memory, show `ยังไม่บันทึก`, and offer a copy button.
- Mobile-first target width is 360–430 px; desktop may center the mobile workspace in a wider shell.
- Owner entry accepts opaque `patient` and ISO `visit` query parameters and preselects that visit; it never accepts diagnosis in the URL.
- Main tabs are exactly `บันทึกคนไข้`, `หน้าคนไข้`, and `Holistic Profile`.
- Patient View is read-only in this phase.
- Each outcome measure keeps raw value, unit, direction, target method, source label, visit date, and item scores.
- Never invent progress percentages for a `trend-only` measure.
- EBP creation, Supabase, Google authentication, patient PIN enforcement, Hermes, Calendar sync, encrypted backup, and production deployment are outside this Phase 1 repository state.
- Use `npm.cmd` on Windows.
- Set Vitest `fileParallelism: false` and `maxWorkers: 1` for OneDrive stability.
- Every task stages only its explicit file allowlist.

## Delivery sequence after this plan

This specification contains several independently reviewable subsystems, so implementation is split into five sequential cycles:

1. **Synthetic vertical slice** — this plan; interactive UI and domain contracts.
2. **Clinical Core foundation** — Supabase schema, RLS, owner Google allowlist, Clinical Gateway, revisions and audit.
3. **Patient publication** — consent, private token, hashed PIN, revocable sessions and atomic publication.
4. **Hermes and Calendar** — Telegram adapter, approvals, appointments, travel estimates and Calendar projection.
5. **Operations and pilot** — encrypted backup/restore, retention/deletion, Emergency Lock, security acceptance and 1–2 patient pilot.

Each cycle must pass its own tests before the next cycle can use real integrations.

## File map

```text
baan-physio-care/
├─ package.json                         dependency and command contract
├─ next.config.ts                      Phase 1 Next.js configuration
├─ tsconfig.json                       strict TypeScript and @ alias
├─ vitest.config.ts                    deterministic OneDrive-safe tests
├─ vitest.setup.ts                     jest-dom setup
├─ eslint.config.mjs                   Next.js lint rules
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                    metadata and global shell
│  │  ├─ page.tsx                      query parsing and workspace entry
│  │  └─ globals.css                   tokens and responsive layout
│  ├─ features/clinical/
│  │  ├─ types.ts                      domain types and repository interface
│  │  ├─ schemas.ts                    Zod input validation
│  │  ├─ progress.ts                   fixed/target/trend display calculation
│  │  ├─ synthetic-fixtures.ts         invented patient timeline
│  │  └─ synthetic-repository.ts       in-memory load/save/failure adapter
│  ├─ features/workspace/
│  │  ├─ PatientWorkspace.tsx          data loading, tabs and save status
│  │  ├─ WorkspaceHeader.tsx           patient, visit and synthetic banner
│  │  └─ usePatientWorkspace.ts        repository orchestration
│  ├─ features/record/
│  │  ├─ ClinicalRecordTab.tsx         current clinical reading order
│  │  ├─ ProblemCard.tsx               problem and measure rows
│  │  ├─ MeasureEditor.tsx             item scoring and confirmed save
│  │  ├─ SoapCard.tsx                  one SOAP block with date selector
│  │  ├─ EbpCard.tsx                   active summaries and detail drawer
│  │  └─ HealthInfoCard.tsx            collapsible structured health text
│  ├─ features/patient-view/
│  │  ├─ PatientViewTab.tsx            read-only patient page composition
│  │  ├─ ExerciseCard.tsx              natural-language FITT dosage
│  │  └─ WeeklySchedule.tsx            seven-day schedule
│  └─ features/holistic/
│     ├─ HolisticProfileTab.tsx         ranges, trends and priorities
│     └─ HolisticRadar.tsx              accessible seven-domain overview
└─ src/test/
   └─ test-utils.tsx                   shared render helpers
```

---

### Task 1: Bootstrap the standalone synthetic-only repository

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: none.
- Produces: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`; `HomePage` renders the synthetic-only warning.

- [ ] **Step 1: Initialize only the new repository**

Run in PowerShell:

```powershell
$repo = 'C:\Users\fiewf\OneDrive - Srinakharinwirot University\Project\My business\baan-physio-care'
New-Item -ItemType Directory -Path $repo
Set-Location -LiteralPath $repo
git init -b main
```

Expected: a new empty Git repository at the exact sibling path; the existing `web` working tree is untouched.

- [ ] **Step 2: Write the failing shell test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("always identifies the prototype as synthetic-only", async () => {
  render(await HomePage({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByText("ข้อมูลตัวอย่าง — ห้ามใช้ข้อมูลคนไข้จริง"),
  ).toBeInTheDocument();
});
```

- [ ] **Step 3: Create the minimum project configuration and page**

Use this package contract:

```json
{
  "name": "baan-physio-care",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "jsdom": "^29.1.1",
    "typescript": "^5",
    "vitest": "^4.1.9"
  }
}
```

Use these exact configuration bodies:

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;

// vitest.config.ts
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    fileParallelism: false,
    maxWorkers: 1,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

`tsconfig.json` uses strict mode, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true`, and alias `"@/*": ["./src/*"]`, matching the exact compiler settings in the approved existing Care App toolchain.

`src/app/layout.tsx` imports `globals.css`, sets `<html lang="th">`, and exports metadata title `Baan Physio Care — Prototype` and description `ต้นแบบข้อมูลจำลองสำหรับทดสอบ workflow`.

`src/app/page.tsx` initially renders:

```tsx
type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  await searchParams;
  return <main>ข้อมูลตัวอย่าง — ห้ามใช้ข้อมูลคนไข้จริง</main>;
}
```

- [ ] **Step 4: Install and verify the foundation**

Run:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: all four commands exit 0.

- [ ] **Step 5: Commit the bootstrap allowlist**

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json vitest.config.ts vitest.setup.ts eslint.config.mjs src/app/layout.tsx src/app/page.tsx src/app/page.test.tsx src/app/globals.css
git commit -m "chore: bootstrap synthetic care prototype"
```

---

### Task 2: Lock the clinical domain contract and synthetic fixture

**Files:**
- Create: `src/features/clinical/types.ts`
- Create: `src/features/clinical/schemas.ts`
- Create: `src/features/clinical/progress.ts`
- Create: `src/features/clinical/synthetic-fixtures.ts`
- Create: `src/features/clinical/synthetic-repository.ts`
- Test: `src/features/clinical/progress.test.ts`
- Test: `src/features/clinical/synthetic-repository.test.ts`

**Interfaces:**
- Consumes: Zod.
- Produces:
  - `loadWorkspace(input: LoadWorkspaceInput): Promise<PatientWorkspace>`
  - `saveMeasure(input: SaveMeasureInput): Promise<SaveReceipt>`
  - `saveSoap(input: SaveSoapInput): Promise<SaveReceipt>`
  - `getProgressDisplay(definition, result): ProgressDisplay`

- [ ] **Step 1: Write failing progress tests**

```ts
it("caps a target bar but preserves an above-target raw value", () => {
  expect(getProgressDisplay(targetDefinition, { value: 13 })).toEqual({
    kind: "bar",
    percent: 100,
    label: "13 / เป้าหมาย 12 ครั้ง",
    targetAchieved: true,
  });
});

it("does not fabricate a percentage for trend-only measures", () => {
  expect(getProgressDisplay(trendDefinition, { value: 0.82 })).toEqual({
    kind: "trend",
    label: "0.82 m/s",
    targetAchieved: null,
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the missing module failure**

Run:

```powershell
npm.cmd test -- src/features/clinical/progress.test.ts
```

Expected: FAIL because `getProgressDisplay` is not defined.

- [ ] **Step 3: Define exact domain types**

Use discriminated target methods:

```ts
export type TargetMethod =
  | { kind: "fixed-max"; maximum: number }
  | { kind: "normative-target"; target: number; sourceLabel: string }
  | { kind: "trend-only" };

export type MeasureDirection = "higher-is-better" | "lower-is-better";

export interface MeasureDefinition {
  id: string;
  name: string;
  unit: string;
  direction: MeasureDirection;
  targetMethod: TargetMethod;
  sourceLabel: string;
  items: Array<{ id: string; label: string; maximum?: number }>;
}

export interface MeasureResult {
  value: number;
  baselineValue: number;
  measuredAt: string;
  itemScores: Record<string, number>;
}

export interface ProgressSample {
  value: number;
  baselineValue?: number;
}

export interface SaveReceipt {
  revisionId: string;
  confirmedAt: string;
  actor: "owner";
}

export interface ClinicalRepository {
  loadWorkspace(input: LoadWorkspaceInput): Promise<PatientWorkspace>;
  saveMeasure(input: SaveMeasureInput): Promise<SaveReceipt>;
  saveSoap(input: SaveSoapInput): Promise<SaveReceipt>;
}
```

`PatientWorkspace` must contain patient, visits, active problems, measure results, SOAP by visit, approved-active EBP summaries, confirmed health items, current program, seven-day schedule, holistic snapshots and at most three Hermes-style priority proposals.

`getProgressDisplay(definition: MeasureDefinition, sample: ProgressSample)` uses these exact rules:

- `fixed-max`: `value / maximum`, allowed only for `higher-is-better`.
- higher-is-better `normative-target`: `value / target`.
- lower-is-better `normative-target`: require `baselineValue`, then use `(baselineValue - value) / (baselineValue - target)`; if baseline already meets the target, return 100%.
- clamp visual percent to 0–100 while preserving the raw label.
- `trend-only`: return no percent and `targetAchieved: null`.

The fixture must be explicitly invented and use:

```ts
patient: {
  id: "synthetic-patient-001",
  displayName: "คุณสมมติ ใจดี",
  sex: "female",
  ageYears: 68,
  bmi: 23.4,
}
```

Add three visits and two active problems so date switching and multiple measures are testable. Use no copied real SOAP or contact information.

- [ ] **Step 4: Implement validation and the in-memory adapter**

Validate `patient` as opaque text and `visit` as `YYYY-MM-DD`. The adapter must clone fixtures on construction, update only its in-memory copy, wait for a short promise tick, and reject with `NetworkUnavailableError` when constructed with `{ failWrites: true }`.

```ts
export const createSyntheticRepository = (
  options: { failWrites?: boolean } = {},
): ClinicalRepository => new SyntheticClinicalRepository(options);
```

- [ ] **Step 5: Run domain verification**

Run:

```powershell
npm.cmd test -- src/features/clinical
npm.cmd run lint
```

Expected: progress, schema and repository tests pass; lint exits 0.

- [ ] **Step 6: Commit only the clinical contract**

```powershell
git add src/features/clinical/types.ts src/features/clinical/schemas.ts src/features/clinical/progress.ts src/features/clinical/progress.test.ts src/features/clinical/synthetic-fixtures.ts src/features/clinical/synthetic-repository.ts src/features/clinical/synthetic-repository.test.ts
git commit -m "feat: define synthetic clinical domain"
```

---

### Task 3: Build the mobile workspace shell and Calendar-style entry

**Files:**
- Create: `src/features/workspace/PatientWorkspace.tsx`
- Create: `src/features/workspace/WorkspaceHeader.tsx`
- Create: `src/features/workspace/usePatientWorkspace.ts`
- Create: `src/test/test-utils.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/workspace/PatientWorkspace.test.tsx`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `ClinicalRepository.loadWorkspace`.
- Produces: `PatientWorkspace` component with `record`, `patient`, `holistic` tab IDs and a visible save state.

- [ ] **Step 1: Write failing entry and tab tests**

```tsx
it("preselects the visit supplied by the Calendar-style query", async () => {
  render(
    <PatientWorkspace
      patientRef="synthetic-patient-001"
      visitDate="2026-07-30"
      repository={createSyntheticRepository()}
    />,
  );
  expect(await screen.findByText("30 ก.ค. 2026")).toBeInTheDocument();
});

it("shows the three approved tabs in order", async () => {
  renderWorkspace();
  const tabs = await screen.findAllByRole("tab");
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    "บันทึกคนไข้",
    "หน้าคนไข้",
    "Holistic Profile",
  ]);
});
```

- [ ] **Step 2: Run focused tests and confirm they fail**

Run:

```powershell
npm.cmd test -- src/features/workspace/PatientWorkspace.test.tsx src/app/page.test.tsx
```

Expected: FAIL because the workspace components do not exist.

- [ ] **Step 3: Implement query parsing and loading states**

`src/app/page.tsx` awaits Next.js `searchParams`, defaults to the synthetic patient and latest fixture visit, and enables failure simulation only with `network=offline`.

`page.tsx` must pass only serializable values across the Server Component boundary. `PatientWorkspace.tsx` exports a client-side `SyntheticPatientWorkspace` wrapper that creates one repository instance with `useState` and then renders the injectable `PatientWorkspace` used by tests:

```tsx
<SyntheticPatientWorkspace
  patientRef={parsed.patient}
  visitDate={parsed.visit}
  failWrites={parsed.network === "offline"}
/>
```

The workspace renders explicit `กำลังโหลด`, `โหลดข้อมูลไม่สำเร็จ`, `บันทึกแล้ว`, and `ยังไม่บันทึก` states.

`src/test/test-utils.tsx` exports `renderWorkspace(options)` and constructs a fresh synthetic repository for every test. Accepted options are `visitDate?: string` and `failWrites?: boolean`; defaults are `2026-07-30` and `false`.

- [ ] **Step 4: Implement the responsive shell**

Use a sticky header, touch targets at least 44 px, a horizontally safe three-tab control, and one-column mobile cards. On desktop, cap content at 760 px while preserving mobile reading order.

- [ ] **Step 5: Verify shell behavior**

Run:

```powershell
npm.cmd test -- src/features/workspace src/app/page.test.tsx
npm.cmd run lint
npm.cmd run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the workspace allowlist**

```powershell
git add src/app/page.tsx src/app/page.test.tsx src/app/globals.css src/features/workspace/PatientWorkspace.tsx src/features/workspace/PatientWorkspace.test.tsx src/features/workspace/WorkspaceHeader.tsx src/features/workspace/usePatientWorkspace.ts src/test/test-utils.tsx
git commit -m "feat: add mobile patient workspace"
```

---

### Task 4: Implement active problems and item-level measure editing

**Files:**
- Create: `src/features/record/ClinicalRecordTab.tsx`
- Create: `src/features/record/ProblemCard.tsx`
- Create: `src/features/record/MeasureEditor.tsx`
- Test: `src/features/record/ProblemCard.test.tsx`
- Test: `src/features/record/MeasureEditor.test.tsx`
- Modify: `src/features/workspace/PatientWorkspace.tsx`

**Interfaces:**
- Consumes: `Problem`, `MeasureDefinition`, `MeasureResult`, `ClinicalRepository.saveMeasure`.
- Produces: `onMeasureConfirmed(input): Promise<SaveReceipt>` and accessible item-score dialog.

- [ ] **Step 1: Write failing measure presentation tests**

```tsx
it("renders a separate progress row for every measure under a problem", () => {
  render(<ProblemCard problem={problemWithTwoMeasures} onEdit={vi.fn()} />);
  expect(screen.getByText("Barthel Index")).toBeInTheDocument();
  expect(screen.getByText("5 Times Sit to Stand")).toBeInTheDocument();
});

it("shows trend-only values without a progressbar role", () => {
  render(<ProblemCard problem={trendProblem} onEdit={vi.fn()} />);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByText("0.82 m/s")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm.cmd test -- src/features/record/ProblemCard.test.tsx src/features/record/MeasureEditor.test.tsx
```

Expected: FAIL because record components are missing.

- [ ] **Step 3: Implement problem cards**

Each card shows problem number, status, goal, one row per measure, raw value, unit, visit date, target/source label and either an accessible progress bar or trend indicator. A target achievement may show `ถึงเกณฑ์ดีขึ้น` but must not automatically label the problem `resolved`.

- [ ] **Step 4: Implement item editing and acknowledged save**

The editor displays prior visit item values beside current inputs. Disable confirm while invalid or saving. On success, close only after receiving `SaveReceipt`; on failure keep values mounted and show:

```text
ยังไม่บันทึก — อินเทอร์เน็ตหรือระบบไม่พร้อม
```

Provide a `คัดลอกข้อมูลที่กรอก` button using `navigator.clipboard.writeText` with a plain-text, synthetic-only summary.

- [ ] **Step 5: Verify interaction and regression**

Run:

```powershell
npm.cmd test -- src/features/record src/features/workspace
npm.cmd run lint
npm.cmd run build
```

Expected: item edit, prior-value guide, target display and failure retention tests pass.

- [ ] **Step 6: Commit the measure workflow**

```powershell
git add src/features/record/ClinicalRecordTab.tsx src/features/record/ProblemCard.tsx src/features/record/ProblemCard.test.tsx src/features/record/MeasureEditor.tsx src/features/record/MeasureEditor.test.tsx src/features/workspace/PatientWorkspace.tsx
git commit -m "feat: add item-level progress editing"
```

---

### Task 5: Add single-block SOAP, EBP and supporting health information

**Files:**
- Create: `src/features/record/SoapCard.tsx`
- Create: `src/features/record/EbpCard.tsx`
- Create: `src/features/record/HealthInfoCard.tsx`
- Test: `src/features/record/SoapCard.test.tsx`
- Test: `src/features/record/EbpCard.test.tsx`
- Test: `src/features/record/HealthInfoCard.test.tsx`
- Modify: `src/features/record/ClinicalRecordTab.tsx`

**Interfaces:**
- Consumes: SOAP-by-visit, approved-active EBP summaries and confirmed `HealthItem[]`.
- Produces: date-selected SOAP editor; EBP detail disclosure; collapsed health information.

- [ ] **Step 1: Write failing reading-order tests**

```tsx
it("renders exactly one SOAP block and changes its visit by date", async () => {
  const user = userEvent.setup();
  render(<SoapCard visits={visits} soapByVisit={soapByVisit} />);
  expect(screen.getAllByRole("region", { name: "SOAP" })).toHaveLength(1);
  await user.selectOptions(screen.getByLabelText("วันที่ visit"), "2026-07-16");
  expect(screen.getByDisplayValue(/เดินในบ้าน/)).toBeInTheDocument();
});

it("starts health information collapsed", () => {
  render(<HealthInfoCard items={confirmedHealthItems} />);
  expect(screen.getByRole("button", { name: /ข้อมูลสุขภาพประกอบ/ }))
    .toHaveAttribute("aria-expanded", "false");
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm.cmd test -- src/features/record/SoapCard.test.tsx src/features/record/EbpCard.test.tsx src/features/record/HealthInfoCard.test.tsx
```

Expected: FAIL because the three cards do not exist.

- [ ] **Step 3: Implement SOAP selection and save states**

Show S/O/A/P fields in one block. Date options span all fixture visits. The selected Calendar visit is initial. Save through `saveSoap`; keep typed text and copy action on failure.

- [ ] **Step 4: Implement EBP and health disclosures**

EBP summary cards show title, linked problem, concise direction, review date and evidence status. The detail view shows appraisal, recommendation grade and source links from fixtures. Health information groups confirmed items into medication, allergy/safety, laboratory observation and doctor appointment.

- [ ] **Step 5: Verify the complete Clinical Record tab**

Run:

```powershell
npm.cmd test -- src/features/record
npm.cmd run lint
npm.cmd run build
```

Expected: one SOAP region only, date switching, EBP disclosure and collapsed health grouping pass.

- [ ] **Step 6: Commit the clinical reading blocks**

```powershell
git add src/features/record/ClinicalRecordTab.tsx src/features/record/SoapCard.tsx src/features/record/SoapCard.test.tsx src/features/record/EbpCard.tsx src/features/record/EbpCard.test.tsx src/features/record/HealthInfoCard.tsx src/features/record/HealthInfoCard.test.tsx
git commit -m "feat: add SOAP EBP and health summaries"
```

---

### Task 6: Build the read-only Patient View

**Files:**
- Create: `src/features/patient-view/PatientViewTab.tsx`
- Create: `src/features/patient-view/ExerciseCard.tsx`
- Create: `src/features/patient-view/WeeklySchedule.tsx`
- Test: `src/features/patient-view/PatientViewTab.test.tsx`
- Test: `src/features/patient-view/WeeklySchedule.test.tsx`
- Modify: `src/features/workspace/PatientWorkspace.tsx`

**Interfaces:**
- Consumes: patient-safe fields of `PatientWorkspace`.
- Produces: read-only current programme, natural-language dosage, seven-day schedule, evidence links and confirmed health information.

- [ ] **Step 1: Write failing patient-safety tests**

```tsx
it("shows current confirmed health items but no SOAP or internal appraisal", () => {
  render(<PatientViewTab publication={patientPublication} />);
  expect(screen.getByText("ยาปัจจุบันและข้อมูลสุขภาพสำคัญ")).toBeInTheDocument();
  expect(screen.queryByText("SOAP")).not.toBeInTheDocument();
  expect(screen.queryByText(/risk of bias/i)).not.toBeInTheDocument();
});

it("expresses dosage naturally without four FITT boxes", () => {
  render(<ExerciseCard exercise={exercise} />);
  expect(screen.getByText("10 ครั้ง × 2 เซต • 5 วัน/สัปดาห์")).toBeInTheDocument();
  expect(screen.queryByText(/^F$/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm.cmd test -- src/features/patient-view
```

Expected: FAIL because Patient View components do not exist.

- [ ] **Step 3: Implement patient reading order**

Use this order:

1. ปัญหาและสิ่งที่กำลังดูแล
2. เทคนิคการรักษา
3. โปรแกรมฝึกปัจจุบัน
4. ตารางฝึก 7 วัน
5. หลักฐานงานวิจัยอ้างอิง
6. ยาปัจจุบันและข้อมูลสุขภาพสำคัญ

All article and YouTube anchors open safely with `rel="noreferrer"`. No controls mutate clinical data.

- [ ] **Step 4: Implement seven-day schedule**

Render seven compact day rows/cards, group rest and exercise days clearly, and show an empty-state explanation when a day has no prescribed exercise.

- [ ] **Step 5: Verify patient isolation at the component boundary**

Run:

```powershell
npm.cmd test -- src/features/patient-view src/features/workspace
npm.cmd run lint
npm.cmd run build
```

Expected: SOAP/internal EBP absence, confirmed health visibility, natural dosage and seven-day schedule pass.

- [ ] **Step 6: Commit Patient View**

```powershell
git add src/features/patient-view/PatientViewTab.tsx src/features/patient-view/PatientViewTab.test.tsx src/features/patient-view/ExerciseCard.tsx src/features/patient-view/WeeklySchedule.tsx src/features/patient-view/WeeklySchedule.test.tsx src/features/workspace/PatientWorkspace.tsx
git commit -m "feat: add read-only patient view"
```

---

### Task 7: Implement the seven-domain Holistic Profile

**Files:**
- Create: `src/features/holistic/HolisticProfileTab.tsx`
- Create: `src/features/holistic/HolisticRadar.tsx`
- Test: `src/features/holistic/HolisticProfileTab.test.tsx`
- Test: `src/features/holistic/HolisticRadar.test.tsx`
- Modify: `src/features/workspace/PatientWorkspace.tsx`

**Interfaces:**
- Consumes: `HolisticProfileSnapshot[]` and zero-to-three priority proposals.
- Produces: all-time default, 3m/6m/1y filters, accessible overview and domain drilldown.

- [ ] **Step 1: Write failing profile tests**

```tsx
it("defaults to the full treatment history", () => {
  render(<HolisticProfileTab snapshots={snapshots} priorities={priorities} />);
  expect(screen.getByRole("button", { name: "ตั้งแต่เริ่มรักษา" }))
    .toHaveAttribute("aria-pressed", "true");
});

it("does not render a single overall health score", () => {
  render(<HolisticProfileTab snapshots={snapshots} priorities={priorities} />);
  expect(screen.queryByText(/คะแนนสุขภาพรวม/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm.cmd test -- src/features/holistic
```

Expected: FAIL because Holistic Profile components do not exist.

- [ ] **Step 3: Implement the accessible overview**

Render seven axes in SVG with text equivalents in a list/table directly below it. The seven labels are:

```ts
[
  "ร่างกายและอาการ",
  "กิจกรรม",
  "การมีส่วนร่วม",
  "Frailty / กำลังสำรอง",
  "สิ่งแวดล้อมและผู้ดูแล",
  "ทรัพยากรและงบประมาณ",
  "เป้าหมายและความพร้อม",
]
```

The overview is an index only. Budget uses neutral constraint wording and never a deficit color label.

- [ ] **Step 4: Implement timeline filters and priorities**

Filter snapshots by all-time/3m/6m/1y without changing raw source values. Domain expansion shows trend points, supporting measure labels and visit dates. Show at most three proposals with reason, supporting data, missing data and confidence.

- [ ] **Step 5: Verify profile behavior**

Run:

```powershell
npm.cmd test -- src/features/holistic src/features/workspace
npm.cmd run lint
npm.cmd run build
```

Expected: full-history default, range filtering, seven accessible domains, no overall score and maximum-three priorities pass.

- [ ] **Step 6: Commit Holistic Profile**

```powershell
git add src/features/holistic/HolisticProfileTab.tsx src/features/holistic/HolisticProfileTab.test.tsx src/features/holistic/HolisticRadar.tsx src/features/holistic/HolisticRadar.test.tsx src/features/workspace/PatientWorkspace.tsx
git commit -m "feat: add holistic treatment profile"
```

---

### Task 8: Polish mobile behavior, accessibility and failure recovery

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/workspace/WorkspaceHeader.tsx`
- Modify: `src/features/workspace/PatientWorkspace.tsx`
- Test: `src/features/workspace/mobile-acceptance.test.tsx`
- Create: `README.md`

**Interfaces:**
- Consumes: all Phase 1 features.
- Produces: complete synthetic prototype, local run guide and acceptance evidence.

- [ ] **Step 1: Write the failing cross-feature acceptance test**

```tsx
it("supports the owner trial path without persisting real data", async () => {
  const user = userEvent.setup();
  renderWorkspace({ visitDate: "2026-07-30" });
  expect(await screen.findByText("ข้อมูลตัวอย่าง — ห้ามใช้ข้อมูลคนไข้จริง"))
    .toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "หน้าคนไข้" }));
  expect(screen.getByText("ตารางฝึก 7 วัน")).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Holistic Profile" }));
  expect(screen.getByText("ประเด็นที่ควรเน้นครั้งถัดไป")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the full test suite before polish**

Run:

```powershell
npm.cmd test
```

Expected: the new acceptance test fails until final labels and wiring are complete.

- [ ] **Step 3: Complete responsive and accessible states**

Ensure:

- 44 px minimum controls
- visible keyboard focus
- adequate text/background contrast
- dialogs have labels and Escape close
- tabs expose `tablist`, `tab`, and `tabpanel`
- progress indicators have raw-value accessible names
- horizontal overflow does not occur at 360 px
- the synthetic banner remains visible after tab changes
- offline simulation at `?network=offline` never displays `บันทึกแล้ว`

Write `README.md` with exact commands:

```powershell
npm.cmd install
npm.cmd run dev
```

and exact trial URLs:

```text
http://localhost:3000/?patient=synthetic-patient-001&visit=2026-07-30
http://localhost:3000/?patient=synthetic-patient-001&visit=2026-07-30&network=offline
```

- [ ] **Step 4: Run final automated verification**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Perform mobile visual acceptance**

Start `npm.cmd run dev`, inspect at 390 × 844 px, and verify:

1. Calendar-style URL opens the correct synthetic visit.
2. All three tabs are reachable without horizontal page scrolling.
3. Measure item editing shows prior values.
4. Successful save waits for acknowledgement.
5. Offline simulation preserves text and shows `ยังไม่บันทึก`.
6. SOAP remains one block while changing dates.
7. Patient View contains no SOAP/internal appraisal.
8. Holistic Profile starts at all treatment history.

Capture one screenshot per tab with synthetic data only.

- [ ] **Step 6: Commit the completed vertical slice**

```powershell
git add README.md src/app/globals.css src/features/workspace/WorkspaceHeader.tsx src/features/workspace/PatientWorkspace.tsx src/features/workspace/mobile-acceptance.test.tsx
git commit -m "feat: complete synthetic care vertical slice"
```

---

### Task 9: Create the private GitHub repository and push only the synthetic prototype

**Files:**
- Verify: all tracked files in the new repository

**Interfaces:**
- Consumes: completed local `main` branch.
- Produces: private GitHub repository `baan-physio-care` with no real patient data or secrets.

- [ ] **Step 1: Audit tracked content**

Run:

```powershell
git status --short
git ls-files
rg -n --hidden -S "SUPABASE_SERVICE_ROLE|PRIVATE KEY|BEGIN RSA|sk-|เลขบัตร|HN|CID" .
```

Expected: clean worktree; only source, tests, synthetic fixture and docs are tracked; secret/identifier scan returns no real credential or patient identifier.

- [ ] **Step 2: Verify history and build one final time**

Run:

```powershell
git log --oneline --decorate -10
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: intentional task commits and all verification commands pass.

- [ ] **Step 3: Create and push the private repository**

Use the connected GitHub account to create `baan-physio-care` as private, add it as `origin`, and push `main`. If GitHub CLI is the authenticated route, the exact command is:

```powershell
gh repo create baan-physio-care --private --source . --remote origin --push
```

Expected: remote visibility is `PRIVATE`; `main` points to the verified local commit.

- [ ] **Step 4: Verify remote privacy and files**

Run:

```powershell
gh repo view --json nameWithOwner,visibility,url,defaultBranchRef
git remote -v
```

Expected: `visibility` is `PRIVATE`, default branch is `main`, and no unrelated `web` repository files appear.

- [ ] **Step 5: Record Phase 1 handoff**

Add the local URL, verified commit, remote URL, screenshot paths and the explicit warning `ห้ามใช้ข้อมูลคนไข้จริงจนกว่า Phase 2–5 จะผ่าน` to the task handoff message. Do not add patient data to GitHub issues, commit messages, screenshots or logs.

## Phase 1 completion gate

Do not proceed to Clinical Core/Supabase implementation until the owner has tried the synthetic prototype and either:

- approves the interaction and three-tab reading order, or
- provides a concrete list of UI/workflow changes that is applied and reverified.

Phase 1 completion does not authorize real patient data. Real data remains blocked until the security, patient publication, operational and legal gates in the approved design specification pass.
