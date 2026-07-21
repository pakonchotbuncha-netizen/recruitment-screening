# คู่มือการ Deploy ระบบคัดกรองและสัมภาษณ์

## 📋 สิ่งที่ต้องทำ

### ขั้นตอนที่ 1: สร้าง Google Apps Script Project

1. เปิด Google Sheet หลัก: https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74
2. ไปที่ **Extensions → Apps Script**
3. ตั้งชื่อ project: `ระบบคัดกรองและสัมภาษณ์`

### ขั้นตอนที่ 2: Copy โค้ด Backend

1. เปิดไฟล์ `gas-backend/Code.gs`
2. Copy โค้ดทั้งหมดไปวางใน Apps Script editor
3. บันทึก (Ctrl+S)

### ขั้นตอนที่ 3: รัน Setup

1. ใน Apps Script editor เลือก function `setup`
2. กด **Run** ▶️
3. อนุญาตสิทธิ์เมื่อถูกถาม
4. ตรวจสอบว่าสร้าง sheets ใหม่ครบ 7 sheets:
   - Applicants
   - Assessments
   - Interviews
   - Notifications
   - Consents
   - AuditLog
   - Users

### ขั้นตอนที่ 4: Deploy เป็น Web App

1. กด **Deploy → New deployment**
2. เลือก type: **Web app**
3. ตั้งค่า:
   - Description: `ระบบคัดกรองและสัมภาษณ์ v1.0`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. กด **Deploy**
5. **Copy URL ที่ได้** (เช่น `https://script.google.com/macros/s/AKfycbx.../exec`)

### ขั้นตอนที่ 5: สร้าง Frontend

1. ใน Apps Script editor กด **+ → HTML**
2. ตั้งชื่อไฟล์: `Index`
3. Copy โค้ดจาก `gas-backend/Index.html` ไปวาง
4. บันทึก

### ขั้นตอนที่ 6: ทดสอบระบบ

1. เปิด URL ที่ deploy ได้
2. เข้าสู่ระบบด้วย:
   - Admin: `admin` / `admin123`
   - HR: `hr` / `hr123`
   - Interviewer: `interviewer` / `interview123`
3. ทดสอบฟีเจอร์ต่างๆ

### ขั้นตอนที่ 7: แชร์ URL ให้ผู้ปฏิบัติงาน

ส่ง URL ที่ deploy ให้ผู้ปฏิบัติงานทุกคน
- ผู้ปฏิบัติงานสามารถเปิด URL และทำงานร่วมกันได้
- ข้อมูลจะ sync แบบ real-time ผ่าน Google Sheets
- ทุกคนเห็นข้อมูลเดียวกัน

## 🔧 การตั้งค่าเพิ่มเติม

### เปลี่ยนรหัสผ่าน

แก้ไขใน sheet `Users`:
| username | password | role | email | fullName |
|----------|----------|------|-------|----------|
| admin | newpassword | admin | admin@pkg.com | ผู้ดูแลระบบ |

### เพิ่มผู้ใช้งาน

เพิ่มแถวใหม่ใน sheet `Users`:
| username | password | role | email | fullName |
|----------|----------|------|-------|----------|
| newuser | password123 | hr | user@pkg.com | ชื่อผู้ใช้ |

### Roles และสิทธิ์

- **admin**: จัดการทุกอย่าง
- **hr**: จัดการผู้สมัคร, สัมภาษณ์, รายงาน
- **interviewer**: ดูผู้สมัคร, ให้คะแนนสัมภาษณ์
- **viewer**: ดูอย่างเดียว

## 📊 โครงสร้างข้อมูล

### Sheet: Applicants
| id | fullName | position | email | phone | department | applyDate | status | source | notes | createdAt | updatedAt |
|----|----------|----------|-------|-------|------------|-----------|--------|--------|-------|-----------|-----------|

### Sheet: Assessments
| id | applicantId | answers | scores | submittedAt |
|----|-------------|---------|--------|-------------|

### Sheet: Interviews
| id | applicantId | applicantName | confirmed | confirmedAt | scheduledDate | scheduledTime | questions | scores | reminderSent | createdAt |
|----|-------------|---------------|-----------|-------------|---------------|---------------|-----------|--------|--------------|-----------|

### Sheet: Notifications
| id | type | title | message | data | read | priority | createdAt |
|----|------|-------|---------|------|------|----------|-----------|

### Sheet: Consents (PDPA)
| id | applicantId | purposes | dataTypes | duration | rightsAcknowledged | status | timestamp |
|----|-------------|----------|-----------|----------|-------------------|--------|-----------|

### Sheet: AuditLog
| id | action | applicantId | details | user | timestamp |
|----|--------|-------------|---------|------|-----------|

### Sheet: Users
| username | password | role | email | fullName |
|----------|----------|------|-------|----------|

## 🔄 การอัปเดตระบบ

### อัปเดต Frontend

1. เปิด Apps Script project
2. แก้ไขไฟล์ `Index.html`
3. บันทึก
4. ระบบจะอัปเดตทันที (ไม่ต้อง redeploy)

### อัปเดต Backend

1. เปิด Apps Script project
2. แก้ไขไฟล์ `Code.gs`
3. บันทึก
4. **ต้อง Deploy ใหม่**:
   - Deploy → Manage deployments
   - กด Edit (ดินสอ)
   - Version: **New version**
   - Deploy

## 🛡️ ความปลอดภัย

### PDPA Compliance

- ข้อมูลผู้สมัครเก็บใน Google Sheets (ปลอดภัย)
- มี Consent tracking
- Audit log ทุกการกระทำ
- ผู้สมัครสามารถขอเข้าถึง/ลบข้อมูลได้

### การเข้าถึง

- ใช้ Google Account authentication
- Rate limiting (ป้องกัน brute force)
- Audit log ทุกการเข้าถึง
- HTTPS เท่านั้น

## 📞 การแก้ไขปัญหา

### ปัญหา: URL ไม่ทำงาน

- ตรวจสอบว่า Deploy สำเร็จ
- ตรวจสอบว่า "Who has access" เป็น "Anyone"
- ลอง Deploy ใหม่

### ปัญหา: ข้อมูลไม่อัปเดต

- Refresh หน้าเว็บ (Ctrl+F5)
- ตรวจสอบ Console (F12) ว่ามี error หรือไม่
- ตรวจสอบว่า API URL ถูกต้อง

### ปัญหา: ไม่สามารถเข้าระบบได้

- ตรวจสอบ username/password ใน sheet `Users`
- ตรวจสอบว่า function `setup` รันสำเร็จ
- ดู AuditLog ว่ามี error อะไร

## 📈 การ Monitor

### ดูสถิติ

เปิด sheet `AuditLog` เพื่อดู:
- ใครเข้าระบบเมื่อไหร่
- ใครแก้ไขข้อมูลอะไร
- มี error อะไรบ้าง

### ดูการแจ้งเตือน

เปิด sheet `Notifications` เพื่อดู:
- การแจ้งเตือนทั้งหมด
- สถานะการอ่าน

## 🎯 ขั้นตอนต่อไป

1. ✅ Deploy ระบบ
2. ✅ ทดสอบกับข้อมูลตัวอย่าง
3. ✅ ฝึกอบรมผู้ปฏิบัติงาน
4. ✅ นำเข้าข้อมูลจริงจาก Sheet เดิม
5. ✅ เริ่มใช้งานจริง

## 📝 หมายเหตุ

- ระบบใช้ Google Sheets เป็นฐานข้อมูล (ฟรี, ปลอดภัย, reliable)
- สามารถรองรับผู้ใช้งานได้หลายคนพร้อมกัน
- ข้อมูล sync แบบ real-time
- ไม่ต้องติดตั้ง server เพิ่มเติม
- ใช้ Google Account ที่มีอยู่แล้ว

---

**สร้างโดย:** KiloClaw 🦾  
**วันที่:** 21 กรกฎาคม 2569
