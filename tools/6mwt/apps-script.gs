/**
 * 6MWT Logger — Google Apps Script Web App
 *
 * ส่งข้อมูลเข้า sheet "รายชื่อ COPD" ของพี่ปราง (shared)
 * https://docs.google.com/spreadsheets/d/1IBC491LLj8-q4wW3c4FL0xFovC4Eo9WzscWaGAibMtQ/edit
 *
 * วิธี deploy (ครั้งเดียว):
 * 1) เปิด https://script.google.com → กด "New project"
 * 2) ลบโค้ดเริ่มต้น → วางโค้ดนี้ทั้งหมด → กด 💾 Save
 * 3) Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me  (fiewfaw@gmail.com)
 *    - Who has access: Anyone
 * 4) กด Authorize ครั้งแรก (Advanced → Go to → Allow)
 * 5) Copy "Web app URL" → ใส่ในแอป 6MWT (ปุ่ม ⚙)
 *
 * ถ้าใช้ tab อื่นในไฟล์เดียวกัน เปลี่ยน TARGET_TAB_GID
 * (ดู gid ใน URL เช่น .../edit#gid=760319088)
 */

const TARGET_SHEET_ID = '1IBC491LLj8-q4wW3c4FL0xFovC4Eo9WzscWaGAibMtQ';
const TARGET_TAB_GID  = 760319088;

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function doGet(e){
  return ContentService.createTextOutput('OK 6MWT endpoint ready');
}

function doPost(e){
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(TARGET_SHEET_ID);
    const sheet = ss.getSheets().find(s => s.getSheetId() === TARGET_TAB_GID);
    if(!sheet) throw new Error('Tab gid=' + TARGET_TAB_GID + ' not found in ' + ss.getName());

    // หา row ถัดไปที่ HN (col C) ว่าง — ยังคง ลำดับที่ ใน col B
    const lastRow = sheet.getLastRow();
    let targetRow = -1;
    if(lastRow >= 2){
      const hnCol = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for(let i = 0; i < hnCol.length; i++){
        if(hnCol[i][0] === '' || hnCol[i][0] === null){
          targetRow = i + 2;
          break;
        }
      }
    }
    if(targetRow === -1) targetRow = lastRow + 1;

    const thaiDate = formatThaiDate(data.testDate);

    // คอลัมน์ตาม schema ของ sheet:
    // A วันที่ | B ลำดับ (pre-filled) | C HN | D ชื่อ | E-G pre HR/SpO2/RPE | H-J post HR/SpO2/RPE
    // K 6MWTs | L Percent prediction
    sheet.getRange(targetRow, 1).setValue(thaiDate);
    sheet.getRange(targetRow, 3).setValue(data.hn || '');
    sheet.getRange(targetRow, 4).setValue(data.name || '');
    sheet.getRange(targetRow, 5).setValue(numOrBlank(data.preHr));
    sheet.getRange(targetRow, 6).setValue(numOrBlank(data.preSpo2));
    sheet.getRange(targetRow, 7).setValue(numOrBlank(data.preRpe));
    sheet.getRange(targetRow, 8).setValue(numOrBlank(data.postHr));
    sheet.getRange(targetRow, 9).setValue(numOrBlank(data.postSpo2));
    sheet.getRange(targetRow,10).setValue(numOrBlank(data.postRpe));
    sheet.getRange(targetRow,11).setValue(numOrBlank(data.actual));

    // Percent prediction: ถ้ามี note (เช่น "หยุด 4.19 นาที") → ใช้ note, ไม่งั้นใช้ค่าคำนวณ
    const pctVal = (data.pctNote && String(data.pctNote).trim())
      ? String(data.pctNote).trim()
      : numOrBlank(data.pctPredicted);
    sheet.getRange(targetRow,12).setValue(pctVal);

    return jsonOut({
      ok: true,
      row: targetRow,
      sheet: sheet.getName(),
      spreadsheet: ss.getName()
    });
  } catch(err) {
    return jsonOut({ok:false, error:String(err)});
  }
}

function numOrBlank(v){
  if(v === '' || v === null || v === undefined) return '';
  const n = parseFloat(v);
  return isNaN(n) ? '' : n;
}

function jsonOut(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatThaiDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.getDate() + ' ' + THAI_MONTHS[d.getMonth()];
}
