# Care App — P1 Foundation (Engine + UX + Character Sheet) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างโครงแอป Next.js ที่ผู้ใช้เลือกเป้าหมาย → ตอบแบบคัดกรองฟรี → เห็น "character sheet" (body chart + หกเหลี่ยมสเตตัส) โดยขับด้วย JourneyPack (JSON) — ยังไม่มี payment/backend/lead

**Architecture:** Frontend-only slice. แกนคือ **JourneyPack engine** (ฟังก์ชัน pure: load/validate → score → compute stats → readout → red-flags) ที่อ่านเนื้อหาจากไฟล์ JSON ต่อเป้าหมาย (เนื้อหาคลินิกอยู่ในข้อมูล ไม่ฮาร์ดโค้ดในตรรกะ). UI เป็น flow 3 หน้า (goal → screening → result) state เก็บใน Zustand store. ทดสอบ engine ด้วย Vitest (pure functions), UI ด้วย React Testing Library.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · Framer Motion (`motion`) · Zustand · Zod · Vitest · @testing-library/react · jsdom

## Global Constraints

- ภาษา UI = ไทย · mobile-first (เป้าหมายผู้ใช้มาจากแอด FB/IG บนมือถือ)
- **เนื้อหาคลินิกทั้งหมดอยู่ใน JourneyPack JSON เท่านั้น** — ตรรกะใน `src/lib` ห้ามฮาร์ดโค้ดคำวินิจฉัย/คำแนะนำรายโรค
- **Wording:** เรียก "แบบคัดกรอง / เช็กตัวเองเชิงให้ความรู้" — ห้ามคำว่า "วินิจฉัย / แนะนำการรักษา / รักษาด้วย AI" ใน copy ทุกที่
- ทุกหน้าผลลัพธ์ต้องมี disclaimer: `"ผลนี้เป็นการคัดกรองเชิงให้ความรู้ ไม่ใช่การวินิจฉัย ควรปรึกษานักกายภาพบำบัดเพื่อการประเมินที่แม่นยำ"`
- หกเหลี่ยมสเตตัส 6 แกน (ลำดับคงที่): `strength, balance, flexibility, endurance, function, comfort` — ป้ายไทย: แรง / ทรงตัว / ยืดหยุ่น / ทนทาน / ฟังก์ชัน / สบาย · ค่า 0–100
- Marker ปัญหา body chart: 🔴 pain · 🟧 weakness · 🟡 sensory · 🔵 movement
- Location: ทุก path ใต้ `care-app/` (subfolder ของ repo `web`) · commit เฉพาะเมื่อ step สั่ง
- ข้อมูลผู้ป่วยจริง/pt-assess = **ไม่แตะใน P1** (P1 ใช้ pack ตัวอย่าง + ค่าทดสอบ mock เท่านั้น)

---

### Task 1: Scaffold Next.js app + test runner

**Files:**
- Create: `care-app/` (Next.js project)
- Create: `care-app/vitest.config.ts`
- Create: `care-app/vitest.setup.ts`
- Create: `care-app/src/lib/__tests__/smoke.test.ts`
- Modify: `care-app/package.json` (add test script + deps)

**Interfaces:**
- Consumes: nothing
- Produces: รัน `npm run dev` ได้ · รัน `npm test` ได้ · path alias `@/` → `care-app/src`

- [ ] **Step 1: Scaffold Next.js**

Run (จาก `web/`):
```bash
npx create-next-app@latest care-app --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint --no-turbopack
```
Expected: โฟลเดอร์ `care-app/` ถูกสร้าง พร้อม `src/app/page.tsx`

- [ ] **Step 2: ติดตั้ง deps ของ P1**

Run (จาก `web/care-app/`):
```bash
npm install zustand zod motion
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```
Expected: ติดตั้งสำเร็จ ไม่มี error

- [ ] **Step 3: สร้าง vitest config**

Create `care-app/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `care-app/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: เพิ่ม test script**

Modify `care-app/package.json` — เพิ่มใน `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke test**

Create `care-app/src/lib/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add care-app
git commit -m "chore(care-app): scaffold Next.js app + Vitest"
```

---

### Task 2: JourneyPack types + Zod schema + loader

**Files:**
- Create: `care-app/src/lib/types.ts`
- Create: `care-app/src/lib/engine/pack.ts`
- Create: `care-app/src/lib/engine/__tests__/pack.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - type `StatKey = 'strength'|'balance'|'flexibility'|'endurance'|'function'|'comfort'`
  - type `JourneyPack` (validated)
  - `loadJourneyPack(raw: unknown): JourneyPack` — throws `ZodError` ถ้า schema ผิด

- [ ] **Step 1: เขียน type ฐาน**

Create `care-app/src/lib/types.ts`:
```ts
export const STAT_KEYS = [
  'strength', 'balance', 'flexibility', 'endurance', 'function', 'comfort',
] as const
export type StatKey = (typeof STAT_KEYS)[number]

export const STAT_LABELS_TH: Record<StatKey, string> = {
  strength: 'แรง',
  balance: 'ทรงตัว',
  flexibility: 'ยืดหยุ่น',
  endurance: 'ทนทาน',
  function: 'ฟังก์ชัน',
  comfort: 'สบาย',
}

export type StatRadar = Record<StatKey, number> // 0–100
```

- [ ] **Step 2: เขียน failing test ของ loader**

Create `care-app/src/lib/engine/__tests__/pack.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { loadJourneyPack } from '@/lib/engine/pack'

const minimal = {
  id: 'demo',
  goal: 'rehab',
  type: 'clinical',
  name: 'เดโม',
  intro: { what_is: 'a', how_help: 'b' },
  redFlags: [],
  screeningQuestions: [
    {
      id: 'q1', text: 'คำถาม', stat: null,
      options: [{ id: 'o1', label: 'ตัวเลือก', stage: 's1', stats: {} }],
    },
  ],
  stages: [{ id: 's1', label: 'ระยะ 1' }],
  freeReadout: { s1: { summary: 'ok', starterTechniques: [] } },
}

describe('loadJourneyPack', () => {
  it('parses a minimal valid pack', () => {
    const pack = loadJourneyPack(minimal)
    expect(pack.id).toBe('demo')
    expect(pack.screeningQuestions[0].options[0].stage).toBe('s1')
  })

  it('throws on missing required field', () => {
    const bad = { ...minimal, id: undefined }
    expect(() => loadJourneyPack(bad)).toThrow()
  })
})
```

Run: `npm test -- pack`
Expected: FAIL ("Cannot find module '@/lib/engine/pack'")

- [ ] **Step 3: เขียน schema + loader**

Create `care-app/src/lib/engine/pack.ts`:
```ts
import { z } from 'zod'
import { STAT_KEYS } from '@/lib/types'

const statPartial = z.object(
  Object.fromEntries(STAT_KEYS.map((k) => [k, z.number().optional()])),
).strict()

const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  stage: z.string().nullable(),
  stats: statPartial.default({}),
})

const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  stat: z.string().nullable().default(null),
  options: z.array(optionSchema).min(1),
})

const redFlagSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  message: z.string(),
})

const readoutSchema = z.object({
  summary: z.string(),
  starterTechniques: z.array(z.string()).default([]),
})

export const journeyPackSchema = z.object({
  id: z.string(),
  goal: z.string(),
  type: z.enum(['clinical', 'wellness']),
  name: z.string(),
  intro: z.object({ what_is: z.string(), how_help: z.string() }),
  redFlags: z.array(redFlagSchema).default([]),
  screeningQuestions: z.array(questionSchema).min(1),
  stages: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
  freeReadout: z.record(z.string(), readoutSchema),
})

export type JourneyPack = z.infer<typeof journeyPackSchema>

export function loadJourneyPack(raw: unknown): JourneyPack {
  return journeyPackSchema.parse(raw)
}
```

Run: `npm test -- pack`
Expected: PASS (2 tests)

- [ ] **Step 4: Commit**

```bash
git add care-app/src/lib
git commit -m "feat(care-app): JourneyPack schema + loader"
```

---

### Task 3: Scoring engine (answers → stage)

**Files:**
- Create: `care-app/src/lib/engine/scoring.ts`
- Create: `care-app/src/lib/engine/__tests__/scoring.test.ts`

**Interfaces:**
- Consumes: `JourneyPack` (Task 2)
- Produces:
  - type `Answers = Record<string, string>` (questionId → optionId)
  - `resolveStage(pack: JourneyPack, answers: Answers): string` — คืน stage id ที่พบบ่อยสุดจาก options ที่เลือก (tie → ตามลำดับ `pack.stages`); ถ้าไม่มี stage เลย → `pack.stages[0].id`

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/lib/engine/__tests__/scoring.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveStage, type Answers } from '@/lib/engine/scoring'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' }, redFlags: [],
  stages: [{ id: 'bed', label: 'ติดเตียง' }, { id: 'walk', label: 'ยืน-เดิน' }],
  freeReadout: { bed: { summary: 'x', starterTechniques: [] }, walk: { summary: 'y', starterTechniques: [] } },
  screeningQuestions: [
    { id: 'q1', text: 'q1', stat: null, options: [
      { id: 'a', label: 'a', stage: 'bed', stats: {} },
      { id: 'b', label: 'b', stage: 'walk', stats: {} },
    ] },
    { id: 'q2', text: 'q2', stat: null, options: [
      { id: 'c', label: 'c', stage: 'bed', stats: {} },
      { id: 'd', label: 'd', stage: 'walk', stats: {} },
    ] },
  ],
})

describe('resolveStage', () => {
  it('picks the majority stage', () => {
    const answers: Answers = { q1: 'a', q2: 'c' } // both bed
    expect(resolveStage(pack, answers)).toBe('bed')
  })

  it('breaks ties by stage order', () => {
    const answers: Answers = { q1: 'a', q2: 'd' } // 1 bed, 1 walk → bed first
    expect(resolveStage(pack, answers)).toBe('bed')
  })

  it('falls back to first stage when no answers', () => {
    expect(resolveStage(pack, {})).toBe('bed')
  })
})
```

Run: `npm test -- scoring`
Expected: FAIL ("Cannot find module")

- [ ] **Step 2: เขียน implementation**

Create `care-app/src/lib/engine/scoring.ts`:
```ts
import type { JourneyPack } from '@/lib/engine/pack'

export type Answers = Record<string, string>

export function resolveStage(pack: JourneyPack, answers: Answers): string {
  const counts = new Map<string, number>()
  for (const q of pack.screeningQuestions) {
    const optId = answers[q.id]
    if (!optId) continue
    const opt = q.options.find((o) => o.id === optId)
    if (!opt?.stage) continue
    counts.set(opt.stage, (counts.get(opt.stage) ?? 0) + 1)
  }
  let best = pack.stages[0].id
  let bestCount = -1
  for (const stage of pack.stages) {
    const c = counts.get(stage.id) ?? 0
    if (c > bestCount) {
      best = stage.id
      bestCount = c
    }
  }
  return best
}
```

Run: `npm test -- scoring`
Expected: PASS (3 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/lib/engine
git commit -m "feat(care-app): screening → stage resolver"
```

---

### Task 4: Stat radar computation

**Files:**
- Create: `care-app/src/lib/engine/stats.ts`
- Create: `care-app/src/lib/engine/__tests__/stats.test.ts`

**Interfaces:**
- Consumes: `JourneyPack` (Task 2), `Answers` (Task 3), `StatRadar`/`STAT_KEYS` (Task 1/2)
- Produces:
  - `computeStats(pack: JourneyPack, answers: Answers): StatRadar` — เริ่มทุกแกนที่ 50, บวกค่า `option.stats[key]` ของ option ที่เลือก, clamp 0–100

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/lib/engine/__tests__/stats.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { computeStats } from '@/lib/engine/stats'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' }, redFlags: [],
  stages: [{ id: 's', label: 's' }],
  freeReadout: { s: { summary: 'x', starterTechniques: [] } },
  screeningQuestions: [
    { id: 'q1', text: 'q1', stat: null, options: [
      { id: 'a', label: 'a', stage: 's', stats: { strength: 30, comfort: -20 } },
    ] },
  ],
})

describe('computeStats', () => {
  it('starts at 50 and applies option contributions', () => {
    const stats = computeStats(pack, { q1: 'a' })
    expect(stats.strength).toBe(80)
    expect(stats.comfort).toBe(30)
    expect(stats.balance).toBe(50)
  })

  it('clamps to 0–100', () => {
    const big = loadJourneyPack({
      ...pack,
      screeningQuestions: [{ id: 'q1', text: 'q', stat: null, options: [
        { id: 'a', label: 'a', stage: 's', stats: { strength: 999 } },
      ] }],
    })
    expect(computeStats(big, { q1: 'a' }).strength).toBe(100)
  })
})
```

Run: `npm test -- stats`
Expected: FAIL

- [ ] **Step 2: เขียน implementation**

Create `care-app/src/lib/engine/stats.ts`:
```ts
import { STAT_KEYS, type StatRadar } from '@/lib/types'
import type { JourneyPack } from '@/lib/engine/pack'
import type { Answers } from '@/lib/engine/scoring'

const clamp = (n: number) => Math.max(0, Math.min(100, n))

export function computeStats(pack: JourneyPack, answers: Answers): StatRadar {
  const radar = Object.fromEntries(STAT_KEYS.map((k) => [k, 50])) as StatRadar
  for (const q of pack.screeningQuestions) {
    const opt = q.options.find((o) => o.id === answers[q.id])
    if (!opt) continue
    for (const k of STAT_KEYS) {
      const delta = opt.stats[k]
      if (typeof delta === 'number') radar[k] += delta
    }
  }
  for (const k of STAT_KEYS) radar[k] = clamp(radar[k])
  return radar
}
```

Run: `npm test -- stats`
Expected: PASS (2 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/lib/engine
git commit -m "feat(care-app): stat radar computation"
```

---

### Task 5: Free readout + red-flag detection

**Files:**
- Create: `care-app/src/lib/engine/readout.ts`
- Create: `care-app/src/lib/engine/__tests__/readout.test.ts`

**Interfaces:**
- Consumes: `JourneyPack`, `Answers`
- Produces:
  - `selectReadout(pack, stageId): { summary: string; starterTechniques: string[] }` — fallback เป็น `{ summary: '', starterTechniques: [] }` ถ้าไม่มี
  - `detectRedFlags(pack, answers): string[]` — คืน array ของ message ที่ตรง (questionId+optionId)

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/lib/engine/__tests__/readout.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { selectReadout, detectRedFlags } from '@/lib/engine/readout'
import { loadJourneyPack } from '@/lib/engine/pack'

const pack = loadJourneyPack({
  id: 'p', goal: 'rehab', type: 'clinical', name: 'p',
  intro: { what_is: 'a', how_help: 'b' },
  redFlags: [{ questionId: 'q1', optionId: 'danger', message: 'พบแพทย์ก่อน' }],
  stages: [{ id: 's', label: 's' }],
  freeReadout: { s: { summary: 'สรุป', starterTechniques: ['ท่า1'] } },
  screeningQuestions: [{ id: 'q1', text: 'q', stat: null, options: [
    { id: 'ok', label: 'ปกติ', stage: 's', stats: {} },
    { id: 'danger', label: 'อันตราย', stage: 's', stats: {} },
  ] }],
})

describe('selectReadout', () => {
  it('returns readout for a known stage', () => {
    expect(selectReadout(pack, 's').summary).toBe('สรุป')
  })
  it('falls back for unknown stage', () => {
    expect(selectReadout(pack, 'nope').starterTechniques).toEqual([])
  })
})

describe('detectRedFlags', () => {
  it('returns matching messages', () => {
    expect(detectRedFlags(pack, { q1: 'danger' })).toEqual(['พบแพทย์ก่อน'])
  })
  it('returns empty when none match', () => {
    expect(detectRedFlags(pack, { q1: 'ok' })).toEqual([])
  })
})
```

Run: `npm test -- readout`
Expected: FAIL

- [ ] **Step 2: เขียน implementation**

Create `care-app/src/lib/engine/readout.ts`:
```ts
import type { JourneyPack } from '@/lib/engine/pack'
import type { Answers } from '@/lib/engine/scoring'

export function selectReadout(pack: JourneyPack, stageId: string) {
  return pack.freeReadout[stageId] ?? { summary: '', starterTechniques: [] }
}

export function detectRedFlags(pack: JourneyPack, answers: Answers): string[] {
  return pack.redFlags
    .filter((rf) => answers[rf.questionId] === rf.optionId)
    .map((rf) => rf.message)
}
```

Run: `npm test -- readout`
Expected: PASS (4 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/lib/engine
git commit -m "feat(care-app): free readout + red-flag detection"
```

---

### Task 6: Sample Stroke JourneyPack + registry

**Files:**
- Create: `care-app/src/content/stroke.json`
- Create: `care-app/src/content/registry.ts`
- Create: `care-app/src/content/__tests__/registry.test.ts`

**Interfaces:**
- Consumes: `loadJourneyPack` (Task 2)
- Produces:
  - `GOALS: { id: string; label: string; emoji: string; packId: string | null }[]`
  - `getPack(packId: string): JourneyPack` — โหลด+validate pack จาก JSON (throw ถ้าไม่พบ)

- [ ] **Step 1: สร้าง sample pack (เนื้อหาคัดกรองจริงแบบย่อ)**

Create `care-app/src/content/stroke.json`:
```json
{
  "id": "stroke",
  "goal": "rehab",
  "type": "clinical",
  "name": "ฟื้นฟูโรคหลอดเลือดสมอง (Stroke)",
  "intro": {
    "what_is": "โรคหลอดเลือดสมองทำให้กล้ามเนื้ออ่อนแรงครึ่งซีก การเคลื่อนไหวและการทรงตัวลดลง",
    "how_help": "กายภาพบำบัดช่วยฟื้นการเคลื่อนไหว ฝึกลงน้ำหนัก ทรงตัว และเดิน อย่างปลอดภัยและไล่ระดับ"
  },
  "redFlags": [
    { "questionId": "q_pain", "optionId": "severe", "message": "มีอาการปวดรุนแรง ควรปรึกษานักกายภาพ/แพทย์ก่อนเริ่มออกกำลังกาย" }
  ],
  "stages": [
    { "id": "bed", "label": "ระยะติดเตียง" },
    { "id": "sit", "label": "ระยะนั่งทรงตัว" },
    { "id": "walk", "label": "ระยะยืน-เดิน" }
  ],
  "screeningQuestions": [
    {
      "id": "q_mobility", "text": "ตอนนี้เคลื่อนไหวได้แค่ไหน", "stat": "function",
      "options": [
        { "id": "bedbound", "label": "นอนติดเตียง พลิกตัวเองลำบาก", "stage": "bed", "stats": { "function": -30, "strength": -20, "endurance": -20 } },
        { "id": "sits", "label": "นั่งได้ แต่ยังไม่ยืน", "stage": "sit", "stats": { "function": -5, "balance": -10 } },
        { "id": "walks", "label": "ยืน/เดินได้บ้าง", "stage": "walk", "stats": { "function": 15, "strength": 10 } }
      ]
    },
    {
      "id": "q_balance", "text": "การทรงตัวเป็นอย่างไร", "stat": "balance",
      "options": [
        { "id": "poor", "label": "ทรงตัวไม่ได้ ต้องพยุงตลอด", "stage": "bed", "stats": { "balance": -30 } },
        { "id": "fair", "label": "นั่งทรงตัวได้ ยืนต้องช่วย", "stage": "sit", "stats": { "balance": -10 } },
        { "id": "good", "label": "ยืนเองได้พอควร", "stage": "walk", "stats": { "balance": 15 } }
      ]
    },
    {
      "id": "q_pain", "text": "มีอาการปวด (เช่น ปวดไหล่ข้างอ่อนแรง) ไหม", "stat": "comfort",
      "options": [
        { "id": "none", "label": "ไม่ปวด", "stage": null, "stats": { "comfort": 15 } },
        { "id": "mild", "label": "ปวดเล็กน้อย", "stage": null, "stats": { "comfort": -10 } },
        { "id": "severe", "label": "ปวดมาก", "stage": null, "stats": { "comfort": -30 } }
      ]
    }
  ],
  "freeReadout": {
    "bed": {
      "summary": "อยู่ในระยะติดเตียง เป้าหมายแรกคือป้องกันข้อติด แผลกดทับ และเริ่มกระตุ้นการเคลื่อนไหวเบา ๆ",
      "starterTechniques": ["จัดท่านอนสลับทุก 2 ชม.", "ขยับข้อแขน-ขาเบา ๆ (passive ROM) วันละ 2 รอบ"]
    },
    "sit": {
      "summary": "นั่งทรงตัวได้แล้ว เป้าหมายคือเพิ่มความมั่นคงของลำตัวและเตรียมการลงน้ำหนักเพื่อฝึกยืน",
      "starterTechniques": ["ฝึกนั่งเอื้อมหยิบของข้างลำตัว", "ฝึกลงน้ำหนักผ่านแขนข้างที่แข็งแรง"]
    },
    "walk": {
      "summary": "ยืน-เดินได้บ้างแล้ว เป้าหมายคือเพิ่มความแข็งแรง ความมั่นใจ และความปลอดภัยในการเดิน",
      "starterTechniques": ["ฝึกลุก-นั่งจากเก้าอี้ช้า ๆ", "ฝึกยืนถ่ายน้ำหนักซ้าย-ขวา โดยมีที่จับ"]
    }
  }
}
```

- [ ] **Step 2: เขียน failing test ของ registry**

Create `care-app/src/content/__tests__/registry.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { GOALS, getPack } from '@/content/registry'

describe('registry', () => {
  it('exposes the rehab goal mapped to stroke pack', () => {
    const rehab = GOALS.find((g) => g.id === 'rehab')
    expect(rehab?.packId).toBe('stroke')
  })

  it('loads and validates the stroke pack', () => {
    const pack = getPack('stroke')
    expect(pack.name).toContain('Stroke')
    expect(pack.screeningQuestions.length).toBe(3)
  })

  it('throws on unknown pack', () => {
    expect(() => getPack('nope')).toThrow()
  })
})
```

Run: `npm test -- registry`
Expected: FAIL

- [ ] **Step 3: เขียน registry**

Create `care-app/src/content/registry.ts`:
```ts
import { loadJourneyPack, type JourneyPack } from '@/lib/engine/pack'
import strokeRaw from '@/content/stroke.json'

const RAW_PACKS: Record<string, unknown> = {
  stroke: strokeRaw,
}

export const GOALS: { id: string; label: string; emoji: string; packId: string | null }[] = [
  { id: 'rehab', label: 'ฟื้นฟูจากโรค', emoji: '🏥', packId: 'stroke' },
  { id: 'elderly', label: 'แข็งแรง–กันล้ม (สูงวัย)', emoji: '💪', packId: null },
  { id: 'pain', label: 'หายปวด–ขยับสบาย', emoji: '🔥', packId: null },
  { id: 'weight', label: 'ลดน้ำหนัก–กระชับ', emoji: '⚖️', packId: null },
  { id: 'wellness', label: 'ดูแลสุขภาพทั่วไป', emoji: '🌱', packId: null },
]

export function getPack(packId: string): JourneyPack {
  const raw = RAW_PACKS[packId]
  if (!raw) throw new Error(`Unknown pack: ${packId}`)
  return loadJourneyPack(raw)
}
```

- [ ] **Step 4: เปิด JSON import ใน tsconfig (ถ้ายังไม่เปิด)**

ตรวจ `care-app/tsconfig.json` ว่ามี `"resolveJsonModule": true` ใน `compilerOptions` (create-next-app ใส่ให้แล้วโดย default) — ถ้าไม่มีให้เพิ่ม

Run: `npm test -- registry`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add care-app/src/content
git commit -m "feat(care-app): stroke JourneyPack + goal registry"
```

---

### Task 7: Session store (Zustand)

**Files:**
- Create: `care-app/src/lib/store.ts`
- Create: `care-app/src/lib/__tests__/store.test.ts`

**Interfaces:**
- Consumes: `Answers` (Task 3)
- Produces:
  - hook `useSession` ด้วย state: `goalId, packId, answers` + actions `selectGoal(goalId, packId)`, `setAnswer(qId, optId)`, `reset()`

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/lib/__tests__/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useSession } from '@/lib/store'

describe('useSession', () => {
  beforeEach(() => useSession.getState().reset())

  it('selects a goal', () => {
    useSession.getState().selectGoal('rehab', 'stroke')
    expect(useSession.getState().packId).toBe('stroke')
  })

  it('records answers', () => {
    useSession.getState().setAnswer('q1', 'a')
    useSession.getState().setAnswer('q2', 'b')
    expect(useSession.getState().answers).toEqual({ q1: 'a', q2: 'b' })
  })

  it('resets', () => {
    useSession.getState().selectGoal('rehab', 'stroke')
    useSession.getState().reset()
    expect(useSession.getState().goalId).toBeNull()
  })
})
```

Run: `npm test -- store`
Expected: FAIL

- [ ] **Step 2: เขียน store**

Create `care-app/src/lib/store.ts`:
```ts
import { create } from 'zustand'
import type { Answers } from '@/lib/engine/scoring'

type SessionState = {
  goalId: string | null
  packId: string | null
  answers: Answers
  selectGoal: (goalId: string, packId: string | null) => void
  setAnswer: (questionId: string, optionId: string) => void
  reset: () => void
}

export const useSession = create<SessionState>((set) => ({
  goalId: null,
  packId: null,
  answers: {},
  selectGoal: (goalId, packId) => set({ goalId, packId, answers: {} }),
  setAnswer: (questionId, optionId) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: optionId } })),
  reset: () => set({ goalId: null, packId: null, answers: {} }),
}))
```

Run: `npm test -- store`
Expected: PASS (3 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/lib/store.ts care-app/src/lib/__tests__/store.test.ts
git commit -m "feat(care-app): session store"
```

---

### Task 8: Stat hexagon radar component (SVG)

**Files:**
- Create: `care-app/src/components/StatHexagon.tsx`
- Create: `care-app/src/components/__tests__/StatHexagon.test.tsx`

**Interfaces:**
- Consumes: `StatRadar`, `STAT_KEYS`, `STAT_LABELS_TH` (Task 1)
- Produces: `<StatHexagon stats={StatRadar} />` — SVG หกเหลี่ยม 6 แกน แสดงป้ายไทย + polygon ตามค่า

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/components/__tests__/StatHexagon.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatHexagon } from '@/components/StatHexagon'

describe('StatHexagon', () => {
  it('renders all six Thai axis labels', () => {
    render(<StatHexagon stats={{
      strength: 50, balance: 50, flexibility: 50,
      endurance: 50, function: 50, comfort: 50,
    }} />)
    for (const label of ['แรง', 'ทรงตัว', 'ยืดหยุ่น', 'ทนทาน', 'ฟังก์ชัน', 'สบาย']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders a value polygon', () => {
    const { container } = render(<StatHexagon stats={{
      strength: 80, balance: 20, flexibility: 60,
      endurance: 40, function: 70, comfort: 30,
    }} />)
    expect(container.querySelector('[data-testid="value-polygon"]')).toBeTruthy()
  })
})
```

Run: `npm test -- StatHexagon`
Expected: FAIL

- [ ] **Step 2: เขียน component**

Create `care-app/src/components/StatHexagon.tsx`:
```tsx
import { STAT_KEYS, STAT_LABELS_TH, type StatRadar } from '@/lib/types'

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const R = 90

function point(index: number, radius: number) {
  // start at top (-90deg), 6 axes clockwise
  const angle = (-90 + index * 60) * (Math.PI / 180)
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)] as const
}

export function StatHexagon({ stats }: { stats: StatRadar }) {
  const gridPoints = STAT_KEYS.map((_, i) => point(i, R).join(',')).join(' ')
  const valuePoints = STAT_KEYS
    .map((k, i) => point(i, (stats[k] / 100) * R).join(','))
    .join(' ')

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px]" role="img" aria-label="สเตตัสร่างกาย">
      <polygon points={gridPoints} fill="none" stroke="#cbd5e1" strokeWidth={1} />
      <polygon points={gridPoints.split(' ').map((p) => {
        const [x, y] = p.split(',').map(Number)
        return `${CX + (x - CX) * 0.5},${CY + (y - CY) * 0.5}`
      }).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      <polygon data-testid="value-polygon" points={valuePoints}
        fill="rgba(43,124,184,0.35)" stroke="#2b7cb8" strokeWidth={2} />
      {STAT_KEYS.map((k, i) => {
        const [lx, ly] = point(i, R + 22)
        return (
          <text key={k} x={lx} y={ly} fontSize={13} fill="#0f3a5f"
            textAnchor="middle" dominantBaseline="middle">
            {STAT_LABELS_TH[k]}
          </text>
        )
      })}
    </svg>
  )
}
```

Run: `npm test -- StatHexagon`
Expected: PASS (2 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/components/StatHexagon.tsx care-app/src/components/__tests__/StatHexagon.test.tsx
git commit -m "feat(care-app): stat hexagon radar"
```

---

### Task 9: Body chart avatar component

**Files:**
- Create: `care-app/public/body-chart.jpg` (คัดลอกจาก vault asset)
- Create: `care-app/src/components/BodyChart.tsx`
- Create: `care-app/src/components/__tests__/BodyChart.test.tsx`

**Interfaces:**
- Consumes: nothing (markers ส่งเข้าเป็น prop)
- Produces: `<BodyChart markers={Marker[]} />` ; `type Marker = { x: number; y: number; kind: 'pain'|'weakness'|'sensory'|'movement' }` (x,y เป็น % 0–100)

- [ ] **Step 1: คัดลอก asset**

Run (จาก `web/`):
```bash
cp "../../Obsidian-Vault/20-Academic-SWU/Templates/clinical-assets/body-chart.jpg" care-app/public/body-chart.jpg
```
ถ้า path ไม่ตรง ให้หา `body-chart.jpg` ใน vault แล้วคัดลอกเข้า `care-app/public/body-chart.jpg`
Expected: ไฟล์อยู่ใน `care-app/public/`

- [ ] **Step 2: เขียน failing test**

Create `care-app/src/components/__tests__/BodyChart.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BodyChart } from '@/components/BodyChart'

describe('BodyChart', () => {
  it('renders the chart image', () => {
    render(<BodyChart markers={[]} />)
    expect(screen.getByAltText('แผนภาพร่างกาย')).toBeInTheDocument()
  })

  it('renders one node per marker', () => {
    const { container } = render(<BodyChart markers={[
      { x: 13, y: 30, kind: 'pain' },
      { x: 36, y: 40, kind: 'weakness' },
    ]} />)
    expect(container.querySelectorAll('[data-marker]').length).toBe(2)
  })
})
```

Run: `npm test -- BodyChart`
Expected: FAIL

- [ ] **Step 3: เขียน component**

Create `care-app/src/components/BodyChart.tsx`:
```tsx
export type Marker = { x: number; y: number; kind: 'pain' | 'weakness' | 'sensory' | 'movement' }

const COLOR: Record<Marker['kind'], string> = {
  pain: '#ef4444',       // 🔴
  weakness: '#f97316',   // 🟧
  sensory: '#eab308',    // 🟡
  movement: '#3b82f6',   // 🔵
}

export function BodyChart({ markers }: { markers: Marker[] }) {
  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/body-chart.jpg" alt="แผนภาพร่างกาย" className="w-full" />
      {markers.map((m, i) => (
        <span key={i} data-marker={m.kind}
          className="absolute h-3 w-3 rounded-full ring-2 ring-white -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%`, background: COLOR[m.kind] }} />
      ))}
    </div>
  )
}
```

Run: `npm test -- BodyChart`
Expected: PASS (2 tests)

- [ ] **Step 4: Commit**

```bash
git add care-app/src/components/BodyChart.tsx care-app/src/components/__tests__/BodyChart.test.tsx care-app/public/body-chart.jpg
git commit -m "feat(care-app): body chart avatar with markers"
```

---

### Task 10: Goal entry page

**Files:**
- Modify: `care-app/src/app/page.tsx`
- Create: `care-app/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `GOALS` (Task 6), `useSession` (Task 7)
- Produces: หน้าแรกแสดงการ์ดเป้าหมายทั้งหมด · กดเป้าที่มี pack → set session + `router.push('/screening')`

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/app/page.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'
import { useSession } from '@/lib/store'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('Goal entry page', () => {
  beforeEach(() => { push.mockClear(); useSession.getState().reset() })

  it('renders all goals', () => {
    render(<Page />)
    expect(screen.getByText('ฟื้นฟูจากโรค')).toBeInTheDocument()
    expect(screen.getByText('ดูแลสุขภาพทั่วไป')).toBeInTheDocument()
  })

  it('navigates to screening when a ready goal is chosen', () => {
    render(<Page />)
    screen.getByText('ฟื้นฟูจากโรค').click()
    expect(useSession.getState().packId).toBe('stroke')
    expect(push).toHaveBeenCalledWith('/screening')
  })
})
```

Run: `npm test -- page`
Expected: FAIL

- [ ] **Step 2: เขียนหน้า**

Replace `care-app/src/app/page.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { GOALS } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const selectGoal = useSession((s) => s.selectGoal)

  function choose(goalId: string, packId: string | null) {
    selectGoal(goalId, packId)
    if (packId) router.push('/screening')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0f3a5f]">เป้าหมายของคุณคืออะไร?</h1>
      <p className="mt-1 text-sm text-slate-500">เลือกสิ่งที่อยากดูแล แล้วเราจะช่วยเช็กให้</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => choose(g.id, g.packId)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99] disabled:opacity-50"
            disabled={!g.packId}>
            <span className="text-2xl">{g.emoji}</span>
            <span className="flex-1 font-medium text-slate-800">{g.label}</span>
            {!g.packId && <span className="text-xs text-slate-400">เร็ว ๆ นี้</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
```

Run: `npm test -- page`
Expected: PASS (2 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/app/page.tsx care-app/src/app/page.test.tsx
git commit -m "feat(care-app): goal entry page"
```

---

### Task 11: Screening page

**Files:**
- Create: `care-app/src/app/screening/page.tsx`
- Create: `care-app/src/app/screening/page.test.tsx`

**Interfaces:**
- Consumes: `useSession`, `getPack`, `setAnswer`
- Produces: แสดงคำถามทีละข้อจาก pack · ตอบครบ → `router.push('/result')` · ถ้าไม่มี packId → push กลับ `/`

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/app/screening/page.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/screening/page'
import { useSession } from '@/lib/store'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('Screening page', () => {
  beforeEach(() => {
    push.mockClear()
    useSession.getState().reset()
    useSession.getState().selectGoal('rehab', 'stroke')
  })

  it('shows the first question', () => {
    render(<Page />)
    expect(screen.getByText('ตอนนี้เคลื่อนไหวได้แค่ไหน')).toBeInTheDocument()
  })

  it('advances and finishes to result', () => {
    render(<Page />)
    screen.getByText('นั่งได้ แต่ยังไม่ยืน').click()
    screen.getByText('นั่งทรงตัวได้ ยืนต้องช่วย').click()
    screen.getByText('ไม่ปวด').click()
    expect(push).toHaveBeenCalledWith('/result')
    expect(useSession.getState().answers.q_mobility).toBe('sits')
  })
})
```

Run: `npm test -- screening`
Expected: FAIL

- [ ] **Step 2: เขียนหน้า**

Create `care-app/src/app/screening/page.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const setAnswer = useSession((s) => s.setAnswer)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!packId) router.push('/')
  }, [packId, router])
  if (!packId) return null

  const pack = getPack(packId)
  const q = pack.screeningQuestions[index]

  function answer(optionId: string) {
    setAnswer(q.id, optionId)
    if (index + 1 < pack.screeningQuestions.length) setIndex(index + 1)
    else router.push('/result')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <p className="text-xs text-slate-400">
        ข้อ {index + 1} / {pack.screeningQuestions.length}
      </p>
      <h2 className="mt-2 text-xl font-bold text-[#0f3a5f]">{q.text}</h2>
      <div className="mt-6 grid gap-3">
        {q.options.map((o) => (
          <button key={o.id} onClick={() => answer(o.id)}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99]">
            {o.label}
          </button>
        ))}
      </div>
    </main>
  )
}
```

Run: `npm test -- screening`
Expected: PASS (2 tests)

- [ ] **Step 3: Commit**

```bash
git add care-app/src/app/screening
git commit -m "feat(care-app): screening flow page"
```

---

### Task 12: Result page (character sheet) + end-to-end wiring

**Files:**
- Create: `care-app/src/app/result/page.tsx`
- Create: `care-app/src/app/result/page.test.tsx`

**Interfaces:**
- Consumes: `useSession`, `getPack`, `resolveStage`, `computeStats`, `selectReadout`, `detectRedFlags`, `StatHexagon`, `BodyChart`
- Produces: หน้า character sheet = ชื่อ pack + stage + `StatHexagon` + `BodyChart` + readout + red-flags + disclaimer + ปุ่ม CTA "ปรึกษานักกายภาพ" (placeholder href `#consult`)

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/app/result/page.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/result/page'
import { useSession } from '@/lib/store'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('Result page', () => {
  beforeEach(() => {
    useSession.getState().reset()
    useSession.getState().selectGoal('rehab', 'stroke')
    useSession.getState().setAnswer('q_mobility', 'bedbound')
    useSession.getState().setAnswer('q_balance', 'poor')
    useSession.getState().setAnswer('q_pain', 'severe')
  })

  it('shows the resolved stage and readout', () => {
    render(<Page />)
    expect(screen.getByText(/ระยะติดเตียง/)).toBeInTheDocument()
  })

  it('shows red-flag warning and disclaimer and CTA', () => {
    render(<Page />)
    expect(screen.getByText(/ปวดรุนแรง/)).toBeInTheDocument()
    expect(screen.getByText(/ไม่ใช่การวินิจฉัย/)).toBeInTheDocument()
    expect(screen.getByText('ปรึกษานักกายภาพ')).toBeInTheDocument()
  })
})
```

Run: `npm test -- result`
Expected: FAIL

- [ ] **Step 2: เขียนหน้า**

Create `care-app/src/app/result/page.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'
import { resolveStage } from '@/lib/engine/scoring'
import { computeStats } from '@/lib/engine/stats'
import { selectReadout, detectRedFlags } from '@/lib/engine/readout'
import { StatHexagon } from '@/components/StatHexagon'
import { BodyChart } from '@/components/BodyChart'

const DISCLAIMER =
  'ผลนี้เป็นการคัดกรองเชิงให้ความรู้ ไม่ใช่การวินิจฉัย ควรปรึกษานักกายภาพบำบัดเพื่อการประเมินที่แม่นยำ'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const answers = useSession((s) => s.answers)

  useEffect(() => {
    if (!packId) router.push('/')
  }, [packId, router])
  if (!packId) return null

  const pack = getPack(packId)
  const stageId = resolveStage(pack, answers)
  const stage = pack.stages.find((s) => s.id === stageId)
  const stats = computeStats(pack, answers)
  const readout = selectReadout(pack, stageId)
  const redFlags = detectRedFlags(pack, answers)

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-xl font-bold text-[#0f3a5f]">{pack.name}</h1>
      <p className="mt-1 text-sm font-medium text-[#2b7cb8]">ระยะของคุณ: {stage?.label}</p>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <BodyChart markers={[]} />
        <StatHexagon stats={stats} />
      </div>

      {redFlags.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {redFlags.map((m, i) => <p key={i}>⚠ {m}</p>)}
        </div>
      )}

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-slate-700">{readout.summary}</p>
        {readout.starterTechniques.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
            {readout.starterTechniques.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}
      </section>

      <a href="#consult"
        className="mt-6 block rounded-2xl bg-[#0f3a5f] py-4 text-center font-semibold text-white">
        ปรึกษานักกายภาพ
      </a>

      <p className="mt-4 text-xs text-slate-400">{DISCLAIMER}</p>
    </main>
  )
}
```

Run: `npm test -- result`
Expected: PASS (2 tests)

- [ ] **Step 3: รัน test ทั้งหมด**

Run: `npm test`
Expected: PASS ทุกไฟล์

- [ ] **Step 4: ตรวจ build จริง**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี type error

- [ ] **Step 5: Commit**

```bash
git add care-app/src/app/result
git commit -m "feat(care-app): result character-sheet page + e2e flow"
```

---

### Task 13: Polish — Framer Motion transitions + mobile layout pass

**Files:**
- Modify: `care-app/src/app/result/page.tsx` (เพิ่ม motion เข้า section)
- Create: `care-app/src/components/FadeIn.tsx`
- Create: `care-app/src/components/__tests__/FadeIn.test.tsx`

**Interfaces:**
- Produces: `<FadeIn>` wrapper ใช้ `motion.div` fade+slide เข้า ใช้ครอบ section ผลลัพธ์

- [ ] **Step 1: เขียน failing test**

Create `care-app/src/components/__tests__/FadeIn.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FadeIn } from '@/components/FadeIn'

describe('FadeIn', () => {
  it('renders children', () => {
    render(<FadeIn><p>hello</p></FadeIn>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
```

Run: `npm test -- FadeIn`
Expected: FAIL

- [ ] **Step 2: เขียน component**

Create `care-app/src/components/FadeIn.tsx`:
```tsx
'use client'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  )
}
```

Run: `npm test -- FadeIn`
Expected: PASS

- [ ] **Step 3: ใช้ FadeIn ครอบบล็อก character sheet ใน result page**

Modify `care-app/src/app/result/page.tsx` — import แล้วครอบ `<div className="mt-4 rounded-2xl bg-white ...">` ด้วย `<FadeIn>...</FadeIn>`:
```tsx
import { FadeIn } from '@/components/FadeIn'
// ...
<FadeIn>
  <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
    <BodyChart markers={[]} />
    <StatHexagon stats={stats} />
  </div>
</FadeIn>
```

- [ ] **Step 4: รัน test ทั้งหมด + build**

Run: `npm test && npm run build`
Expected: PASS + build สำเร็จ

- [ ] **Step 5: ตรวจด้วยตา (manual)**

Run: `npm run dev` แล้วเปิด `http://localhost:3000` บนมือถือ/responsive: เลือก "ฟื้นฟูจากโรค" → ตอบ 3 ข้อ → เห็น character sheet (body chart + หกเหลี่ยม + readout + CTA + disclaimer) อนิเมชัน fade เข้า
Expected: flow ครบ ไม่มี error ใน console

- [ ] **Step 6: Commit**

```bash
git add care-app/src/components/FadeIn.tsx care-app/src/components/__tests__/FadeIn.test.tsx care-app/src/app/result/page.tsx
git commit -m "feat(care-app): motion transitions + result polish"
```

---

## Self-Review (ทำหลังเขียนแผนเสร็จ)

**Spec coverage (เทียบ spec V2):**
- §3 goal-first entry → Task 6 (GOALS) + Task 10 ✓
- §4 value ladder (ฟรี layer) → Task 12 free readout + CTA ✓ · (จ่ายแอป/จ่ายคน = แผนถัดไป P2/P3)
- §5 JourneyPack engine → Tasks 2-5 ✓
- §6 character sheet (body chart + หกเหลี่ยม) → Tasks 8, 9, 12 ✓ · (merge pt-assess จริง = P5, P1 ใช้ mock/answers)
- §7 safety (wording/red-flag/disclaimer/AI retrieval-only) → Global Constraints + Task 5 + Task 12 ✓
- §8 stack (Next.js/Tailwind/Motion/Zustand) → Task 1 ✓ · (Supabase/payment/booking/lead = P2-P3)
- §11 P1 build phase → ครอบทั้งแผนนี้ ✓

**ขอบเขตที่ "จงใจ" ไม่อยู่ใน P1 (อยู่แผนถัดไป):** payment (P3), lead capture + consult booking (P2), เนื้อหา 4 โรคที่เหลือ + wellness packs (P4-P5), merge pt-assess จริง (P5), auth/credit/refund (P3)

**Placeholder scan:** ไม่มี TBD/TODO — ทุก step มีโค้ดจริง · href `#consult` เป็น placeholder UI โดยตั้งใจ (ปุ่มจริงผูกใน P2)

**Type consistency:** `Answers`, `JourneyPack`, `StatRadar`, `StatKey`, `getPack`, `resolveStage`, `computeStats`, `selectReadout`, `detectRedFlags`, `useSession` ใช้ชื่อตรงกันทุก task ✓

---

## หมายเหตุก่อนเริ่ม (ของจริงที่อาจติด)
- `create-next-app` flag อาจเปลี่ยนตามเวอร์ชัน — ถ้า flag ไหน error ให้รันแบบ interactive แล้วเลือก: TypeScript ✓, Tailwind ✓, App Router ✓, src/ ✓, import alias `@/*`
- `motion/react` คือ package ใหม่ของ Framer Motion (เดิม `framer-motion`) — ถ้า import ไม่เจอ ใช้ `framer-motion` แทน
- path body-chart.jpg ใน vault อาจต่างเครื่อง — ยืนยัน path จริงก่อน cp
