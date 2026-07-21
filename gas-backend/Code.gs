/**
 * ระบบคัดกรองและสัมภาษณ์ตำแหน่งงาน - Backend API
 * Google Apps Script Web App
 * 
 * Deploy: Extensions → Apps Script → Deploy → New deployment → Web app
 * Execute as: Me / Access: Anyone
 */

// ===== CONFIG =====
const SPREADSHEET_ID = '1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74';
const SHEET_GID_APPLICANTS = '1144176219';

// Sheet names สำหรับระบบคัดกรอง
const SHEETS = {
  applicants: 'Applicants',
  assessments: 'Assessments',
  interviews: 'Interviews',
  notifications: 'Notifications',
  consents: 'Consents',
  audit_log: 'AuditLog',
  users: 'Users'
};

// ===== WEB APP ROUTER =====
function doGet(e) {
  const action = e.parameter.action || 'index';
  
  try {
    switch(action) {
      case 'index':
        return serveIndex();
      case 'get_applicants':
        return jsonResponse(getApplicants());
      case 'get_applicant':
        return jsonResponse(getApplicant(e.parameter.id));
      case 'get_assessments':
        return jsonResponse(getAssessments());
      case 'get_interviews':
        return jsonResponse(getInterviews());
      case 'get_notifications':
        return jsonResponse(getNotifications());
      case 'get_stats':
        return jsonResponse(getStats());
      case 'check_interview_reminders':
        return jsonResponse(checkInterviewReminders());
      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    switch(action) {
      case 'save_applicant':
        return jsonResponse(saveApplicant(params.data));
      case 'update_applicant':
        return jsonResponse(updateApplicant(params.id, params.data));
      case 'delete_applicant':
        return jsonResponse(deleteApplicant(params.id));
      case 'import_applicants':
        return jsonResponse(importApplicants(params.data));
      case 'save_assessment':
        return jsonResponse(saveAssessment(params.data));
      case 'save_interview':
        return jsonResponse(saveInterview(params.data));
      case 'mark_notification_read':
        return jsonResponse(markNotificationRead(params.id));
      case 'create_notification':
        return jsonResponse(createNotification(params.data));
      case 'login':
        return jsonResponse(handleLogin(params.username, params.password));
      case 'record_consent':
        return jsonResponse(recordConsent(params.data));
      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ===== SERVE HTML =====
function serveIndex() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('กระบวนการคัดกรองและสัมภาษณ์ตำแหน่งงาน')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ===== APPLICANTS =====
function getApplicants() {
  const sheet = getSheet(SHEETS.applicants);
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { success: true, data: [], count: 0 };
  }
  
  const headers = data[0];
  const rows = data.slice(1).filter(row => row.some(cell => cell !== ''));
  
  const applicants = rows.map((row, index) => {
    const applicant = {};
    headers.forEach((header, i) => {
      applicant[header] = row[i];
    });
    applicant._row = index + 2;
    return applicant;
  });
  
  return { success: true, data: applicants, count: applicants.length };
}

function getApplicant(id) {
  const result = getApplicants();
  const applicant = result.data.find(a => a.id === id || a['รหัส'] === id);
  return { success: true, data: applicant || null };
}

function saveApplicant(data) {
  const sheet = getSheet(SHEETS.applicants);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Generate ID if not provided
  if (!data.id) {
    data.id = 'APP-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000);
  }
  data.createdAt = data.createdAt || new Date().toISOString();
  data.status = data.status || 'new';
  
  // Create row
  const row = headers.map(h => data[h] || '');
  sheet.appendRow(row);
  
  // Create notification
  createNotification({
    type: 'new_applicant',
    title: '🆕 มีผู้สมัครใหม่',
    message: data.fullName + ' สมัครตำแหน่ง ' + (data.position || ''),
    applicantId: data.id
  });
  
  // Audit log
  logAudit('APPLICANT_CREATED', data.id, { fullName: data.fullName });
  
  return { success: true, data: data, id: data.id };
}

function updateApplicant(id, data) {
  const sheet = getSheet(SHEETS.applicants);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === id) {
      const row = headers.map(h => data[h] !== undefined ? data[h] : allData[i][headers.indexOf(h)]);
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      
      logAudit('APPLICANT_UPDATED', id, data);
      return { success: true, data: data };
    }
  }
  
  return { success: false, error: 'Applicant not found' };
}

function deleteApplicant(id) {
  const sheet = getSheet(SHEETS.applicants);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      logAudit('APPLICANT_DELETED', id, {});
      return { success: true };
    }
  }
  
  return { success: false, error: 'Applicant not found' };
}

function importApplicants(dataArray) {
  const sheet = getSheet(SHEETS.applicants);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let imported = 0;
  
  dataArray.forEach(data => {
    if (!data.id) {
      data.id = 'APP-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000);
    }
    data.createdAt = data.createdAt || new Date().toISOString();
    data.status = data.status || 'new';
    
    const row = headers.map(h => data[h] || '');
    sheet.appendRow(row);
    imported++;
  });
  
  if (imported > 0) {
    createNotification({
      type: 'new_applicant',
      title: '🆕 นำเข้าผู้สมัครใหม่',
      message: 'นำเข้าผู้สมัครจำนวน ' + imported + ' คน'
    });
  }
  
  logAudit('APPLICANTS_IMPORTED', null, { count: imported });
  return { success: true, count: imported };
}

// ===== ASSESSMENTS =====
function getAssessments() {
  const sheet = getSheet(SHEETS.assessments);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: true, data: [], count: 0 };
  
  const headers = data[0];
  const rows = data.slice(1).filter(row => row.some(cell => cell !== ''));
  
  return {
    success: true,
    data: rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    }),
    count: rows.length
  };
}

function saveAssessment(data) {
  const sheet = getSheet(SHEETS.assessments);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!data.id) {
    data.id = 'ASM-' + Date.now();
  }
  data.submittedAt = data.submittedAt || new Date().toISOString();
  
  const row = headers.map(h => {
    const val = data[h];
    return typeof val === 'object' ? JSON.stringify(val) : (val || '');
  });
  
  // Check if exists
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  let found = false;
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow(row);
  }
  
  logAudit('ASSESSMENT_SAVED', data.applicantId, { id: data.id });
  return { success: true, data: data };
}

// ===== INTERVIEWS =====
function getInterviews() {
  const sheet = getSheet(SHEETS.interviews);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: true, data: [], count: 0 };
  
  const headers = data[0];
  const rows = data.slice(1).filter(row => row.some(cell => cell !== ''));
  
  return {
    success: true,
    data: rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        try { obj[h] = typeof row[i] === 'string' && row[i].startsWith('{') ? JSON.parse(row[i]) : row[i]; }
        catch(e) { obj[h] = row[i]; }
      });
      return obj;
    }),
    count: rows.length
  };
}

function saveInterview(data) {
  const sheet = getSheet(SHEETS.interviews);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!data.id) {
    data.id = 'INT-' + Date.now();
  }
  data.createdAt = data.createdAt || new Date().toISOString();
  
  const row = headers.map(h => {
    const val = data[h];
    return typeof val === 'object' ? JSON.stringify(val) : (val || '');
  });
  
  const allData = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('id');
  let found = false;
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id) {
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow(row);
  }
  
  logAudit('INTERVIEW_SAVED', data.applicantId, { id: data.id });
  return { success: true, data: data };
}

// ===== NOTIFICATIONS =====
function getNotifications() {
  const sheet = getSheet(SHEETS.notifications);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: true, data: [], count: 0 };
  
  const headers = data[0];
  const rows = data.slice(1).filter(row => row.some(cell => cell !== ''));
  
  return {
    success: true,
    data: rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    }).reverse(),
    count: rows.length
  };
}

function createNotification(data) {
  const sheet = getSheet(SHEETS.notifications);
  
  if (!data.id) {
    data.id = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  data.createdAt = data.createdAt || new Date().toISOString();
  data.read = data.read || false;
  data.priority = data.priority || 'medium';
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);
  
  return { success: true, id: data.id };
}

function markNotificationRead(id) {
  const sheet = getSheet(SHEETS.notifications);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === id) {
      const readCol = headers.indexOf('read');
      sheet.getRange(i + 1, readCol + 1).setValue(true);
      return { success: true };
    }
  }
  
  return { success: false, error: 'Notification not found' };
}

function checkInterviewReminders() {
  const interviews = getInterviews();
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  let reminders = 0;
  
  interviews.data.forEach(interview => {
    if (!interview.scheduledDate || interview.reminderSent) return;
    
    const interviewDate = new Date(interview.scheduledDate);
    if (interviewDate >= now && interviewDate <= threeDaysLater) {
      createNotification({
        type: 'interview_reminder',
        title: '📅 แจ้งเตือนการสัมภาษณ์',
        message: 'ผู้สมัคร ' + (interview.applicantName || interview.applicantId) + ' - อีก ' + Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24)) + ' วัน',
        priority: 'high',
        applicantId: interview.applicantId
      });
      
      // Mark as sent
      interview.reminderSent = true;
      saveInterview(interview);
      reminders++;
    }
  });
  
  return { success: true, reminders: reminders };
}

// ===== STATS =====
function getStats() {
  const applicants = getApplicants();
  const data = applicants.data;
  
  return {
    success: true,
    data: {
      total: data.length,
      new: data.filter(a => a.status === 'new').length,
      screened: data.filter(a => a.status === 'screened').length,
      assessed: data.filter(a => a.status === 'assessed').length,
      interview_selected: data.filter(a => a.status === 'interview_selected').length,
      interviewed: data.filter(a => a.status === 'interviewed').length,
      accepted: data.filter(a => a.status === 'accepted').length,
      rejected: data.filter(a => a.status === 'rejected').length
    }
  };
}

// ===== CONSENT (PDPA) =====
function recordConsent(data) {
  const sheet = getSheet(SHEETS.consents);
  
  data.id = data.id || 'CONSENT-' + Date.now();
  data.timestamp = data.timestamp || new Date().toISOString();
  data.status = 'granted';
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => data[h] !== undefined ? data[h] : '');
  sheet.appendRow(row);
  
  logAudit('CONSENT_GRANTED', data.applicantId, { purposes: data.purposes });
  return { success: true, id: data.id };
}

// ===== AUTH =====
function handleLogin(username, password) {
  const sheet = getSheet(SHEETS.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const user = {};
    headers.forEach((h, j) => user[h] = data[i][j]);
    
    if (user.username === username && user.password === password) {
      const session = {
        token: Utilities.getUuid(),
        username: username,
        role: user.role || 'viewer',
        createdAt: new Date().toISOString()
      };
      
      logAudit('USER_LOGIN', null, { username: username });
      return { success: true, session: session };
    }
  }
  
  logAudit('LOGIN_FAILED', null, { username: username });
  return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

// ===== AUDIT LOG =====
function logAudit(action, applicantId, details) {
  try {
    const sheet = getSheet(SHEETS.audit_log);
    sheet.appendRow([
      'AUDIT-' + Date.now(),
      action,
      applicantId || '',
      JSON.stringify(details),
      Session.getActiveUser().getEmail() || 'anonymous',
      new Date().toISOString()
    ]);
  } catch(e) {
    Logger.log('Audit log error: ' + e);
  }
}

// ===== HELPERS =====
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Initialize headers based on sheet type
    initializeSheet(sheet, name);
  }
  
  return sheet;
}

function initializeSheet(sheet, name) {
  const headersMap = {
    'Applicants': ['id', 'fullName', 'position', 'email', 'phone', 'department', 'applyDate', 'status', 'source', 'notes', 'createdAt', 'updatedAt'],
    'Assessments': ['id', 'applicantId', 'answers', 'scores', 'submittedAt'],
    'Interviews': ['id', 'applicantId', 'applicantName', 'confirmed', 'confirmedAt', 'scheduledDate', 'scheduledTime', 'questions', 'scores', 'reminderSent', 'createdAt'],
    'Notifications': ['id', 'type', 'title', 'message', 'data', 'read', 'priority', 'createdAt'],
    'Consents': ['id', 'applicantId', 'purposes', 'dataTypes', 'duration', 'rightsAcknowledged', 'status', 'timestamp'],
    'AuditLog': ['id', 'action', 'applicantId', 'details', 'user', 'timestamp'],
    'Users': ['username', 'password', 'role', 'email', 'fullName']
  };
  
  const headers = headersMap[name];
  if (headers) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== SETUP FUNCTION =====
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create all sheets
  Object.values(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      initializeSheet(sheet, name);
    }
  });
  
  // Add default users
  const usersSheet = ss.getSheetByName(SHEETS.users);
  if (usersSheet.getLastRow() < 2) {
    usersSheet.appendRow(['admin', 'admin123', 'admin', 'admin@pkg.com', 'ผู้ดูแลระบบ']);
    usersSheet.appendRow(['hr', 'hr123', 'hr', 'hr@pkg.com', 'ฝ่ายบุคคล']);
    usersSheet.appendRow(['interviewer', 'interview123', 'interviewer', 'interviewer@pkg.com', 'ผู้สัมภาษณ์']);
  }
  
  Logger.log('✅ Setup completed!');
  Logger.log('Sheets created: ' + Object.values(SHEETS).join(', '));
}
