# 6MWT Calculator (มือถือ + Google Sheet)

โปรแกรมคำนวณ Predicted 6-minute walk distance สำหรับใช้บน iPhone (เพิ่ม Home Screen ได้) พร้อมส่งข้อมูลเข้า sheet **รายชื่อ COPD** ตาม schema ที่ใช้นำเสนอ

**สูตรอ้างอิง:** Enright PL, Sherrill DL. *Am J Respir Crit Care Med* 1998;158:1384-7

- ชาย: `6MWD = 7.57 × Ht(cm) − 5.02 × Age − 1.76 × Wt(kg) − 309`
- หญิง: `6MWD = 2.11 × Ht(cm) − 2.29 × Wt(kg) − 5.78 × Age + 667`
- LLN: ชาย `Predicted − 153` / หญิง `Predicted − 139`

---

## ปลายทาง Sheet

ส่งเข้า: [รายชื่อ COPD](https://docs.google.com/spreadsheets/d/1IBC491LLj8-q4wW3c4FL0xFovC4Eo9WzscWaGAibMtQ/edit#gid=760319088) (gid 760319088)

| คอลัมน์ | แมพจากฟอร์ม |
|---|---|
| A วันที่ | testDate → format ไทย "13 พ.ค." |
| B ลำดับ | (pre-filled — ไม่แตะ) |
| C HN | hn |
| D ชื่อ-สกุล | name |
| E HR ก่อน | preHr |
| F SapO2 ก่อน | preSpo2 |
| G RPE ก่อน | preRpe |
| H HR หลัง | postHr |
| I SapO2 หลัง | postSpo2 |
| J RPE หลัง | postRpe |
| K 6 MWTs | actual (เมตร) |
| L Percent prediction | คำนวณจากสูตร — หรือใช้ข้อความใน "หมายเหตุ %" override (เช่น `หยุด 4.19 นาที`) |

ระบบจะหาแถวที่ `HN` ว่างถัดไป (เริ่มจาก row 2) แล้วกรอกในแถวนั้น

---

## Setup (ทำครั้งเดียว)

### 1. Deploy Apps Script เป็น Web App
1. เปิด https://script.google.com → กด **New project**
2. ลบโค้ดเริ่มต้น → วางโค้ดจาก [`apps-script.gs`](apps-script.gs) ทั้งหมด
3. กด **💾 Save**
4. **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me** (fiewfaw@gmail.com — เพราะคุณมีสิทธิ์เขียน sheet)
   - Who has access: **Anyone**
5. ครั้งแรกจะขออนุญาต → **Authorize access** → เลือกบัญชี → **Advanced → Go to (unsafe) → Allow**
6. คัดลอก **Web app URL** (รูปแบบ `https://script.google.com/macros/s/.../exec`)

### 2. เปิดหน้าเว็บบน iPhone
- หลัง merge PR → เข้า: `https://baankaiyaphap-chonburi.com/tools/6mwt/`
- กดปุ่ม **⚙** มุมขวาบน → วาง Web app URL → ใส่ชื่อผู้บันทึก → **บันทึก**

### 3. Add to Home Screen (iPhone 17)
1. กด **Share** ใน Safari
2. **Add to Home Screen** → ตั้งชื่อ "6MWT"
3. เปิดจาก Home Screen → ใช้แบบ fullscreen เหมือนแอป

---

## การใช้งาน

1. กรอก **HN, ชื่อ, เพศ, อายุ, ส่วนสูง, น้ำหนัก** → Predicted/LLN คำนวณทันที
2. กรอก **ระยะทางจริง** → ดู **% Predicted** + badge (ปกติ/ต่ำ/ต่ำมาก)
3. กรอก HR, SpO₂, RPE ก่อน-หลัง → ดู Δ
4. ถ้าหยุดก่อนครบเวลา → ใส่ใน **หมายเหตุ %** เช่น `หยุด 4.19 นาที` → จะบันทึกข้อความนี้แทน % ใน sheet
5. กด **💾 บันทึก** → ระบบเขียนเข้าแถวว่างถัดไปอัตโนมัติ

---

## iOS UX

- **Dial-pad keyboard** ทุกช่องตัวเลข (`type=tel` + `inputmode=numeric`)
- **Decimal pad** สำหรับช่องทศนิยม (สูง, น้ำหนัก, ระยะทาง, RPE)
- **Keyboard toolbar** ‹ ก่อนหน้า / ถัดไป › / เสร็จ ลอยเหนือคีย์บอร์ดเลข
- **safe-area-inset** รองรับ Dynamic Island + ขอบล่าง iPhone 17
- **Vibration feedback** เมื่อบันทึกสำเร็จ

---

## Troubleshooting

- **"เชื่อมต่อไม่ได้"** → ตรวจ Web app URL ลงท้าย `/exec` ไม่ใช่ `/dev`
- **"Tab gid=... not found"** → ตรวจว่ายังเปิดอยู่ที่ tab เดิม (gid อาจเปลี่ยนถ้า duplicate sheet)
- **บันทึกใน sheet อื่น** → ปรับ `TARGET_SHEET_ID` / `TARGET_TAB_GID` ใน Apps Script
- **อยากเปลี่ยน sheet** → แก้สองค่าใน [`apps-script.gs`](apps-script.gs) → Redeploy (Manage deployments → Edit → New version)
