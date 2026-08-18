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
3. ตรวจว่ามีแท็บ `Leads`, `Status History`, `Lookup Audit`, `Data Dictionary` และหัวตารางตรงกับ Data Dictionary
4. เปิด Google Sheets API ในโครงการ `Baan Physio Care` และสร้าง Service Account สำหรับ Lead Registry โดยเฉพาะ
5. แชร์เฉพาะ Spreadsheet นี้ให้ email ของ Service Account เป็น Editor ห้ามแชร์โฟลเดอร์หรือไฟล์อื่น
6. เก็บ JSON credential ไว้ที่ `/docker/care-navigator-leads/secrets/google-service-account.json` บน VPS ด้วยสิทธิ์ไฟล์ `600` และ mount แบบ read-only
7. ตั้งค่า VPS ด้วย `LEAD_STORAGE_DRIVER=sheets`, `LEAD_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_FILE` และ `LEAD_RECOVERY_SECRET`
8. รัน expiry service และ `scripts/smoke.mjs` ด้วยข้อมูลจำลองเท่านั้น ตรวจว่าลีดจำลองถูกล้างหลังทดสอบ
9. ตรวจว่า Service Account อ่านไฟล์ที่ไม่ได้แชร์ไม่ได้ และ route `/v1/*` กลับเป็น `503`
10. ยังไม่เปิดรับข้อมูลจริงจนกว่าจะตรวจ recovery, wrong-token rejection, expiry และ purge ผ่าน และเจ้าของอนุมัติแยกต่างหาก

## ตรวจประจำวันและประจำเดือน

- รายวัน: ดูว่า `care-navigator-lead-expiry.timer` ทำงานสำเร็จ และจำนวน pending เกิน 14 วันเป็นศูนย์
- รายสัปดาห์: สุ่มตรวจว่าช่องที่ล้างแล้วไม่มีชื่อ เบอร์ `service_area`, `plan_summary` หรือ `resume_token_hash`
- รายเดือน: ดาวน์โหลด Spreadsheet เป็น `.xlsx` เก็บในพื้นที่สำรองส่วนตัวที่เข้ารหัสหรือจำกัดสิทธิ์ และบันทึกวันที่สำรอง
- หลังสำรอง: ห้ามย้ายไฟล์สำรองไปโฟลเดอร์แชร์สาธารณะหรือส่งผ่านแชททั่วไป

## ลบข้อมูลตามคำขอหรือรหัสลีด

1. ใช้ owner workflow ผ่าน VPS เพื่อเรียก `purgeLead` ด้วยรหัส `CN-XXXX-XXXX-XXXX-XXXX`
2. ระบุ `actor_type=owner` และเหตุผล เช่น `manual_owner_request`
3. ตรวจว่า `contact_name`, `phone`, `service_area`, `plan_summary`, `resume_token_hash` ว่าง
4. ตรวจว่า status เป็น `expired` และมีรายการ `manual_owner_request` ใน Status History
5. ห้ามลบทั้งแถว เพราะต้องเก็บหลักฐานสถานะและเวลาแบบไม่ระบุตัวตน

## หยุดระบบฉุกเฉิน

1. ให้ Caddy ตอบ `503` สำหรับ `/v1/*` หรือหยุด container โดยคงหน้าแอพสาธารณะไว้
2. หากสงสัยว่า credential รั่ว ให้ถอน JSON key เดิมใน Google Cloud และหยุด gateway ก่อนสร้าง key ใหม่
3. แอพต้องยังสร้างและแสดงแผนในเครื่องได้ แต่จะแจ้งว่าไม่สามารถบันทึกรหัสปรึกษาได้
4. ตรวจ log ด้วย `request_id` และ `result_code` เท่านั้น ห้ามค้นหาด้วยชื่อ เบอร์ หรือข้อความแผน
5. ระบบ LINE/chatbot ยังไม่อยู่ในเฟสนี้ หากเพิ่มภายหลังต้องมีคู่มือปิด webhook แยกต่างหาก

## หมุนรหัสลับ

1. สร้าง JSON key ใหม่ให้ Service Account เดิมและนำไปแทนที่บน VPS โดยไม่แสดงเนื้อหาใน terminal หรือแชท
2. restart gateway แล้วรัน synthetic smoke จากนั้นถอน key เดิมใน Google Cloud
3. สร้าง `LEAD_RECOVERY_SECRET` ใหม่เฉพาะเมื่อยอมรับว่าลีดเดิมอาจกู้แผนไม่ได้ หรือจัดช่วงเปลี่ยนผ่านรองรับ secret เดิมก่อน
4. ห้ามเก็บ JSON credential หรือ secret ใด ๆ ใน Git, browser JavaScript, screenshot หรือเอกสาร

## กู้คืนจากไฟล์สำรอง

1. สร้าง Spreadsheet ส่วนตัวใหม่จาก `.xlsx` ล่าสุด
2. ตรวจหัวตารางทั้งสี่ชีตกับ Data Dictionary และ storage contract
3. ตั้ง `LEAD_SPREADSHEET_ID` ไปยังไฟล์ใหม่
4. แชร์เฉพาะไฟล์ใหม่ให้ Service Account เดิมเป็น Editor
5. รัน synthetic smoke และตรวจ cleanup ก่อนเปิด route อีกครั้ง

## หลักฐานก่อนอนุญาตข้อมูลจริง

- ชีตเป็น owner-only
- Marketing Events และ Pending Leads เป็นคนละไฟล์ และ Service Account เข้าถึงเฉพาะ Pending Leads
- create ซ้ำด้วย `request_id` เดิมไม่เพิ่มแถว
- recovery token ถูกจึงเห็นเฉพาะแผน และ token ผิดไม่เห็นข้อมูล
- browser storage ไม่มีชื่อ เบอร์ พื้นที่ หรือ `plan_summary`
- Copy for AI ไม่มีชื่อ เบอร์ พิกัด หรือ recovery token
- `expireLeads` และ `purgeLead` ล้างช่องอ่อนไหวจริง
- log ไม่มี request body หรือข้อมูลติดต่อ
