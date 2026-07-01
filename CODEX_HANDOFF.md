# CODEX HANDOFF — Care App (บ้านกายภาพบำบัด ชลบุรี)

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง แล้วทำ **งานบนสุดของ Backlog ที่ยังไม่ติ๊ก** ต่อ
> ทำเสร็จ 1 ชิ้น → ติ๊ก checkbox + อัปเดตส่วน "สถานะปัจจุบัน" + commit + push
> ถ้าไม่ชัวร์เรื่องดีไซน์/เนื้อหา ให้ถามเจ้าของ (เฟี้ยว) ก่อน อย่าเดาแล้ว downgrade ฟีเจอร์ที่สั่งไว้

---

## 1. โปรเจกต์นี้คืออะไร
เว็บแอปกายภาพบำบัด B2C สำหรับคนไข้/ญาติ (stroke, ผู้สูงวัย, นักกีฬา) เป้าหมาย 2 อย่าง:
1. **หาเคสเยี่ยมบ้าน (home-case leads)** ← ตัวชี้วัดหลัก สำคัญกว่ายอดขายย่อย
2. สร้างรายได้จากคอนเทนต์/คอร์ส/ค่าปรึกษา

โมเดล: funnel แบบแอปดูดวง → ผู้ใช้เลือกเป้าหมาย → ตอบคำถามคัดกรอง (ให้ความรู้ ไม่ใช่วินิจฉัย) →
เห็นผลเป็น "character sheet" (โฮโลแกรม + สเตตัสหกเหลี่ยม) → upsell ปรึกษา/คอนเทนต์/จ่ายเงิน

## 2. Repo & stack
- Repo (canonical): `C:\dev\baankaiyaphap-web`  — แอปอยู่ใน `care-app/`
- GitHub: github.com/fiewfaw/-  · branch ทำงาน: `feat/care-app-p1`
- Next.js 16 (App Router, Turbopack, `src/` dir), React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` ใน globals.css), Zustand (store), Zod (validate pack), Vitest + RTL
- **ห้ามเพิ่ม dependency ใหญ่โดยไม่จำเป็น** · ทุกงานต้อง `npm run build` ผ่าน + `npm test` ผ่าน

## 3. สถาปัตยกรรมสำคัญ
- `care-app/src/content/registry.ts` — `GOALS` (การ์ดหน้าแรก) + `getPack(packId)` โหลด JourneyPack
- `care-app/src/content/stroke.json` — JourneyPack ของ stroke (screeningQuestions + stages + readouts + redFlags)
- `care-app/src/lib/engine/*` — engine: resolveStage / computeStats / selectReadout / detectRedFlags
- `care-app/src/lib/store.ts` — Zustand `useSession` (selectGoal, setAnswer, reset, packId, answers)
- Pages: `src/app/page.tsx` (เลือกเป้าหมาย) → `screening/page.tsx` → `result/page.tsx`
- ธีมโฮโลแกรม: class ใน `src/app/globals.css` →
  `.holo-brand .holo-title .holo-sub .holo-cyan .holo-card .holo-panel .holo-cta .holo-back .holo-progress`
  + StatHexagon (`src/components/StatHexagon.tsx`) + HologramAvatar (8-frame webp turntable, ไม่ใช้ WebGL)

## 4. คำสั่งรัน
```
cd care-app
npm run dev      # dev server (http://localhost:3000)
npm run build    # ต้องผ่านก่อน commit
npm test         # vitest ต้องผ่าน
npm run start    # prod
```
ถ้า build เจอ EPERM/lock: ปิด process node ที่ค้างก่อน (Windows) แล้ว build ใหม่

## 5. กติกา (ผู้ใช้ย้ำหลายรอบ — ห้ามพลาด)
- **เสียงแบรนด์ honest, no hype** · anchor: "ฟื้นฟูได้ ถ้าทำถูกวิธี" · ผลลัพธ์เป็นการคัดกรอง **ไม่ใช่วินิจฉัย** — ต้องมี disclaimer เสมอ
- UI ภาษาไทย · โทนโฮโลแกรม navy+cyan · อย่าแตะ/พังธีมเดิม เอฟเฟกต์ hover ทุกปุ่มต้องเหมือนกัน
- **payment เป็นฟีเจอร์หลัก ไม่ใช่แผนสำรอง** (GBPrimePay บุคคลธรรมดา)
- **ห้ามใช้ image API ที่เสียเงิน** (nanobanana ฯลฯ) — ภาพทั้งหมดเจ้าของสร้างจาก ChatGPT เองแล้วส่งมา
- อย่าเดา strategic แล้ว demote สิ่งที่สั่งตรง ๆ — ถามก่อน
- commit สั้น conventional: `feat(care-app): ...` / `content(care-app): ...` / `fix(care-app): ...`

## 6. สถานะปัจจุบัน (อัปเดตล่าสุด: 2026-07-01)
- ✅ Scaffold + JourneyPack engine + session store + stroke pack
- ✅ 3 หน้า (goal / screening / result) + StatHexagon + HologramAvatar หมุน 360°
- ✅ ธีมโฮโลแกรม + radar sweep เฉพาะพื้นที่ + จุดยอดกระพริบ + brand flicker + ปุ่มกลับ + hover เดียวกันทุกปุ่ม
- ✅ 3 หมวดตั้งชื่อจบ: **ฟื้นฟูจากโรค** (พร้อม → /conditions) / **ชะลอความเสื่อม** (เร็ว ๆ นี้) / **เพิ่มศักยภาพกีฬา** (เร็ว ๆ นี้)
- ✅ หน้าเลือกโรคย่อย `/conditions` — Stroke พร้อม, พาร์กินสัน/หลังผ่าตัด/มะเร็ง = เร็ว ๆ นี้ (build+test ผ่าน, verify ด้วย screenshot แล้ว)
- ⛔ ยังไม่มี: content pack หมวด 2–3 + โรคย่อยอื่น, ปุ่มปรึกษาจริง/เก็บ lead, payment

## 7. Backlog (ทำจากบนลงล่าง)

- [x] **0. ปิดงานค้าง: build + commit การเปลี่ยนชื่อหมวด** — ✅ รวมใน commit หน้าเลือกโรคย่อย
- [x] **1. หน้าเลือกโรคย่อยของ "ฟื้นฟูจากโรค" (/conditions)** — ✅ เสร็จ 2026-07-01
  (registry: Goal.href + CONDITIONS; page.tsx choose() รองรับ href; conditions/page.tsx; อัปเดต test; build+test ผ่าน)

- [ ] **2. Content pack หมวด "ชะลอความเสื่อม" (ผู้สูงวัย)**
  - สร้าง `src/content/elderly.json` โครงเดียวกับ `stroke.json` (screeningQuestions ~3 ข้อ + stages + readouts + redFlags)
  - หัวข้อคัดกรอง: ความเสี่ยงล้ม, แรงขา/ลุกนั่ง, การทรงตัว/เดิน, ข้อฝืด
  - register ใน `registry.ts` (RAW_PACKS + ผูก goal elderly packId `'elderly'`) → ปลดการ์ดจาก "เร็ว ๆ นี้"
  - **เนื้อหาให้เฟี้ยวรีวิว/แก้เอง** (เขาเป็น PT — เจ้าของคะแนนคลินิก) อย่าใส่ตัวเลข/เกณฑ์มั่ว

- [ ] **3. Content pack หมวด "เพิ่มศักยภาพกีฬา"**
  - `src/content/sport.json` แนวเดียวกับข้อ 2 (บาดเจ็บเดิม, ความยืดหยุ่น, ความแข็งแรง/พาวเวอร์, การฟื้นตัว)
  - register + ปลดการ์ด · เนื้อหาให้เฟี้ยวรีวิว

- [ ] **4. ปุ่ม "ปรึกษานักกายภาพ" จริง + เก็บ Lead (P2) — สำคัญสุดทางธุรกิจ**
  - ปุ่มใน `result/page.tsx` (ตอนนี้เป็น placeholder `href="#consult"`) → เปิดฟอร์ม: ชื่อ, เบอร์/LINE, เขต/อำเภอ, สรุปอาการ (auto จากผลคัดกรอง)
  - ส่ง lead ไปที่ปลายทางที่เก็บได้จริง (คุยกับเจ้าของก่อนเลือก: Google Sheet webhook / Formspree / API route) — **อย่า silent-drop**
  - แนบผลคัดกรอง (packId, stage, answers) ไปกับ lead เพื่อ follow-up

- [ ] **5. ระบบจ่ายเงิน (P3) — ฟีเจอร์หลัก**
  - GBPrimePay (บัญชีบุคคลธรรมดา) · ปลดล็อกคอนเทนต์ต่อหัวข้อ / มัดจำค่าปรึกษา
  - ต้อง live ตอน launch · คุย flow + สินค้ากับเจ้าของก่อนลงมือ

- [ ] **6. รวมข้อมูลความคืบหน้าจาก pt-assess (ภายหลัง)**

## 8. ไฟล์อ้างอิงเพิ่ม
- spec: `docs/superpowers/specs/2026-06-26-ban-physio-care-app-design.md`
- plan P1: `docs/superpowers/plans/2026-06-27-care-app-p1-foundation.md`
