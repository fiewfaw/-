# 6MWT Calculator (มือถือ + Google Sheet)

โปรแกรมคำนวณ Predicted 6-minute walk distance ใช้บน iPhone (เพิ่ม Home Screen ได้) พร้อมส่งข้อมูลเข้า Google Sheet อัตโนมัติ

**สูตรอ้างอิง:** Enright PL, Sherrill DL. *Am J Respir Crit Care Med* 1998;158:1384-7

- ชาย: `6MWD = 7.57 × Ht(cm) − 5.02 × Age − 1.76 × Wt(kg) − 309`
- หญิง: `6MWD = 2.11 × Ht(cm) − 2.29 × Wt(kg) − 5.78 × Age + 667`
- LLN: ชาย `Predicted − 153` / หญิง `Predicted − 139`

---

## ขั้นตอนติดตั้ง (ทำครั้งเดียว)

### 1. สร้าง Google Sheet เก็บข้อมูล
- เปิด https://sheets.new สร้างไฟล์ใหม่ ตั้งชื่อ เช่น `6MWT Logger`

### 2. Deploy Apps Script เป็น Web App
1. ในไฟล์ Sheet → เมนู **Extensions → Apps Script**
2. ลบโค้ดเริ่มต้นทิ้ง → วางโค้ดจากไฟล์ [`apps-script.gs`](apps-script.gs) ทั้งหมด
3. กด **💾 Save** (icon รูปดิสก์)
4. กด **Deploy → New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด **Deploy** → ครั้งแรกจะขออนุญาต → กด Authorize → เลือกบัญชี → Advanced → Go to (unsafe) → Allow
6. คัดลอก **Web app URL** (รูปแบบ `https://script.google.com/macros/s/.../exec`)

### 3. เปิดหน้าเว็บบน iPhone
- เข้าหน้า: `https://baankaiyaphap-chonburi.com/tools/6mwt/`
  (หลัง push เว็บขึ้น GitHub Pages แล้ว)
- หรือใช้ local preview ทดสอบก่อน
- กดปุ่ม **⚙** มุมขวาบน → วาง Web app URL → ใส่ชื่อผู้บันทึก → **บันทึก**

### 4. Add to Home Screen (iPhone 17)
1. กดปุ่ม **Share** ใน Safari
2. **Add to Home Screen** → ตั้งชื่อ "6MWT"
3. เปิดจาก Home Screen → ใช้แบบ fullscreen เหมือนแอป

---

## การใช้งาน

1. กรอก HN, ชื่อ, เพศ, อายุ, ส่วนสูง, น้ำหนัก → ค่า **Predicted / LLN** จะคำนวณทันที
2. กรอกระยะทางจริง → ดู **% Predicted** + badge (ปกติ/ต่ำ/ต่ำมาก)
3. กรอก Vital signs ก่อน-หลัง → ดู Δ HR, Δ SpO₂, Δ Borg อัตโนมัติ
4. กด **💾 บันทึก** → ข้อมูลถูกส่งเข้า Sheet (แถวใหม่ต่อท้าย)

---

## โครงสร้างคอลัมน์ใน Sheet

ถูกสร้างอัตโนมัติเมื่อบันทึกครั้งแรก — 30 คอลัมน์:

| # | ชื่อ |
|---|---|
| A | Timestamp บันทึก |
| B | วันที่ตรวจ |
| C | HN |
| D | ชื่อ-นามสกุล |
| E | เพศ |
| F | อายุ |
| G | ส่วนสูง (cm) |
| H | น้ำหนัก (kg) |
| I | Predicted (m) |
| J | LLN (m) |
| K | Actual (m) |
| L | % Predicted |
| M | รอบ |
| N-U | Pre/Post HR, SpO₂, BP, RR |
| V-Y | Pre/Post Borg (เหนื่อย/ขา) |
| Z | หยุดพัก |
| AA | O₂ ใช้ |
| AB | เหตุที่หยุด |
| AC | หมายเหตุ |
| AD | ผู้บันทึก |

---

## ปรับแต่ง

- เปลี่ยนชื่อชีต: แก้ตัวแปร `SHEET_NAME` ใน `apps-script.gs`
- ถ้าต้องการให้บันทึกหลาย sheet (เช่น แยกตามนักกายภาพ): ปรับ logic ใน `doPost` ให้เลือก sheet ตาม `data.recorder`

---

## Troubleshooting

- **กดบันทึกแล้วฟ้อง "เชื่อมต่อไม่ได้"** → ตรวจ Web app URL ลงท้าย `/exec` (ไม่ใช่ `/dev`)
- **บันทึกได้แต่ไม่มีข้อมูลใน sheet** → ลองรัน `doPost` ครั้งแรกผ่าน Apps Script editor เพื่อ accept permission
- **อยากแก้สิทธิ์** → Apps Script → Deploy → Manage deployments → Edit → Version: New version → Deploy
