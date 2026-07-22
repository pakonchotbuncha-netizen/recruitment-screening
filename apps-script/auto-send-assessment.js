/**
 * ระบบส่งแบบทดสอบอัตโนมัติ - Email + LINE + Facebook
 * ใช้ Gmail Apps Script (ฟรี 100 emails/day)
 * 
 * วิธี Deploy:
 * 1. เปิด Google Sheet ที่มีข้อมูลผู้สมัคร
 * 2. Extensions → Apps Script
 * 3. Copy โค้ดนี้ไปวาง
 * 4. Deploy → New deployment → Web app
 * 5. ตั้งค่า Trigger: ทุกวัน 9:00 น.
 */

// ===== CONFIG =====
const SPREADSHEET_ID = '1dH15UxEDyTldPx4lwU5Y6_BQYbTw_gJRMsC4-HCnXR4';
const SHEET_NAME = 'A1_ข้อมูลผู้สมัครทั้งหมด';

// แบบทดสอบ URLs (สร้างแยก 3 ชุด)
const ASSESSMENT_URLS = {
  attitude: 'https://pakonchotbuncha-netizen.github.io/recruitment-screening/test-attitude.html',
  cc: 'https://pakonchotbuncha-netizen.github.io/recruitment-screening/test-cc.html',
  '3e3p': 'https://pakonchotbuncha-netizen.github.io/recruitment-screening/test-3e3p.html'
};

// LINE Messaging API Config (ต้องสร้าง Channel ใน LINE Developers)
const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN';
const LINE_CHANNEL_SECRET = 'YOUR_LINE_CHANNEL_SECRET';

// Facebook Page Config (ต้องสร้าง Page และ App ใน Facebook Developers)
const FB_PAGE_ACCESS_TOKEN = 'YOUR_FB_PAGE_ACCESS_TOKEN';
const FB_PAGE_ID = 'YOUR_FB_PAGE_ID';

// ===== MAIN FUNCTION =====
function sendAssessmentToNewApplicants() {
  Logger.log('🚀 เริ่มส่งแบบทดสอบให้ผู้สมัครใหม่...');
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log('❌ ไม่พบ Sheet: ' + SHEET_NAME);
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  let sentCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const applicant = mapRowToApplicant(row, headers);
    
    // ตรวจสอบว่าส่งแล้วหรือยัง
    if (applicant.assessmentSent === 'YES') {
      skippedCount++;
      continue;
    }
    
    // ตรวจสอบว่ามีข้อมูลติดต่อหรือไม่
    if (!applicant.email && !applicant.lineId && !applicant.facebook) {
      Logger.log('⚠️ ผู้สมัคร ' + applicant.fullName + ' ไม่มีข้อมูลติดต่อ');
      continue;
    }
    
    // ส่งแบบทดสอบ
    let sent = false;
    
    // 1. ส่ง Email (อัตโนมัติ)
    if (applicant.email) {
      sent = sendEmailAssessment(applicant) || sent;
    }
    
    // 2. ส่ง LINE (อัตโนมัติ)
    if (applicant.lineId) {
      sent = sendLineAssessment(applicant) || sent;
    }
    
    // 3. ส่ง Facebook (อัตโนมัติ)
    if (applicant.facebook) {
      sent = sendFacebookAssessment(applicant) || sent;
    }
    
    if (sent) {
      // อัปเดตสถานะใน Sheet
      sheet.getRange(i + 2, headers.indexOf('assessmentSent') + 1).setValue('YES');
      sheet.getRange(i + 2, headers.indexOf('assessmentSentDate') + 1).setValue(new Date());
      sentCount++;
      
      Logger.log('✅ ส่งแบบทดสอบให้ ' + applicant.fullName + ' สำเร็จ');
    }
    
    // จำกัด 100 emails/day
    if (sentCount >= 100) {
      Logger.log('⚠️ ส่งครบ 100 emails แล้ว หยุดส่งวันนี้');
      break;
    }
  }
  
  Logger.log('📊 สรุป: ส่ง ' + sentCount + ' คน, ข้าม ' + skippedCount + ' คน');
}

// ===== SEND EMAIL =====
function sendEmailAssessment(applicant) {
  try {
    const subject = '📝 แบบทดสอบผู้สมัคร - บริษัท PKG';
    
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">สวัสดีคุณ ${applicant.fullName}</h2>
        
        <p>ขอบคุณที่สนใจร่วมงานกับบริษัท PKG</p>
        
        <p>กรุณาทำแบบทดสอบออนไลน์ 3 ชุด เพื่อประเมินคุณสมบัติ:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #9c27b0;">📋 แบบทดสอบ 3 ชุด:</h3>
          
          <p><strong>1. 🎯 แบบทดสอบทัศนคติ (5 ข้อ)</strong><br>
          <a href="${ASSESSMENT_URLS.attitude}?token=${applicant.id}" style="color: #1976d2;">คลิกที่นี่เพื่อทำแบบทดสอบ</a></p>
          
          <p><strong>2. 🏢 แบบทดสอบทุนองค์กร CC (7 ข้อ)</strong><br>
          <a href="${ASSESSMENT_URLS.cc}?token=${applicant.id}" style="color: #1976d2;">คลิกที่นี่เพื่อทำแบบทดสอบ</a></p>
          
          <p><strong>3. 📊 แบบทดสอบ 3E3P (6 ข้อ)</strong><br>
          <a href="${ASSESSMENT_URLS['3e3p']}?token=${applicant.id}" style="color: #1976d2;">คลิกที่นี่เพื่อทำแบบทดสอบ</a></p>
        </div>
        
        <p><strong>⏰ ระยะเวลา:</strong> 30 นาทีต่อชุด</p>
        <p><strong>📅 กำหนดส่ง:</strong> ภายใน 3 วัน</p>
        
        <p style="color: #666; font-size: 12px;">
          หากมีคำถามหรือปัญหา กรุณาติดต่อฝ่าย HR<br>
          Email: hr@pkg.com | Tel: 02-xxx-xxxx
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 11px;">
          อีเมลนี้ส่งอัตโนมัติจากระบบรับสมัครงาน PKG<br>
          กรุณาอย่าตอบกลับอีเมลนี้
        </p>
      </div>
    `;
    
    GmailApp.sendEmail(
      applicant.email,
      subject,
      'กรุณาเปิดอีเมลนี้ในโปรแกรมที่รองรับ HTML',
      {
        htmlBody: htmlBody,
        name: 'ฝ่ายบุคคล PKG'
      }
    );
    
    return true;
  } catch (error) {
    Logger.log('❌ ส่ง Email ล้มเหลว: ' + error.message);
    return false;
  }
}

// ===== SEND LINE =====
function sendLineAssessment(applicant) {
  try {
    const message = `📝 แบบทดสอบผู้สมัคร - บริษัท PKG\n\n` +
                    `สวัสดีคุณ ${applicant.fullName}\n\n` +
                    `กรุณาทำแบบทดสอบออนไลน์ 3 ชุด:\n\n` +
                    `1. 🎯 ทัศนคติ (5 ข้อ)\n${ASSESSMENT_URLS.attitude}?token=${applicant.id}\n\n` +
                    `2. 🏢 ทุนองค์กร CC (7 ข้อ)\n${ASSESSMENT_URLS.cc}?token=${applicant.id}\n\n` +
                    `3. 📊 3E3P (6 ข้อ)\n${ASSESSMENT_URLS['3e3p']}?token=${applicant.id}\n\n` +
                    `⏰ ระยะเวลา: 30 นาทีต่อชุด\n` +
                    `📅 กำหนดส่ง: ภายใน 3 วัน`;
    
    const url = 'https://api.line.me/v2/bot/message/push';
    const payload = {
      to: applicant.lineId,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      Logger.log('❌ ส่ง LINE ล้มเหลว: ' + response.getContentText());
      return false;
    }
  } catch (error) {
    Logger.log('❌ ส่ง LINE ล้มเหลว: ' + error.message);
    return false;
  }
}

// ===== SEND FACEBOOK =====
function sendFacebookAssessment(applicant) {
  try {
    const message = `📝 แบบทดสอบผู้สมัคร - บริษัท PKG\n\n` +
                    `สวัสดีคุณ ${applicant.fullName}\n\n` +
                    `กรุณาทำแบบทดสอบออนไลน์ 3 ชุด:\n\n` +
                    `1. 🎯 ทัศนคติ (5 ข้อ)\n${ASSESSMENT_URLS.attitude}?token=${applicant.id}\n\n` +
                    `2. 🏢 ทุนองค์กร CC (7 ข้อ)\n${ASSESSMENT_URLS.cc}?token=${applicant.id}\n\n` +
                    `3. 📊 3E3P (6 ข้อ)\n${ASSESSMENT_URLS['3e3p']}?token=${applicant.id}\n\n` +
                    `⏰ ระยะเวลา: 30 นาทีต่อชุด\n` +
                    `📅 กำหนดส่ง: ภายใน 3 วัน`;
    
    const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: {
        id: applicant.facebook
      },
      message: {
        text: message
      }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      return true;
    } else {
      Logger.log('❌ ส่ง Facebook ล้มเหลว: ' + response.getContentText());
      return false;
    }
  } catch (error) {
    Logger.log('❌ ส่ง Facebook ล้มเหลว: ' + error.message);
    return false;
  }
}

// ===== HELPER FUNCTIONS =====
function mapRowToApplicant(row, headers) {
  const applicant = {};
  
  headers.forEach((header, index) => {
    const value = row[index];
    
    // Map ข้อมูลตาม header names
    if (header.includes('ชื่อ') || header.includes('name')) {
      applicant.fullName = value;
    } else if (header.includes('email') || header.includes('อีเมล์')) {
      applicant.email = value;
    } else if (header.includes('line') || header.includes('ไลน์')) {
      applicant.lineId = value;
    } else if (header.includes('facebook') || header.includes('fb')) {
      applicant.facebook = value;
    } else if (header.includes('เบอร์') || header.includes('โทร') || header.includes('phone')) {
      applicant.phone = value;
    } else if (header.includes('running') || header.includes('รหัส')) {
      applicant.id = value;
    } else if (header === 'assessmentSent') {
      applicant.assessmentSent = value;
    }
  });
  
  // ถ้าไม่มี id ให้สร้างจาก fullName
  if (!applicant.id && applicant.fullName) {
    applicant.id = Utilities.getUuid();
  }
  
  return applicant;
}

// ===== SETUP FUNCTION =====
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log('❌ ไม่พบ Sheet: ' + SHEET_NAME);
    return;
  }
  
  // เพิ่มคอลัมน์สำหรับติดตามสถานะ
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  if (!headers.includes('assessmentSent')) {
    sheet.getRange(1, lastCol + 1).setValue('assessmentSent');
    sheet.getRange(1, lastCol + 2).setValue('assessmentSentDate');
    sheet.getRange(1, lastCol + 3).setValue('attitudeScore');
    sheet.getRange(1, lastCol + 4).setValue('ccScore');
    sheet.getRange(1, lastCol + 5).setValue('3e3pScore');
    sheet.getRange(1, lastCol + 6).setValue('skillScore');
    
    Logger.log('✅ เพิ่มคอลัมน์ติดตามสถานะแล้ว');
  }
  
  // ตั้งค่า Trigger: ส่งอัตโนมัติทุกวัน 9:00 น.
  ScriptApp.newTrigger('sendAssessmentToNewApplicants')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  Logger.log('✅ ตั้งค่า Trigger สำเร็จ (ส่งอัตโนมัติทุกวัน 9:00 น.)');
}

// ===== TEST FUNCTION =====
function testSendEmail() {
  const testApplicant = {
    id: 'TEST-001',
    fullName: 'ทดสอบ ระบบ',
    email: 'test@example.com'
  };
  
  const result = sendEmailAssessment(testApplicant);
  Logger.log('ผลทดสอบ: ' + (result ? '✅ สำเร็จ' : '❌ ล้มเหลว'));
}
