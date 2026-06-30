# บ้านกายภาพ Care App — Goal-First Health Journey + Premium Upsell (Design Spec V2)

- **วันที่:** 2026-06-26 (V2 อัปเดต 2026-06-27)
- **เจ้าของ:** รัชธรรม เชื้อแถว (เฟี้ยว) — บ้านกายภาพ ชลบุรี
- **สถานะ:** Design V2 (brainstorm รอบใหญ่เสร็จ) → รอ user review → เขียน implementation plan
- **Working name:** "บ้านกายภาพ เช็คฟื้นฟู" (ชื่อทางการ = open)
- **เปลี่ยนจาก V1:** disease-first → **goal-first** · เพิ่ม value ladder 3 ขั้น · segment priority · 1.3→1.2 LTV pipeline · character sheet (merge pt-assess) · payment = core

---

## 1. วิสัยทัศน์ / Positioning

เว็บแอป freemium อนิเมชันสวย (สไตล์แอปดูดวง / หน้า status RPG) ที่ทำหน้าที่เป็น
**funnel ตั้งเป้า–เห็นปัญหา–คัดกรองลูกค้าให้อุ่น** ก่อนถึงคอร์สพรีเมียมของเฟี้ยว

- ปลายทางรายได้หลัก = **คอร์สเทรนกับเฟี้ยว + เคสโฮม** (ไม่ใช่ยอดขายหัวข้อ)
- **Anchor เสียงแบรนด์ (honest, no hype):** "ฟื้นฟู/แข็งแรงได้ ถ้าทำถูกวิธี" — ไม่เคลม "หายขาด/รักษาด้วย AI"
- จุดต่างจากแอปดูดวง = ของจริงมี evidence + เคสจริง + การวัดผลหนุน (ดูดวงมั่วได้ แต่นี่วัดได้)

---

## 2. จุดขายหลัก (Premium Service ของเฟี้ยว — สิ่งที่แอปต้องไป "ขาย")
การรักษา/พัฒนาร่างกายแบบพรีเมียม รู้สึกดี-สบาย-ปลอดภัย และวัดผลได้:
- manual / ยืด / คลายกล้ามเนื้อ แก้ปวด-ความไม่สบายก่อนออกกำลัง
- ไล่ระดับ warm up → กระตุ้นกล้ามเนื้อ → กระตุ้นการลงน้ำหนักข้อ → ออกกำลังจริงโดยไม่ปวด
- ใช้ KT tape ช่วยโครงสร้างที่คนไข้ใช้งานไม่ได้
- ประสิทธิภาพสูง + วัดผลได้

> แอปฟรี + จ่ายแอป มีไว้ **โชว์ช่องว่างที่มีแต่มือเฟี้ยวเติมได้** → ขายคอร์สโดยไม่ต้องตื๊อ

---

## 3. โครงสร้างลูกค้า (Goal-First) + ลำดับความสำคัญเชิงกลยุทธ์

แอปจัดระเบียบตาม **เป้าหมาย (goal)** ไม่ใช่โรค — เป้าหมายคือประตู (กว้าง เข้าง่าย) ความลึกอยู่ใน track

| Segment / Goal | จุดแข็งเฟี้ยว | จุดอ่อน/เสี่ยง | บทบาท (priority) |
|---|---|---|---|
| **1.3 ผู้ป่วย — "ฟื้นฟูโรค"** (5 heroes) | moat สูงสุด คู่แข่งน้อย need ชัด | ตลาดเล็ก + อายุลูกค้าสั้น (หายแล้วหลุด) | **★ ประตูเข้า + พิสูจน์ฝีมือ (build ก่อน)** |
| **1.2 สูงอายุ — "แข็งแรง/กันล้ม wellness"** | premium-comfort + ปลอดภัย (เทรนเนอร์ทำไม่ได้) กำลังซื้อสูง LTV ยาว | acquisition เย็นยาก คิดเยอะกว่าทำ | **★ retention/LTV (build ที่ 2)** |
| **1.1 ฟิต — "ลดน้ำหนัก/กระชับ"** | ความรู้ไม่ต้องลึก | moat อ่อนสุด แข่งเทรนเนอร์/อินฟลู + ผูกกับหุ่นเฟี้ยว | feeder ปากกว้าง (priority ต่ำ) |

### ★ แกนกลยุทธ์ (USER-APPROVED 2026-06-27): Pipeline 1.3 → 1.2
รับคนไข้ด้วยความเชี่ยวชาญ (1.3) → ส่งมอบพรีเมียม → **พอหายไม่ปล่อยหลุด แต่ "เลื่อนขั้น" เป็น
wellness สูงวัย (1.2)** ที่จ่ายยาวกว่า · แก้จุดอ่อน "อายุลูกค้าสั้น" ของ 1.3 + "acquisition เย็นยาก"
ของ 1.2 พร้อมกัน (1.2 ที่มาจาก warm graduation เชื่อใจอยู่แล้ว ไม่ต้องยิงแอดเย็นแพง)
**character sheet (ข้อ 6) = กาวเชื่อม pipeline นี้** — ใบสเตตัสไม่หายตอนหาย เป้าเปลี่ยนแต่ stats level ต่อ

### Goal entry (ประตูเดียว "เป้าหมายคุณคืออะไร?")
🏥 ฟื้นฟูจากโรค → เลือกโรค → rehab track (5 heroes) · 💪 แข็งแรง-กันล้ม (สูงวัย) ·
⚖️ ลดน้ำหนัก-กระชับ · 🔥 หายปวด/ขยับสบาย (office syndrome) · 🌱 ดูแลสุขภาพทั่วไป

---

## 4. Value Ladder (บันได 3 ขั้น) — โครงรายได้

| ขั้น | ชื่อ | คนได้อะไร | ราคา | บทบาท |
|---|---|---|---|---|
| **ฟรี** | "เห็นปัญหา + ตั้งเป้า" | self-check → character sheet (body chart + radar) โชว์ปัญหา + ตั้งเป้า + ทิศทาง + ท่าเริ่ม 1-2 + red-flag | ฟรี | hook + lead + data |
| **จ่ายแอป** | "แอปวางแผนให้" | โปรแกรมเฉพาะตัวไล่ระดับ (ตามวิธีเฟี้ยวแบบย่อ) + คลังเทคนิค/คลิป + ติดตามผล | ถูก-กลาง (sub/ราย plan) | DIY — คนไม่จ่ายคนแต่อยากมีแผน |
| **จ่ายคน** | "เทรนกับเฟี้ยว" | ประเมินตัวจริง + manual/คลาย/KT + คอร์สพรีเมียมวัดผล (ข้อ 2) | แพง | **รายได้จริง + เคสโฮม** |

- เส้นแบ่งฟรี/จ่าย: **ฟรี = ความเข้าใจ (เห็นปัญหา+เป้า+ทิศทาง) · กั๊ก "แผนเดินได้จริงเฉพาะตัว" ไว้ขาย**
- กลไกขาย: ทุกแผนจบด้วย checkpoint วัดผล → ตัน/ปวด/ต้อง manual → เด้ง "จุดนี้ต้องมือนักกายภาพ" → CTA คอร์ส

---

## 5. ผลต่อ Engine — "JourneyPack" (1 ไฟล์ JSON / เป้าหมาย)
- "ConditionPack" (V1) ยกระดับเป็น **JourneyPack** key = เป้าหมาย
- pack โรคคลินิก = sub-type ซ้อนใต้เป้า "ฟื้นฟูโรค" (เพิ่ม logic โรค+ระยะ+red-flag) · pack wellness เบากว่า
- multi-goal = เพิ่มไฟล์ · launch ด้วย framework + เป้าลึกตามลำดับ priority (1.3 → 1.2 → 1.1)

```json
{
  "id": "stroke",
  "goal": "rehab",
  "type": "clinical|wellness",
  "name": "...",
  "intro": { "what_is": "...", "how_help": "..." },
  "redFlags": [ { "q": "...", "ifYes": "พบแพทย์/ปรึกษาก่อน" } ],
  "screeningQuestions": [ { "id": "...", "text": "...", "type": "choice|scale" } ],
  "scoringRules": [ { "when": "...", "stageOrProfile": "..." } ],
  "statAxes": { "strength": "...", "balance": "...", "...": "..." },
  "freeReadout": { "byStage": { "...": { "summary": "...", "starterTechniques": [] } } },
  "appPlan": { "templates": [ { "phase": "warmup|activate|load|exercise", "items": [] } ] },
  "paidSections": [ { "id": "...", "title": "...", "price": 30, "clips": [], "body": "..." } ],
  "bundles": [ { "id": "...", "title": "...", "price": 149 } ],
  "consultCTA": { "label": "...", "default_visible": true }
}
```

---

## 6. Character Sheet (merge pt-assess) — หัวใจ engagement + กาว pipeline

UI อ้างอิงหน้า status RPG (รูปที่ user แนบ: body = ตัวละคร + หกเหลี่ยมสเตตัส)

- **Avatar = body chart 4-view** + marker ปัญหา (🔴ปวด 🟧อ่อนแรง 🟡sensory 🔵movement — convention เดิม)
  - asset: `vault\20-Academic-SWU\Templates\clinical-assets\body-chart.jpg`
- **หกเหลี่ยม = "ฟิสิคัลสเตตัส" (universal ทุก segment):**
  แรง / ทรงตัว / ยืดหยุ่น(ROM) / ทนทาน / ฟังก์ชัน / สบาย(ปวดกลับด้าน)
- re-test → stats โต = แรงจูงใจ + ทำให้ "ความคุ้ม" ของ 1.2 จับต้องได้ (เห็นเลขขึ้น = ยอมจ่ายพรีเมียม)
- **เลื่อนขั้นไม่รีเซ็ต:** หายโรค (1.3) → goal ใหม่ wellness (1.2) แต่ character sheet เดิม level ต่อ

### ⚠ เส้นแบ่ง ownership (กฎ "ผู้ประเมินเป็นเจ้าของคะแนนคลินิก")
- **เฟี้ยวเป็นเจ้าของคะแนนทดสอบคลินิก** → กรอกผ่าน **pt-assess** (validity)
- คนไข้ **self-log แค่ adherence/reps การบ้าน** ไม่ใช่ self-score คลินิก
- pt-assess (PT-facing, มีอยู่แล้ว) = แหล่งป้อน stat → แอปใหม่ (patient-facing) = view ที่ gamify
- ⚠ pt-assess มีข้อมูลคนไข้จริง → ตอนดึง schema/ข้อมูลจริงต้องเสนอแผน de-identify ก่อน (กฎ no-block)

---

## 7. ความปลอดภัย / กรอบคลินิก-กฎหมาย (บังคับ)
1. wording "คัดกรอง/เช็กตัวเองเชิงให้ความรู้" — ห้าม "วินิจฉัย/แนะนำการรักษา/รักษาด้วย AI"
2. **AI = retrieval/ประกอบ จากเทมเพลตที่เฟี้ยว vet ไว้** (rule-based) ไม่ generate คำแนะนำคลินิกใหม่
3. red-flag triage ทุก goal — เด่นใน รักษาโรค (CA/post-op) + สูงอายุ (ใจสั่น/เจ็บอก/ล้ม)
4. disclaimer ทุกหน้าผล + ก่อนเริ่มออกกำลัง
5. ภาพ/คลิปท่า = ภาพจริง/คลัง `pt-home-exercise` (ห้าม AI เดาท่า) ตรวจ pose ก่อนใช้
6. PDPA: เก็บเท่าจำเป็น บัญชีส่วนตัว ไม่ public-share ไม่เก็บเลขบัตร ปชช.

---

## 8. สถาปัตยกรรมเทคนิค

- **Frontend:** Next.js + Tailwind + Framer Motion (อนิเมชัน status sheet = หัวใจ hook) · mobile-first
- **Backend/Data:** Supabase (auth + Postgres + storage + RLS content-gating)
- **Payment (CORE — ต้องเปิดตั้งแต่ launch):**
  - user = **บุคคลธรรมดา + พร้อมเพย์บุคคล** → ใช้ **GB Prime Pay / ChillPay** (รับบุคคลธรรมดา ไม่ต้องจดบริษัท)
    รองรับ QR PromptPay + บัตร + **webhook** → ปลดล็อก/เติมเครดิตอัตโนมัติ
  - ⚠ พร้อมเพย์ QR ส่วนตัวล้วน **ไม่มี webhook** → ต้องผ่าน gateway ถึง auto-confirm
  - ต้องมี: ปลดล็อกหัวข้อ/ชุด, ระบบเครดิต, ใบเสร็จ/ประวัติ, refund, กัน double-charge, verify webhook signature
  - เก็บแค่ token/reference (PCI ให้ gateway) · ยืนยันเอกสาร+ค่าฟีปัจจุบันตอนสมัคร (ห้ามอิงเลขเก่า)
- **Booking (primary CTA):** Google Calendar (มี Calendar MCP) หรือ Cal.com embed
- **Lead capture (หัวใจ):** กรอกเช็คฟรีจบ + กดปรึกษา → เก็บ lead พร้อม context (goal/โรค/ระยะ/คะแนน/red-flag) → Notion/Sheet + แจ้งเตือนเฟี้ยว
- **Repo:** subfolder ใน repo `web` เดิม — แยก build/deploy (Next.js+backend คนละ stack กับ static site)

---

## 9. การตลาดกับ lead ฟรีที่ไม่จ่าย (Q user)
อย่ามองว่าต้องปิดการขายทุกคน — free-only ที่ active มีค่าในตัว:
- audience รีทาร์เก็ต + lookalike (ป้อนแอดให้แม่น) · สาย nurture (LINE OA/อีเมล content ตรง goal เขา)
- บอกต่อ + social proof · data รวม goal/ปัญหายอดฮิต → ชี้ content + pack ถัดไป
- นโยบาย: **เลี้ยงด้วยคุณค่า ไม่ตื๊อ** เก็บ goodwill

---

## 10. เป้าหมาย & ตัวชี้วัด
- **Primary:** จำนวน lead → จองปรึกษา/เคสโฮม + **อัตรา graduate 1.3 → 1.2** (retention)
- Secondary: คนเช็คฟรีจบ, free→consult rate, ยอดขายแอป/หัวข้อ (trust ladder), stats improvement ของคนไข้

---

## 11. Build Phases (กันบล็อก + ตามลำดับกลยุทธ์)

| Phase | ส่งมอบ | หมายเหตุ |
|---|---|---|
| **P0 — Merchant onboarding** (ขนาน) | สมัคร GBPrimePay/ChillPay บุคคลธรรมดา + เอกสาร | external dependency เริ่มทันที |
| **P1 — Engine + UX + Character sheet** | Next.js + JourneyPack loader + goal entry + flow เช็คฟรี + body chart+radar + อนิเมชัน | พิสูจน์ UX/ความรู้สึก status RPG |
| **P2 — Lead + Consult** | lead capture + ปุ่มปรึกษา/จอง + Notion/Sheet + แจ้งเตือน | หัวใจ conversion |
| **P3 — Payment (CORE)** | auth + GBPrimePay (sandbox→prod) + ปลดล็อก/เครดิต/ใบเสร็จ/refund | ต้องเสร็จก่อนยิงแอด |
| **P4 — Content: 1.3 รักษาโรค** | JourneyPack 5 heroes (free+red-flag+app plan+paid) ผ่าน checklist | ★ ประตูเข้า ทำก่อน |
| **P5 — Content: 1.2 สูงวัย + pt-assess merge** | wellness pack สูงวัย + เชื่อม pt-assess → character sheet + กลไก graduate 1.3→1.2 | ★ retention |
| **P6 — ยิงแอด** | แอปครบ (รวม payment) → ยิงแอด → วัด lead→เคสโฮม + graduate rate | 1.1 feeder ค่อยเติม |

> user ยืนยัน "ทำแอปให้เสร็จก่อนยิงแอด รวมระบบจ่ายเงิน" → P6 รอ P1-P5

---

## 12. ความเสี่ยง & การรับมือ

| ความเสี่ยง | รับมือ |
|---|---|
| เนื้อหาหลาย goal ใช้เวลานาน ชน รพ+ป.โท | JourneyPack เทมเพลตเดียว + AI ช่วยร่าง + ทำตาม priority ทีละ goal มี checklist |
| 1.1 แข่งดุ/ผูกกับหุ่นเฟี้ยว | จัดเป็น feeder priority ต่ำ ไม่เทแรงก่อน |
| 1.2 acquisition เย็นยาก | พึ่ง warm graduation 1.3→1.2 ไม่พึ่งแอดเย็น |
| ค่าฟี gateway กิน micro-sale | ขายชุด/เครดิต amortize |
| Merchant KYC ล่าช้า | เริ่ม P0 ทันที + dev sandbox คู่กัน |
| guardrail/ความรับผิดคลินิก | wording + red-flag + disclaimer + AI retrieval only |
| ข้อมูลคนไข้ (pt-assess merge) | de-identify plan ก่อนแตะข้อมูลจริง + PT owns clinical score |

---

## 13. Open Questions (ก่อน implementation plan)
1. ชื่อทางการแอป (working: "บ้านกายภาพ เช็คฟื้นฟู")
2. โดเมน — subdomain ของ baankaiyaphap-chonburi.com หรือใหม่?
3. รูปแบบ "ปรึกษา online" — โทร/วิดีโอ/แชต? ราคา?
4. แกนหกเหลี่ยม stat — ใช้ 6 แกนที่เสนอ (แรง/ทรงตัว/ยืดหยุ่น/ทนทาน/ฟังก์ชัน/สบาย) หรือปรับ?
5. ราคาจริงแต่ละขั้น (จ่ายแอป / คอร์สเฟี้ยว)
6. ลำดับโรคใน 1.3 (แนะนำ Stroke ก่อน — มี knowledge graph)

### Decisions (เคาะแล้ว)
- โครงสร้าง = goal-first · payment = core (GBPrimePay/ChillPay บุคคลธรรมดา) · repo = subfolder ใน web
- แกนกลยุทธ์ = 1.3 → 1.2 pipeline, 1.1 feeder (build/content ตามลำดับนี้)
- character sheet = body chart + หกเหลี่ยม, merge pt-assess, PT owns clinical score
- AI = retrieval/assembly เท่านั้น

---

## ภาคผนวก — Decisions log (brainstorm 2026-06-26/27)
- B2C ขายคนไข้/ญาติ · core job เช็คฟรี → เข้าใจ → ปรึกษา/เคสโฮม
- V1 disease-first → **V2 goal-first** + value ladder 3 ขั้น
- payment core (user: "ต้องทำเลย ไม่ใช่แผนสำรอง") · merchant = บุคคลธรรมดา → GBPrimePay/ChillPay
- segment priority 1.3→1.2 (LTV pipeline), 1.1 feeder · merge pt-assess + character sheet RPG
