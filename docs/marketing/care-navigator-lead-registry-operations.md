# การดูแลระบบ Care Navigator Lead Registry

เอกสารนี้ใช้กับระบบเก็บข้อมูลติดต่อและสรุปแผน Team 4 แบบชั่วคราวเท่านั้น ไม่ใช่เวชระเบียน และไม่ใช่ระบบสถิติการตลาดแบบไม่ระบุตัวตน

## ขอบเขตที่ต้องแยกจากกัน

| ระบบ | ข้อมูล | ที่เก็บ |
|---|---|---|
| Marketing Events | event ที่อนุญาตแบบไม่ระบุตัวตน | `Care Navigator - Marketing Events` |
| Lead Registry | ชื่อ เบอร์ พื้นที่ระดับกว้าง ชนิดแผน และ `plan_summary` หลังยินยอม | `Care Navigator - Pending Leads` |
| Clinical Core | เวชระเบียนที่ยืนยันแล้ว | อยู่นอกระบบนี้และห้ามเชื่อมอัตโนมัติ |

ก่อนเปิดใช้ ให้ตรวจว่า Spreadsheet ID ของ Lead Registry ไม่ใช่ไฟล์เดียวกับ Marketing Events และไฟล์ทั้งสองไม่ได้เปิดสิทธิ์ “ทุกคนที่มีลิงก์”

## เปิดระบบครั้งแรก

1. สร้าง Google Spreadsheet ส่วนตัวชื่อ `Care Navigator - Pending Leads` ในบัญชีเจ้าของ
2. ตรวจ Sharing ให้มีเฉพาะเจ้าของและผู้ดูแลที่ได้รับอนุมัติจริง
3. สร้าง Apps Script แยกใหม่จาก Marketing Events
4. เพิ่ม Script Properties `LEAD_SPREADSHEET_ID` และ `LEAD_GATEWAY_SECRET` โดยไม่เขียนค่าจริงลง Git หรือเอกสาร
5. รัน `setupWorkbook()` แล้วตรวจว่ามี `Leads`, `Status History`, `Lookup Audit`, `Data Dictionary`
6. รัน `installDailyExpiryTrigger()` แล้วตรวจว่ามี trigger รายวันเพียงหนึ่งรายการ
7. ตั้งค่า VPS ด้วย `LEAD_STORAGE_URL`, `LEAD_STORAGE_SECRET`, `LEAD_RECOVERY_SECRET` ซึ่งเป็นคนละ secret กัน
8. ทดสอบด้วย `scripts/smoke.mjs` เท่านั้น และตรวจว่าลีดจำลองถูกล้างหลังทดสอบ
9. ยังไม่เปิดรับข้อมูลจริงจนกว่าจะตรวจ recovery, wrong-token rejection, expiry และ manual purge ผ่าน

## ตรวจประจำวันและประจำเดือน

- รายวัน: ดูว่า trigger `expireLeads` ไม่มี error และจำนวน pending เกิน 14 วันเป็นศูนย์
- รายสัปดาห์: สุ่มตรวจว่าช่องที่ล้างแล้วไม่มีชื่อ เบอร์ `service_area`, `plan_summary` หรือ `resume_token_hash`
- รายเดือน: ดาวน์โหลด Spreadsheet เป็น `.xlsx` เก็บในพื้นที่สำรองส่วนตัวที่เข้ารหัสหรือจำกัดสิทธิ์ และบันทึกวันที่สำรอง
- หลังสำรอง: ห้ามย้ายไฟล์สำรองไปโฟลเดอร์แชร์สาธารณะหรือส่งผ่านแชททั่วไป

## ลบข้อมูลตามคำขอหรือรหัสลีด

1. เปิด Apps Script ของ Lead Registry ด้วยบัญชีเจ้าของ
2. รัน `purgeLeadByCode('CN-XXXX-XXXX-XXXX-XXXX')`
3. ตรวจว่า `contact_name`, `phone`, `service_area`, `plan_summary`, `resume_token_hash` ว่าง
4. ตรวจว่า status เป็น `expired` และมีรายการ `manual_owner_request` ใน Status History
5. ห้ามลบทั้งแถว เพราะต้องเก็บหลักฐานสถานะและเวลาแบบไม่ระบุตัวตน

## หยุดระบบฉุกเฉิน

1. ปิด route Nginx ที่ส่ง `/care-navigator-api/` ไป gateway หรือหยุด container
2. ยกเลิก Apps Script deployment หากสงสัยว่า URL หรือ secret รั่ว
3. แอพต้องยังสร้างและแสดงแผนในเครื่องได้ แต่จะแจ้งว่าไม่สามารถบันทึกรหัสปรึกษาได้
4. ตรวจ log ด้วย `request_id` และ `result_code` เท่านั้น ห้ามค้นหาด้วยชื่อ เบอร์ หรือข้อความแผน
5. ระบบ LINE/chatbot ยังไม่อยู่ในเฟสนี้ หากเพิ่มภายหลังต้องมีคู่มือปิด webhook แยกต่างหาก

## หมุนรหัสลับ

1. สร้าง `LEAD_GATEWAY_SECRET` ใหม่ใน Apps Script และ `LEAD_STORAGE_SECRET` ใหม่บน VPS ให้ตรงกัน
2. สร้าง `LEAD_RECOVERY_SECRET` ใหม่เฉพาะเมื่อยอมรับว่าลีดเดิมอาจกู้แผนไม่ได้ หรือจัดช่วงเปลี่ยนผ่านรองรับ secret เดิมก่อน
3. restart gateway แล้วรัน synthetic smoke
4. ยกเลิก secret เดิมหลังผลทดสอบผ่าน
5. ห้ามแสดง secret ในคำสั่ง terminal ที่ถูกบันทึก หน้าจอ เอกสาร หรือ Git

## กู้คืนจากไฟล์สำรอง

1. สร้าง Spreadsheet ส่วนตัวใหม่จาก `.xlsx` ล่าสุด
2. ตรวจหัวตารางทั้งสี่ชีตกับ `Code.gs`
3. ตั้ง `LEAD_SPREADSHEET_ID` ไปยังไฟล์ใหม่
4. รัน `setupWorkbook()` เพื่อเติมโครงที่ขาด โดยไม่ลบข้อมูลเดิม
5. รัน synthetic smoke และตรวจ cleanup ก่อนเปิด route อีกครั้ง

## หลักฐานก่อนอนุญาตข้อมูลจริง

- ชีตเป็น owner-only
- Marketing Events และ Pending Leads เป็นคนละไฟล์และคนละ Apps Script
- create ซ้ำด้วย `request_id` เดิมไม่เพิ่มแถว
- recovery token ถูกจึงเห็นเฉพาะแผน และ token ผิดไม่เห็นข้อมูล
- browser storage ไม่มีชื่อ เบอร์ พื้นที่ หรือ `plan_summary`
- Copy for AI ไม่มีชื่อ เบอร์ พิกัด หรือ recovery token
- `expireLeads` และ `purgeLeadByCode` ล้างช่องอ่อนไหวจริง
- log ไม่มี request body หรือข้อมูลติดต่อ
