/**
 * Recruitment Screening - Data Fetcher
 * ดึงข้อมูลผู้สมัครจาก Google Sheet สำหรับระบบคัดกรองและสัมภาษณ์
 * 
 * วิธี Deploy:
 * 1. เปิด Google Sheet: https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74
 * 2. Extensions → Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy Web App URL ไปใช้
 */

const SPREADSHEET_ID = '1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74';
const SHEET_GID = '1781182188';

// ===== MAIN ROUTER =====
function doGet(e) {
  const action = e.parameter.action || 'get_applicants';
  let result;
  
  try {
    switch(action) {
      case 'get_applicants':
        result = getApplicants();
        break;
      case 'get_applicant':
        result = getApplicant(e.parameter.id);
        break;
      case 'get_stats':
        result = getStats();
        break;
      case 'get_columns':
        result = getColumns();
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== GET ALL APPLICANTS =====
function getApplicants() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetByGid(ss, SHEET_GID);
  
  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { success: true, data: [], count: 0 };
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const applicants = rows.map((row, index) => {
    const applicant = {};
    headers.forEach((header, colIndex) => {
      applicant[header] = row[colIndex];
    });
    applicant._rowNumber = index + 2; // +2 เพราะ header = row 1
    return applicant;
  });
  
  return {
    success: true,
    data: applicants,
    count: applicants.length,
    columns: headers,
    timestamp: new Date().toISOString()
  };
}

// ===== GET SINGLE APPLICANT =====
function getApplicant(id) {
  const result = getApplicants();
  
  if (!result.success) {
    return result;
  }
  
  const applicant = result.data.find(a => 
    a['ID'] === id || 
    a['id'] === id || 
    a['รหัส'] === id ||
    a['รหัสผู้สมัคร'] === id
  );
  
  if (!applicant) {
    return { success: false, error: 'Applicant not found' };
  }
  
  return { success: true, data: applicant };
}

// ===== GET STATS =====
function getStats() {
  const result = getApplicants();
  
  if (!result.success) {
    return result;
  }
  
  const applicants = result.data;
  
  const stats = {
    total: applicants.length,
    byStatus: {},
    byPosition: {},
    byDate: {},
    recentApplications: []
  };
  
  // Count by status
  applicants.forEach(a => {
    const status = a['สถานะ'] || a['status'] || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
  });
  
  // Count by position
  applicants.forEach(a => {
    const position = a['ตำแหน่ง'] || a['position'] || 'unknown';
    stats.byPosition[position] = (stats.byPosition[position] || 0) + 1;
  });
  
  // Recent applications (last 10)
  stats.recentApplications = applicants.slice(-10).reverse();
  
  return {
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  };
}

// ===== GET COLUMNS =====
function getColumns() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getSheetByGid(ss, SHEET_GID);
  
  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  return {
    success: true,
    columns: headers,
    timestamp: new Date().toISOString()
  };
}

// ===== HELPER: Get Sheet by GID =====
function getSheetByGid(ss, gid) {
  const sheets = ss.getSheets();
  
  // Try to find sheet by GID (if it's the sheet ID)
  for (let sheet of sheets) {
    if (sheet.getSheetId().toString() === gid) {
      return sheet;
    }
  }
  
  // Fallback: return first sheet
  return sheets[0];
}

// ===== TEST FUNCTION =====
function testGetApplicants() {
  const result = getApplicants();
  Logger.log(JSON.stringify(result, null, 2));
}

function testGetStats() {
  const result = getStats();
  Logger.log(JSON.stringify(result, null, 2));
}
