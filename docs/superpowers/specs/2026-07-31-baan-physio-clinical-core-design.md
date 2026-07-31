# บ้านกายภาพ ชลบุรี Clinical Core — Hermes-first Single-clinician Care App

- วันที่: 2026-07-31
- เจ้าของระบบ: รัชธรรม เชื้อแถว — บ้านกายภาพ ชลบุรี
- สถานะ: User-approved design; รอการตรวจสเปกฉบับเขียนก่อนจัดทำ implementation plan
- Working product name: Baan Physio Care
- Production URL: `care.baankaiyaphap-chonburi.com`
- Repository: private repository `baan-physio-care`

## 1. เป้าหมาย

สร้างระบบหลังบ้านสำหรับนักกายภาพบำบัดคนเดียว เพื่อดูแลคนไข้ประจำระยะยาว โดยมี Clinical Core เป็นแหล่งข้อมูลจริงเพียงแห่งเดียว และให้ Hermes ทำงานผ่าน Telegram แทนเจ้าของระบบได้เกือบทั้งหมดภายใต้รั้วการอนุมัติที่ตรวจสอบย้อนหลังได้

ระบบต้องรองรับสองช่องทางทำงาน:

1. เจ้าของส่งข้อมูลหรือคำสั่งให้ Hermes ใน Telegram เหมาะกับการเยี่ยมบ้านและงานที่กรอกสั้น
2. เจ้าของกรอกแบบฟอร์มในแอปโดยตรง เหมาะกับแบบประเมินหรือข้อมูลที่มีหลายรายการ

ประสบการณ์หลักไม่เริ่มจากหน้ารวมรายชื่อคนไข้ เจ้าของเข้าสู่คนไข้และ visit ที่ถูกต้องผ่าน deep link ใน Google Calendar เป็นหลัก แล้วใช้มุมมองมือถือ 3 แท็บควบคู่กัน:

1. บันทึกคนไข้
2. หน้าคนไข้
3. Holistic Profile

## 2. ขอบเขตและหลักการ

### 2.1 ผู้ใช้งานรุ่นแรก

- เจ้าของระบบและนักกายภาพบำบัดมีเพียงคนเดียว
- Hermes เป็น service identity แยกจากเจ้าของ เพื่อให้ทุกการกระทำระบุ actor ได้
- คนไข้หรือญาติเข้าหน้า read-only เดียวกันผ่าน private link และ PIN
- ยังไม่มีบัญชีพนักงาน นักกายภาพหลายคน หรือระบบกำหนดสิทธิ์ภายในทีม

### 2.2 บทบาทของระบบเดิม

- Care Navigator ใช้คัดกรอง เก็บ Lead และช่วยให้ผู้สนใจตัดสินใจเท่านั้น
- Care Navigator ไม่ใช่เวชระเบียนและไม่เป็นฐานข้อมูลติดตามการรักษา
- เมื่อลูกค้าเปลี่ยนเป็นคนไข้ ส่งต่อเฉพาะข้อมูลที่จำเป็นพร้อม `source_lead_id`
- Clinical Core เป็น source of truth สำหรับการประเมิน ปัญหา การรักษา ความก้าวหน้า SOAP EBP โปรแกรมฝึก นัดหมาย และข้อมูลสุขภาพ

### 2.3 หลักการทางคลินิกและ AI

- AI ช่วยจัดโครงสร้าง ค้นคืน สรุป เปรียบเทียบ และเสนอทางเลือก แต่ไม่แทนการตัดสินใจของนักกายภาพ
- Hermes ห้ามเปลี่ยน confirmed clinical record แบบเงียบ และห้ามเผยแพร่ clinical interpretation ที่ยังไม่อนุมัติ
- EBP ใหม่เกิดเมื่อเจ้าของสั่งเท่านั้น ไม่สร้าง deep research ตามกำหนดเวลาโดยอัตโนมัติ
- ก่อนเสนอปรับโปรแกรม Hermes ต้องอ่านปัญหาปัจจุบัน outcome measures ข้อควรระวัง safety flags โปรแกรมปัจจุบัน บริบท งบประมาณ และ EBP ที่อนุมัติและยังเกี่ยวข้อง
- หากไม่มี EBP ที่เกี่ยวข้อง Hermes ต้องแจ้งว่าไม่พบหลักฐานที่อนุมัติไว้ เจ้าของเป็นผู้ตัดสินใจว่าจะจัดทำ EBP ใหม่หรือวางแผนจากข้อมูลที่มี
- ข้อเสนอของ Hermes ต้องแยกข้อมูลจริง การอนุมาน ข้อมูลที่ขาด และระดับความมั่นใจ

## 3. สถาปัตยกรรม

### 3.1 องค์ประกอบ

1. **Mobile-first Web App**
   - ให้บริการที่ `care.baankaiyaphap-chonburi.com`
   - Cloudflare Pages Free สำหรับ frontend
   - มี Owner View และ Patient View แต่ใช้ขอบเขตสิทธิ์คนละแบบ

2. **Clinical Gateway**
   - API boundary แยกจาก Hermes
   - ใช้ Cloudflare Worker Free เป็นค่าเริ่มต้นของรุ่นทดลอง
   - ตรวจสิทธิ์ ตรวจ schema เข้ารหัส/ถอดรหัส บันทึก audit และบังคับ approval rules
   - ถือ operational encryption key และฐานสิทธิ์ที่จำเป็น
   - ไม่เปิด database service key หรือ encryption key ให้ Hermes หรือ browser

3. **Clinical Core**
   - Supabase Free Postgres เป็นฐานข้อมูลกลาง
   - ใช้ Row Level Security และปิด direct anonymous access ต่อข้อมูลคลินิก
   - ข้อมูลทุก record ผูกกับ UUID ภายใน ไม่ใช้ชื่อหรือเบอร์เป็น primary identifier

4. **Hermes Adapter**
   - รับคำสั่งจาก Telegram แล้วเรียก Clinical Gateway ด้วย service identity แบบจำกัดขอบเขต
   - ทำ Draft อ่านข้อมูลที่ได้รับอนุญาต และส่ง approval request ให้เจ้าของ
   - ไม่มีสิทธิ์เข้าฐานข้อมูลโดยตรง

5. **Google Calendar Projection**
   - Appointment ถูกสร้างใน Clinical Core ก่อน แล้วจึง sync ไปปฏิทิน Google ส่วนตัวของเจ้าของ
   - Calendar เป็น projection ไม่ใช่ source of truth

6. **Patient Publication**
   - ส่งเฉพาะข้อมูลที่ผ่านกติกาการเผยแพร่ไปยัง read model ของคนไข้
   - Patient View ไม่อ่าน SOAP, raw evidence หรือ internal clinical notes โดยตรง

7. **Backup and Knowledge Export**
   - สำรองฐานข้อมูลเป็น encrypted export ไป Google Drive ส่วนตัวและคอมพิวเตอร์
   - Vault/private GitHub รับเฉพาะความรู้ที่ผ่าน Privacy Filter และการอนุมัติจนไม่สามารถระบุตัวคนไข้

### 3.2 ขอบเขตความไว้วางใจ

- Browser, Telegram, Hermes, Calendar และ Patient View เป็นช่องทางภายนอก Clinical Core
- ทุก write ต้องผ่าน Clinical Gateway
- การอนุมัติใน Telegram ต้องอ้างถึง immutable draft ID และ digest ของเนื้อหาที่กำลังอนุมัติ
- หาก Draft เปลี่ยนหลังส่งขออนุมัติ การอนุมัติเดิมใช้ไม่ได้
- คำสั่งที่มีความเสี่ยงสูงใช้ one-time approval intent และ Google reauthentication

## 4. สถานะข้อมูลและ data flow

### 4.1 สถานะหลัก

1. **Raw Evidence** — ข้อความหรือ transcript ต้นทางที่ยังไม่ตีความ
2. **Draft** — ข้อมูลที่ Hermes หรือแอปจัดโครงสร้างแล้วแต่ยังไม่เป็น clinical record
3. **Confirmed Record** — ข้อมูลที่เจ้าของตรวจและอนุมัติแล้ว
4. **Revision** — การเปลี่ยนแปลง record ที่ยืนยันแล้ว โดยเก็บค่าเดิมและเหตุผล
5. **Patient Publication** — ชุดข้อมูลที่อนุญาตให้ Patient View อ่าน
6. **Archived** — ประวัติที่ไม่ใช้ในหน้าปัจจุบันแต่ยังต้องเก็บ
7. **Deleted/Anonymized** — ข้อมูลที่ลบหรือแปลงจนไม่เชื่อมกลับไปยังบุคคลได้ตามนโยบาย

### 4.2 กระแสข้อมูลมาตรฐาน

`Raw Evidence → Hermes Draft → Owner Approval → Confirmed Record → Patient Publication`

- ข้อมูลจากแบบฟอร์มในแอปใช้กระแสเดียวกัน แต่เมื่อเจ้าของเป็นผู้กรอกและกดยืนยัน สามารถรวม Draft และ Approval เป็นการกระทำเดียวที่ยังคง audit ได้
- Confirmed Record แก้ด้วย revision เท่านั้น
- การอนุมัติบันทึก clinical record และการอนุมัติเผยแพร่ให้คนไข้เป็นคนละสิทธิ์
- ข้อยกเว้นคือข้อมูลสุขภาพประเภทที่กำหนดในหัวข้อ 8.4 ซึ่งเผยแพร่อัตโนมัติเมื่อยืนยันแล้วตามตัวเลือก A ที่เจ้าของอนุมัติ

### 4.3 เสียงและ OCR

- Hermes รับเสียงได้ แต่ไฟล์เสียงเป็น temporary input เท่านั้น
- เมื่อถอดเสียงสำเร็จและส่ง Draft แล้ว ให้ลบไฟล์เสียง
- หากใช้รูปฉลากยา ผลตรวจ หรือใบนัดเพื่อ OCR รูปเป็น temporary input เช่นกัน
- เจ้าของต้องตรวจข้อความที่ OCR ได้ก่อนยืนยัน
- ลบภาพหลังสร้าง Draft ไม่เก็บภาพหรือ PDF ใน Clinical Core

## 5. แบบจำลองข้อมูลเชิงแนวคิด

เอนทิตีหลักของ MVP:

- `Actor` — owner, Hermes service, patient-session
- `Patient` — UUID, สถานะ active/archive, demographics ที่จำเป็น
- `PatientContact` — เบอร์หลายหมายเลข ผู้ติดต่อหลัก และความสัมพันธ์
- `PatientLocation` — สถานที่หลายแห่ง ป้ายกำกับ และตำแหน่งที่ใช้เดินทาง
- `ConsentRecord` — เวอร์ชัน notice, เวลา, patient/caregiver role, สถานะ
- `LeadRegistryEntry` — ข้อมูลขั้นต่ำของผู้เคยรับประเมินฟรี แยกจาก clinical record
- `Visit` — วันที่ เวลา สถานที่ appointment link และสถานะ
- `RawEvidence` และ `Draft` — แหล่งข้อมูลและข้อมูลที่รออนุมัติ
- `ClinicalRevision` — ค่าเดิม ค่าใหม่ actor เวลา เหตุผล แหล่งข้อมูล และผู้อนุมัติ
- `Problem` — ปัญหา เป้าหมาย สถานะ active/improved/resolved/monitoring
- `MeasureDefinition` — เครื่องมือ หน่วย ทิศทาง เกณฑ์ เป้าหมาย และแหล่งอ้างอิง
- `MeasureResult` และ `MeasureItemResult` — คะแนนรวมและคะแนนรายข้อของแต่ละ visit
- `SOAPNote` — SOAP หนึ่งชุดต่อ visit พร้อม revisions
- `EBPReview` — คำถาม แหล่งอ้างอิง appraisal grade/recommendation ความเกี่ยวข้อง และสถานะ
- `TreatmentTechnique` — เทคนิคที่ใช้และ patient-facing explanation/link
- `Exercise` — ท่า สื่อ คำแนะนำ ข้อควรระวัง และ dosage
- `ProgramRevision` — โปรแกรมปัจจุบันและประวัติ
- `WeeklySchedule` — ตาราง 7 วันที่สร้างจากโปรแกรมที่อนุมัติ
- `HealthItem` — medication, allergy/safety, laboratory observation, doctor appointment
- `Appointment` — นัดใน Core และสถานะ Calendar sync
- `PatientPublication` — snapshot ที่เผยแพร่แล้ว
- `HolisticProfileSnapshot` — ค่าที่คำนวณได้จาก raw measures ณ เวลาใดเวลาหนึ่ง
- `AuditEvent` — actor, action, target, time, source, result และ correlation ID
- `AccessGrant`/`PatientSession` — private token, hashed PIN, device session และ revocation
- `BackupManifest` — export time, checksum, key version และ restore-test status

ทุกข้อมูลที่ Hermes สร้างต้องมี provenance อย่างน้อย: source message/visit, actor, timestamp, confidence และ approval status

## 6. Owner authentication และ Hermes authority

### 6.1 เจ้าของ

- ใช้ personal Gmail ผ่าน Google Sign-In
- allowlist เฉพาะ Google account ของเจ้าของ ไม่เปิดให้ Google account อื่นสมัครเข้า Owner View
- เจ้าของต้องเปิด Google 2-Step Verification เป็นเงื่อนไขก่อนใช้ข้อมูลจริง เนื่องจากแอปไม่สามารถบังคับนโยบาย 2FA ของ personal Gmail แบบเดียวกับ Google Workspace Admin ได้
- อุปกรณ์ที่เชื่อถือได้จำ session เพื่อไม่ต้อง login ทุกครั้ง
- session ต้องเพิกถอนได้จาก Emergency Lock

### 6.2 Hermes

- มี service identity ของตนเอง
- ทำ routine work ได้เต็มรูปแบบผ่าน endpoint ที่กำหนด เช่น อ่านบริบท สร้าง Draft สร้างนัดที่ชัดเจน และเตรียม publication
- การทำงานต้องเกิดภายใน patient/visit scope ที่ระบุ
- ห้ามข้าม approval gate ด้วยข้อความภาษาธรรมชาติ

### 6.3 งานเสี่ยงสูง

ตัวอย่าง: ลบคนไข้ ส่งออกข้อมูลที่ระบุตัวบุคคล เปลี่ยนสิทธิ์ ปลดล็อกระบบ หมุน recovery key หรือ bulk publish

- Hermes ส่ง one-time Google confirmation link
- ลิงก์มีเวลาให้กดประมาณ 15 นาที
- เมื่อกดแล้วใช้ได้เฉพาะงานที่ระบุหนึ่งงาน ไม่ใช่สิทธิ์พิเศษตลอด 15 นาที
- routine approval ใน Telegram ไม่ต้อง login Google ซ้ำ

## 7. Appointment และ Google Calendar

### 7.1 การสร้างนัด

Hermes สร้างนัดทันทีเมื่อ:

- match คนไข้ได้เพียงคนเดียว
- วัน เวลา และสถานที่ครบ
- ไม่มีข้อมูลขัดแย้งหรือ conflict ที่ต้องตัดสินใจ

หากข้อมูลไม่ครบ Hermes ถามเฉพาะข้อมูลที่ขาด และไม่เดาคนไข้ สถานที่ หรือเวลา

### 7.2 ข้อมูลใน Calendar

- ใช้ปฏิทิน Google ส่วนตัวที่เจ้าของใช้อยู่
- ชื่อ event เป็นกลางและไม่มีโรค การวินิจฉัย หรือ SOAP
- `location` เป็นสถานที่จริงของนัดครั้งนั้นหนึ่งแห่ง
- description มี Google Maps link, เบอร์โทรที่บันทึกไว้ทั้งหมด, owner deep link และข้อมูลการเดินทางที่จำเป็น
- owner deep link ต้องบังคับ login และอ้าง appointment/patient ด้วย opaque ID
- deep link เลือกคนไข้และ visit date จากนัดให้อัตโนมัติ
- ไม่ใส่ Patient View link ที่เปิดข้อมูลคนไข้ได้ลง Calendar โดยไม่จำเป็น

### 7.3 หลายเบอร์และหลายสถานที่

- เก็บหลายเบอร์และหลายสถานที่ต่อคนไข้ได้
- Hermes รายงานทั้งหมดเมื่อเจ้าของถาม
- ทุก appointment ต้องเลือก actual location หนึ่งแห่ง
- การเปลี่ยนสถานที่ในนัดไม่แก้ค่า default โดยอัตโนมัติ เว้นแต่เจ้าของสั่ง

### 7.4 เวลาเดินทาง

- คำนวณคร่าว ๆ แบบไม่เสียเงินจากเวลาเดินทางที่บันทึกไว้และ buffer
- origin ของแต่ละเคสคือสถานที่นัดก่อนหน้าในวันเดียวกัน
- นัดแรกของวันใช้ default starting location ที่เจ้าของตั้งค่าไว้
- แจ้งเตือนในเวลาที่ควรเริ่มออกเดินทาง
- เจ้าของแก้เวลาเดินทางและ buffer ได้
- MVP ไม่ใช้ paid live traffic API และไม่รับประกันเวลาถึง

### 7.5 Sync behavior

`Telegram → Hermes validation → Appointment in Clinical Core → travel estimate → Google Calendar sync`

- หาก Calendar sync ล้มเหลว นัดยังคงอยู่ใน Core และมีสถานะ `sync_failed`
- ระบบ retry แบบ idempotent เพื่อไม่สร้าง event ซ้ำ
- การแก้ event จาก Calendar ต้องถูกตรวจพบและ reconcile กลับ Core โดยไม่เขียนทับข้อมูลคลินิก

## 8. Mobile UI

### 8.1 Navigation

- Mobile-first และใช้งานได้บนหน้าจอคอมพิวเตอร์
- เปิดผ่าน Calendar deep link เป็นเส้นทางหลัก
- มี patient search สำรองในเมนู แต่ไม่มี patient-list dashboard เป็นหน้าแรก
- หัวหน้าจอแสดงชื่อที่เจ้าของใช้ระบุตัวคนไข้ วัน visit และสถานะการบันทึก
- 3 แท็บหลัก: บันทึกคนไข้, หน้าคนไข้, Holistic Profile

### 8.2 แท็บ 1 — บันทึกคนไข้

แสดงเฉพาะข้อมูลที่ใช้ทบทวนและกรอกหน้างาน:

1. **Active Problems**
   - เรียงเป็นข้อ
   - ปัญหาหนึ่งมี outcome measures ได้หลายเครื่องมือ
   - แต่ละเครื่องมือมี progress bar ของตนเอง
   - แสดงค่าจริง หน่วย วันที่วัด เป้าหมาย และเครื่องมือเสมอ
   - กดเครื่องมือเพื่อแก้คะแนนรวม/รายข้อ โดย visit date ถูกเลือกจาก Calendar
   - หน้ากรอกแสดงค่าครั้งก่อนเป็น guideline

2. **SOAP**
   - มีบล็อกเดียว
   - ค่าเริ่มต้นคือ visit ที่เปิดอยู่หรือ visit ล่าสุด
   - เปลี่ยนวันที่เพื่อดู SOAP เก่าได้ไกลถึงต้นการรักษา
   - ไม่เรียง SOAP ทุก visit ต่อกันในหน้าเดียว

3. **EBP**
   - แสดงหัวข้อที่อนุมัติและเกี่ยวข้องกับปัญหาปัจจุบันแบบสรุป
   - กดเพื่ออ่านรายละเอียดฉบับเต็ม
   - เก็บคำถามค้นคว้า วิธีค้น แหล่งอ้างอิง appraisal Grade of Recommendation เมื่อเหมาะสม การประยุกต์กับคนไข้ และวันที่ทบทวน
   - EBP ที่เลิกใช้หรือถูกแทนที่อยู่ใน history ไม่รบกวนหน้าปัจจุบัน

4. **Supporting Clinical Information**
   - ส่วนพับเก็บได้สำหรับยา การแพ้/ข้อควรระวัง ผลตรวจ และนัดแพทย์
   - แสดงข้อมูลข้อความแบบมีโครงสร้าง ไม่แสดงเอกสารภาพหรือ PDF

### 8.3 Outcome measure และ progress

Measure definition ต้องกำหนด:

- หน่วยและทิศทางว่าเพิ่มขึ้นหรือลดลงจึงดี
- fixed maximum, normative/clinical target หรือ trend-only
- demographic/condition applicability
- แหล่งอ้างอิง เวอร์ชัน และวันที่ทบทวนเกณฑ์
- minimal detectable/clinically important change หากมีหลักฐานรองรับ

การแสดงผล:

- เครื่องมือที่มีคะแนนเต็มใช้ official maximum
- เครื่องมือที่ไม่มีคะแนนเต็มใช้ normative หรือ clinical target ตามอายุ เพศ BMI และกลุ่มโรค เฉพาะเมื่อมีแหล่งอ้างอิงที่เหมาะกับคนไข้
- หากไม่มีเกณฑ์ที่น่าเชื่อถือ แสดง raw trend/change และห้ามสร้างเปอร์เซ็นต์สมมติ
- progress bar จำกัดภาพไว้ที่ 100% แต่ยังแสดงค่าจริงเมื่อทำได้เกินเป้าหมาย
- เมื่อ measure ผ่านเกณฑ์ ระบบแสดง `target achieved`
- Problem มี required measures และ success rule ที่เจ้าของกำหนด เมื่อครบเกณฑ์ระบบแสดง `ถึงเกณฑ์ดีขึ้น`; การปิดเป็น resolved ยังต้องให้เจ้าของยืนยัน

### 8.4 แท็บ 2 — หน้าคนไข้

Patient View เป็น read-only และแสดง:

- คำอธิบายโรค/ปัญหาของคนไข้
- เทคนิคการรักษาที่ใช้อยู่
- ลิงก์บทความในเว็บไซต์โดยเก็บ URL/slug ไม่คัดลอกบทความเข้า Clinical Core
- โปรแกรมฝึกปัจจุบัน
- dosage/FITT ต่อท่าในภาษาธรรมชาติ เช่น จำนวนครั้ง เซต ความหนัก ความถี่ และเวลาพัก โดยไม่ทำกล่อง F-I-T-T แยก
- ตารางออกกำลังกายรวม 7 วันที่จัดจากโปรแกรมปัจจุบันตามหลักที่เจ้าของกำหนดและหลัก ACSM ที่เหมาะสม
- หัวข้อ “หลักฐานงานวิจัยอ้างอิง” ในภาษาที่คนไข้เข้าใจได้
- generated images และวิดีโอ YouTube ที่เจ้าของถ่ายตนเองผ่าน URL

**Publication option A สำหรับ Health Item:**

- Medication, allergy/safety, laboratory observation และ doctor appointment ที่เจ้าของยืนยันแล้วจะแสดงใน Patient View อัตโนมัติ
- แสดง current/latest ก่อน และเปิดดูค่าก่อนหน้าได้ในรายละเอียดเมื่อเหมาะสม
- Draft, OCR ที่ยังไม่ยืนยัน, SOAP, full EBP appraisal และ internal notes ไม่แสดง
- AI interpretation ของผลตรวจไม่แสดง เว้นแต่เจ้าของตรวจและยืนยันเป็น patient-facing explanation แล้ว

โปรแกรมคนไข้เผยแพร่เป็น atomic bundle ประกอบด้วยเทคนิค โปรแกรม ตาราง 7 วัน บทความ และ evidence summary หากส่วนใดล้มเหลวให้คง bundle รุ่นเดิมไว้

### 8.5 Patient access

- private URL ใช้ random opaque token ไม่มีชื่อ เบอร์ หรือ patient ID
- เก็บ token และ PIN แบบ hash
- คนไข้ตั้ง PIN เอง ระบบเตือนเมื่ออ่อนแต่ไม่สร้างกฎซับซ้อนจนใช้งานยาก
- rate limit การลอง PIN และล็อกชั่วคราวเมื่อผิดซ้ำ
- อุปกรณ์จำ session จนกดออกจากระบบ โดยใช้ secure revocable session
- เจ้าของเพิกถอน link หรือทุก session ได้
- คนไข้สามารถให้ link/PIN แก่ญาติได้ตามความตั้งใจ แต่ระบบชี้แจงว่าผู้มี link และ PIN จะเห็นข้อมูลเดียวกัน

### 8.6 Consent

- ครั้งแรกก่อนเห็นข้อมูล ต้องแสดง privacy notice และรายละเอียดการใช้งานตามกฎหมายที่เกี่ยวข้อง
- ผู้ใช้เลือกบทบาท `คนไข้` หรือ `ญาติ/ผู้ดูแล` แล้วกดยอมรับ
- บันทึก notice version, role, timestamp และ access grant
- consent ด้านการตลาดแยกจากการใช้ Patient View
- ข้อความกฎหมายต้องผ่านผู้เชี่ยวชาญก่อนใช้กับข้อมูลจริง เพราะเจ้าของดำเนินงานในฐานะนักกายภาพอิสระ ไม่ใช่โรงพยาบาลหรือคลินิกที่จดทะเบียน

### 8.7 แท็บ 3 — Holistic Profile

ใช้ “บ้านกายภาพ ชลบุรี Model” ซึ่งต่อยอดจาก ICF และ frailty/recovery reserve โดยมีมิติคงที่:

1. Body function and symptoms
2. Activity
3. Participation
4. Frailty and recovery reserve
5. Environment and caregiver
6. Resources and budget
7. Goals and readiness

หลักการแสดงผล:

- ค่าเริ่มต้นใช้ข้อมูลตั้งแต่เริ่มรักษา
- เลือกดู 3 เดือน, 6 เดือน หรือ 1 ปีได้
- overview wheel/radar เป็น visual index เท่านั้น
- กดแต่ละมิติเพื่อดู domain trend, raw measures, visit และเหตุผลที่ค่าถูกจัดเข้า domain
- raw measurement เป็น source of truth; holistic snapshots เป็น derived data ที่คำนวณใหม่ได้
- ไม่มีคะแนนสุขภาพรวมเพียงตัวเดียว
- budget เป็น planning constraint ไม่ใช่ health deficit
- ปัญหาที่ resolved, EBP เก่า และ SOAP เก่ายังคงอยู่ใน timeline/history แต่ไม่รบกวน current view

Hermes เสนอ “ประเด็นที่ควรเน้นครั้งถัดไป” ได้ไม่เกิน 3 ข้อ โดยแต่ละข้อมี:

- เหตุผล
- ข้อมูลสนับสนุน
- ข้อมูลที่ยังขาด
- ความไม่แน่นอน/ระดับความมั่นใจ
- ลิงก์กลับไปยัง problem, measure, SOAP หรือ EBP ที่เกี่ยวข้อง

เจ้าของแก้ อนุมัติ หรือปฏิเสธข้อเสนอได้ ระบบไม่แสดงข้อเสนอเป็นคำพยากรณ์ที่แน่นอน

## 9. EBP lifecycle

- เจ้าของเป็นผู้สั่งเริ่ม EBP
- งานง่ายอาจให้ Hermes ช่วยรวบรวม งานยากอาจใช้ ChatGPT หรือ Codex
- ผลลัพธ์จากเครื่องมือภายนอกกลับเข้าระบบเป็น Draft
- เก็บ provenance: query/PICO, วันที่ค้น, databases/sources, citations, appraisal, recommendation grade เมื่อเกี่ยวข้อง, applicability, owner decision และ review date
- สถานะ: draft, approved-active, superseded, archived
- Hermes อ่านเฉพาะ approved-active EBP เพื่อช่วยวางแผน
- เมื่อ EBP ถูกแทนที่ ระบบเก็บของเดิมเพื่ออธิบายว่าทำไมแผนในอดีตจึงต่างจากปัจจุบัน

## 10. Safety controls

### 10.1 Safety Flags

- Safety Flag ระดับสูงล็อกเฉพาะการเปลี่ยนและเผยแพร่โปรแกรมที่ได้รับผล
- SOAP, นัดหมาย และการอ่านข้อมูลยังทำงานได้
- เจ้าของต้องระบุเหตุผลเมื่อ clear flag
- การ clear เป็น revision/audit event

### 10.2 Emergency Lock

1. **Account Lock**
   - revoke owner sessions
   - revoke Hermes access
   - cancel pending jobs/approval intents
   - Patient View ยังเปิดได้

2. **Full System Lock**
   - ทำทุกอย่างของ Account Lock
   - ปิด Patient View ทุกคน

### 10.3 Audit

- audit log เป็น append-only ในระดับแอป
- ทุก write มี actor, action, target, before/after digest, time, source, result และ correlation ID
- ห้ามใส่ secret, PIN, encryption key หรือ clinical text เต็มใน infrastructure log

## 11. การจัดเก็บและความปลอดภัย

### 11.1 การปกป้องข้อมูล

- TLS ทุกเส้นทาง
- Supabase encryption at rest ตามบริการ และ application-level encryption สำหรับ direct identifiers/ข้อมูลที่กำหนด
- ใช้ keyed hash ของข้อมูลที่ต้อง match เช่น เบอร์โทร normalized โดยไม่ต้องเปิด plaintext ในการค้นหาเบื้องต้น
- secrets แยกตาม environment และไม่เก็บใน repository
- RLS และ Gateway authorization ปฏิเสธแบบ fail-closed
- Patient View อ่านจาก patient-safe projection เท่านั้น

### 11.2 ข้อห้ามด้านพื้นที่เก็บ

- ห้ามใช้ browser `localStorage`, Notion, Google Calendar, Vault หรือ GitHub เป็น clinical record
- ห้ามเก็บชื่อ เบอร์ ที่อยู่ วันนัด patient ID SOAP หรือ credentials ใน Vault/GitHub
- Calendar เก็บเฉพาะข้อมูลปฏิบัติงานที่เจ้าของอนุมัติ และไม่มี diagnosis ในชื่อ event
- MVP ไม่เก็บภาพ วิดีโอ เสียง หรือ PDF ของคนไข้
- ภาพ/วิดีโอคนไข้ที่ถ่ายไว้ในอุปกรณ์ส่วนตัวยังคงเป็นข้อมูลอ่อนไหวและอยู่นอกขอบเขตระบบนี้ เจ้าของต้องป้องกันอุปกรณ์และลบเมื่อหมดความจำเป็น

## 12. วงจรข้อมูล

### 12.1 คนไข้ประจำ

- เก็บ clinical record 5 ปีนับจาก visit ล่าสุด
- เมื่อจบการรักษาเปลี่ยนเป็น read-only archive และเพิกถอน Patient View ตามการตัดสินใจของเจ้าของ
- เมื่อครบ retention ให้ดำเนินการลบตามนโยบายและข้อกำหนดทางกฎหมายที่ได้รับการตรวจแล้ว

### 12.2 ประเมินฟรี

หากซื้อบริการ:

- เปลี่ยนข้อมูลที่อนุมัติเป็น active patient record
- เริ่ม retention จาก clinical visit ล่าสุด

หากไม่ซื้อ:

- เจ้าของยืนยันผลการประเมินและการไม่ซื้อ
- ลบ identifiable clinical data จาก Clinical Core
- ไม่ให้ประเมินฟรีซ้ำ; หากกลับมาใช้บริการ ให้เริ่มการประเมินแบบคิดค่าบริการและสร้าง clinical record ใหม่
- เก็บ Lead Registry ขั้นต่ำ เช่น ชื่อ เบอร์ และสถานที่ เพื่อระบุว่าเคยประเมินฟรี โดยแยกจากข้อมูลสุขภาพและมี access control
- สถิติการตลาดต้องเป็น anonymous aggregates หรือ unlinkable records ที่ย้อนกลับไปหาคนไม่ได้

### 12.3 การลบและ backup

- ข้อมูลที่ลบจากระบบหลักอาจยังอยู่ใน encrypted backup จนชุดสำรองหมดอายุประมาณ 90 วัน
- backup restore ต้องใช้ deletion manifest/tombstone เพื่อไม่ทำให้ข้อมูลที่เคยลบกลับมา active
- นโยบายและ privacy notice ต้องอธิบายช่วง backup aging นี้

## 13. Backup และ recovery

- 14 daily backups
- 8 weekly backups
- 3 monthly backups
- encrypted export เก็บใน Google Drive ส่วนตัวและคอมพิวเตอร์
- ใช้ authenticated encryption และ checksum/manifest เพื่อตรวจความครบถ้วน
- operational key อยู่ใน Clinical Gateway
- recovery code อยู่ใน password manager และกระดาษปิดผนึก
- ห้ามเก็บ recovery code ใน Drive, GitHub, Telegram หรือฐานข้อมูลเดียวกับข้อมูล
- ทดสอบ restore ทุก 3 เดือนและบันทึกผล
- ก่อนใช้ข้อมูลจริงต้องผ่าน restore จาก export อย่างน้อยหนึ่งครั้ง
- Supabase Free อาจ pause และไม่มี automatic backup ที่เพียงพอสำหรับ requirement นี้ จึงต้องมี export/restore ของระบบเอง

## 14. Error handling

### 14.1 Network และ form

- ไม่มี offline editing queue ใน MVP
- ปุ่มบันทึกสำเร็จเมื่อ server ยืนยันเท่านั้น
- หากเน็ตขาด แสดง `ยังไม่บันทึก` อย่างชัดเจน
- รักษาข้อความที่พิมพ์ไว้ในหน่วยความจำของหน้าจอและให้คัดลอกได้ แต่ไม่เก็บ PHI ใน localStorage
- ห้ามแสดงสถานะ sync สำเร็จจาก optimistic UI เพียงอย่างเดียว

### 14.2 Hermes

- patient match ไม่ชัดเจน: หยุดและถาม
- ข้อมูลขัดแย้ง: สร้าง Draft พร้อม conflict marker
- confidence ต่ำ: แสดงข้อมูลที่ต้องตรวจ ไม่เติมเอง
- approval หมดอายุหรือ digest เปลี่ยน: ขออนุมัติใหม่

### 14.3 Publication

- atomic bundle สำเร็จทั้งหมดหรือคง bundle เดิม
- Health Item ที่ confirmed ใช้ patient-safe projection อัตโนมัติ แต่หาก projection ล้มเหลวให้ขึ้น retry state และห้ามแสดงข้อมูลครึ่งรายการ
- revocation ต้องมีผลทันทีที่ Gateway และ session layer

### 14.4 Calendar

- Core appointment ไม่สูญหายเมื่อ Google ล้มเหลว
- retry แบบ idempotent
- แสดง sync status และ last error ที่เจ้าของเข้าใจได้
- หาก event ถูกลบจาก Calendar ห้ามลบ clinical appointment โดยอัตโนมัติ

## 15. Free pilot stack และข้อจำกัด

- Cloudflare Pages/Workers Free
- Supabase Free
- Google Calendar และ Google Drive ในบัญชีส่วนตัว
- private GitHub repository สำหรับ code/schema/synthetic fixtures เท่านั้น
- subdomain `care.baankaiyaphap-chonburi.com` ใช้โดเมนเดิม จึงไม่ต้องซื้อโดเมนใหม่
- ต้องตรวจ quota และเงื่อนไขบริการอีกครั้งในวัน implementation/deployment
- หาก free tier ไม่สามารถผ่าน security, backup หรือ availability gate ห้ามลดรั้วความปลอดภัยเพื่อให้ใช้ฟรี ให้หยุด pilot หรือขออนุมัติงบประมาณก่อน

## 16. MVP acceptance tests

### 16.1 Clinical workflow

1. Hermes สร้าง Draft จาก Telegram ได้
2. Hermes แก้ Confirmed Record โดยไม่มี approval ไม่ได้
3. การแก้ record สร้าง revision พร้อม provenance
4. Owner form บันทึก outcome item และเห็นค่าเดิมของ visit ก่อนหน้า
5. measure target/fixed maximum/trend-only แสดงถูกตาม definition
6. SOAP date selector เปิดประวัติตั้งแต่เริ่มรักษาได้
7. EBP ใหม่ไม่ถูกสร้างจนเจ้าของสั่ง
8. Hermes โหลด approved-active EBP ก่อนเสนอ program change และรายงานเมื่อไม่มี EBP

### 16.2 Patient isolation

1. Patient A เปิด Patient B ไม่ได้
2. random URL และ hashed PIN ทำงาน พร้อม rate limit
3. session จำอุปกรณ์จน logout และ revoke ได้
4. Draft, SOAP และ internal EBP ไม่รั่วไป Patient View
5. confirmed Health Items แสดงอัตโนมัติตาม option A
6. program publication เป็น atomic bundle

### 16.3 Calendar

1. Hermes สร้างนัดทันทีเฉพาะเมื่อข้อมูลครบและ patient match เดียว
2. event มี actual location, Maps link, เบอร์ทั้งหมด, owner deep link และ visit date ที่ถูกต้อง
3. event title ไม่มี diagnosis
4. owner deep link เลือก patient/visit date อัตโนมัติหลัง login
5. sync retry ไม่สร้าง event ซ้ำ
6. route origin ใช้นัดก่อนหน้าและนัดแรกใช้ default starting location

### 16.4 Security และ recovery

1. browser/Hermes เข้าฐานข้อมูลโดยตรงไม่ได้
2. high-risk action ต้องใช้ single-job Google confirmation
3. Emergency Account Lock และ Full System Lock ทำงานต่างกันตามสเปก
4. Patient link revocation มีผลทันที
5. backup decrypt, checksum และ full restore สำเร็จ
6. restore ไม่ทำให้ deleted free-assessment data กลับมา active
7. logs ไม่มี secrets/PIN/clinical payload เต็ม

### 16.5 Data lifecycle

1. free assessment ที่ไม่ซื้อถูกลบ clinical identifiers หลัง owner confirmation
2. Lead Registry ไม่มี clinical details
3. marketing dataset ไม่เชื่อมกลับคนได้
4. retention/archive state และ Patient View revocation ทำงาน

## 17. ลำดับการเปิดใช้

1. พัฒนาด้วย synthetic data เท่านั้น
2. ผ่าน unit, integration, authorization, publication, Calendar และ backup/restore tests
3. ตรวจ privacy notice, consent, retention และ legal wording โดยผู้เชี่ยวชาญ
4. security review ของ Gateway, RLS, secrets, patient isolation และ audit
5. pilot กับคนไข้จริง 1–2 คน
6. ทบทวนปัญหาการใช้งานและ incident logs โดยไม่ใส่ PHI
7. ขยายการใช้เมื่อ pilot ผ่านเกณฑ์

## 18. สิ่งที่ไม่อยู่ใน MVP

- multi-clinician/team accounts
- patient editing, check-in, chat หรือส่งข้อมูลกลับ
- Google Fit/Fitbit integration
- full FHIR server/compliance
- patient document vault สำหรับรูป/PDF
- การเก็บภาพ วิดีโอ หรือเสียงคนไข้
- paid live-traffic routing
- automatic EBP deep research
- AI diagnosis หรือ autonomous treatment decision
- offline data-entry queue
- Notion/Vault/GitHub เป็นที่เก็บ medical record
- public patient directory หรือหน้ารวมคนไข้เป็น entry point หลัก

## 19. Definition of done สำหรับรุ่นทดลอง

รุ่นทดลองถือว่าพร้อมใช้ข้อมูลจริงเมื่อ:

- acceptance tests ทุกกลุ่มผ่าน
- encrypted backup และ restore ผ่านด้วยหลักฐาน
- Patient A/B isolation ผ่าน
- Emergency Lock และ revocation ผ่าน
- Calendar deep link และ date preselection ผ่านบนมือถือจริง
- owner ยืนยันว่า workflow Telegram และแบบฟอร์มทำงานได้โดยไม่ต้องจัดการฐานข้อมูลเอง
- legal/privacy review ผ่าน
- ไม่มี real patient media หรือ real patient data อยู่ใน repository, fixtures, logs หรือ development environment

เอกสารนี้เป็น design specification ไม่ใช่คำยืนยันการปฏิบัติตามกฎหมายหรือการรับรองความปลอดภัยของ production จนกว่าจะผ่าน implementation, testing, security review และการตรวจข้อความกฎหมายตามที่กำหนด
