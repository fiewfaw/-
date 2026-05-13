/**
 * 6MWT Logger — Google Apps Script Web App
 * ผูกกับ Google Sheet ที่ต้องการเก็บข้อมูลผล 6-minute walk test
 *
 * วิธี deploy:
 * 1) เปิด Google Sheet ที่ต้องการใช้เก็บข้อมูล
 * 2) Extensions → Apps Script → วางโค้ดนี้ทั้งหมด
 * 3) แก้ SHEET_NAME ถ้าต้องการชื่อชีตอื่น (default: "6MWT")
 * 4) Save → Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (หรือ Anyone with link)
 * 5) Copy "Web app URL" ที่ได้ → ใส่ในหน้า 6MWT Calculator (ปุ่ม ⚙)
 */

const SHEET_NAME = '6MWT';

const HEADERS = [
  'Timestamp บันทึก','วันที่ตรวจ','HN','ชื่อ-นามสกุล','เพศ','อายุ','ส่วนสูง (cm)','น้ำหนัก (kg)',
  'Predicted (m)','LLN (m)','Actual (m)','% Predicted','รอบ',
  'Pre HR','Post HR','Pre SpO2','Post SpO2','Pre BP','Post BP','Pre RR','Post RR',
  'Pre Borg D','Post Borg D','Pre Borg L','Post Borg L',
  'หยุดพัก','O2 ใช้','เหตุที่หยุด','หมายเหตุ','ผู้บันทึก'
];

function doGet(e){
  return ContentService.createTextOutput('OK 6MWT endpoint ready');
}

function doPost(e){
  try{
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if(!sh){
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#E8F4F8');
    }
    if(sh.getLastRow() === 0){
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#E8F4F8');
    }

    sh.appendRow([
      new Date(),
      data.testDate || '',
      data.hn || '',
      data.name || '',
      data.sex || '',
      data.age || '',
      data.height || '',
      data.weight || '',
      data.predicted || '',
      data.lln || '',
      data.actual || '',
      data.pctPredicted || '',
      data.laps || '',
      data.preHr || '', data.postHr || '',
      data.preSpo2 || '', data.postSpo2 || '',
      data.preBp || '',  data.postBp || '',
      data.preRr || '',  data.postRr || '',
      data.preBorgD || '', data.postBorgD || '',
      data.preBorgL || '', data.postBorgL || '',
      data.stops || '',
      data.o2Used || '',
      data.reasonStopped || '',
      data.notes || '',
      data.recorder || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, row: sh.getLastRow()}))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
