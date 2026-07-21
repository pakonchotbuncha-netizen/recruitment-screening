/**
 * Export Sheet Data to Google Drive
 * ส่งออกข้อมูลจาก Sheet เป็นไฟล์ใน Google Drive
 * 
 * วิธีใช้:
 * 1. เปิด Sheet: https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74
 * 2. Extensions → Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. รัน function exportSheetToDrive()
 * 5. ไฟล์จะถูกสร้างใน Google Drive ของคุณ
 */

const SPREADSHEET_ID = '1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74';
const SHEET_GID = '1781182188';

function exportSheetToDrive() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetByGid(ss, SHEET_GID);
  
  if (!sheet) {
    Logger.log('Error: Sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // สร้าง JSON data
  const jsonData = rows.map((row, index) => {
    const obj = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex];
    });
    obj._rowNumber = index + 2;
    return obj;
  });
  
  // สร้างไฟล์ JSON
  const jsonContent = JSON.stringify({
    success: true,
    data: jsonData,
    count: jsonData.length,
    columns: headers,
    exportedAt: new Date().toISOString()
  }, null, 2);
  
  // สร้างไฟล์ใน Drive
  const folder = getOrCreateFolder('Recruitment Screening Export');
  const fileName = 'applicants_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss') + '.json';
  
  const file = folder.createFile(fileName, jsonContent, 'application/json');
  
  // ตั้งสิทธิ์ให้ anyone with link สามารถดูได้
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileUrl = file.getUrl();
  
  Logger.log('✅ Export สำเร็จ!');
  Logger.log('📁 Folder: ' + folder.getUrl());
  Logger.log('📄 File: ' + fileUrl);
  Logger.log('📊 จำนวนข้อมูล: ' + jsonData.length + ' รายการ');
  Logger.log('');
  Logger.log('🔗 ส่ง URL นี้ให้ KiloClaw:');
  Logger.log(fileUrl);
  
  return fileUrl;
}

function getSheetByGid(ss, gid) {
  const sheets = ss.getSheets();
  for (let sheet of sheets) {
    if (sheet.getSheetId().toString() === gid) {
      return sheet;
    }
  }
  return sheets[0];
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

// Export เป็น CSV ด้วย
function exportSheetToCSV() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetByGid(ss, SHEET_GID);
  
  if (!sheet) {
    Logger.log('Error: Sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  
  // แปลงเป็น CSV
  const csvContent = data.map(row => {
    return row.map(cell => {
      const cellStr = String(cell);
      // ถ้ามี comma, quote, หรือ newline ให้ wrap ด้วย quotes
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"';
      }
      return cellStr;
    }).join(',');
  }).join('\n');
  
  // สร้างไฟล์ CSV
  const folder = getOrCreateFolder('Recruitment Screening Export');
  const fileName = 'applicants_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmmss') + '.csv';
  
  const file = folder.createFile(fileName, csvContent, 'text/csv');
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileUrl = file.getUrl();
  
  Logger.log('✅ Export CSV สำเร็จ!');
  Logger.log('📄 File: ' + fileUrl);
  Logger.log('');
  Logger.log('🔗 ส่ง URL นี้ให้ KiloClaw:');
  Logger.log(fileUrl);
  
  return fileUrl;
}
