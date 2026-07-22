# คู่มือ Setup ระบบส่งแบบทดสอบอัตโนมัติ
## LINE Messaging API + Facebook Messenger + Gmail Apps Script

---

## 📋 สิ่งที่ต้องเตรียม

### 1. LINE Messaging API
- LINE Developers Account (ฟรี)
- Messaging API Channel (ฟรี 5,000 messages/เดือน)
- Channel Access Token

### 2. Facebook Messenger
- Facebook Page (ฟรี)
- Facebook App (ฟรี)
- Page Access Token

### 3. Gmail Apps Script
- Google Account (ฟรี)
- Gmail Apps Script (ฟรี 100 emails/day)

---

## 🔧 Part 1: Setup LINE Messaging API

### ขั้นตอนที่ 1: สร้าง LINE Developers Account

1. เปิด https://developers.line.biz/
2. คลิก **"Log in"** (มุมขวาบน)
3. Login ด้วย LINE Account ส่วนตัว
4. ยอมรับ Terms of Use

### ขั้นตอนที่ 2: สร้าง Provider

1. คลิก **"Console"** (มุมขวาบน)
2. คลิก **"Create a new provider"**
3. กรอกข้อมูล:
   - **Provider name**: `PKG Recruitment`
   - **Email**: `hr@pkg.com`
4. คลิก **"Create"**

### ขั้นตอนที่ 3: สร้าง Messaging API Channel

1. คลิก **"Create a Messaging API channel"**
2. กรอกข้อมูล:
   - **Channel type**: Messaging API
   - **Provider**: `PKG Recruitment`
   - **Channel name**: `PKG Recruitment Bot`
   - **Channel description**: `ส่งแบบทดสอบผู้สมัคร`
   - **Category**: `Service`
   - **Subcategory**: `Recruitment`
3. คลิก **"Create"**
4. ยอมรับ Terms of Use

### ขั้นตอนที่ 4: ได้ Channel Access Token

1. ในหน้า Channel settings
2. เลื่อนลงมาหา **"Messaging API"**
3. คลิก **"Issue"** ข้าง **Channel access token (long-lived)**
4. **Copy Token** (จะยาวมาก ประมาณ 200 ตัวอักษร)
5. **บันทึก Token** ไว้ในไฟล์ปลอดภัย

**ตัวอย่าง Token:**
```
eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaW5lIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE2OTAwMDAwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ขั้นตอนที่ 5: เพิ่ม Bot เป็นเพื่อน

1. ในหน้า Channel settings
2. หา **"Your bot's basic ID"**
3. จะเห็น QR Code หรือ LINE ID ของ Bot
4. **เพิ่ม Bot เป็นเพื่อน** ด้วย LINE ส่วนตัว
5. ทดสอบส่งข้อความหา Bot

### ขั้นตอนที่ 6: ใส่ Token ในโค้ด

เปิดไฟล์ `apps-script/auto-send-assessment.js`

หาบรรทัดนี้:
```javascript
const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_L…OKEN';
```

แทนที่ด้วย Token ที่ได้จากขั้นตอนที่ 4:
```javascript
const LINE_CHANNEL_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9...';
```

---

## 🔧 Part 2: Setup Facebook Messenger

### ขั้นตอนที่ 1: สร้าง Facebook Page

1. เปิด https://www.facebook.com/
2. Login ด้วย Facebook ส่วนตัว
3. คลิก **"Create"** (มุมขวาบน)
4. เลือก **"Page"**
5. กรอกข้อมูล:
   - **Page name**: `PKG Recruitment`
   - **Category**: `Human Resources`
   - **Description**: `ฝ่ายบุคคล PKG`
6. คลิก **"Create Page"**

### ขั้นตอนที่ 2: สร้าง Facebook App

1. เปิด https://developers.facebook.com/
2. คลิก **"My Apps"** (มุมขวาบน)
3. คลิก **"Create App"**
4. เลือก **"Business"**
5. กรอกข้อมูล:
   - **App name**: `PKG Recruitment Bot`
   - **Contact email**: `hr@pkg.com`
6. คลิก **"Create App"**

### ขั้นตอนที่ 3: เพิ่ม Messenger Product

1. ในหน้า App Dashboard
2. เลื่อนลงมาหา **"Add products to your app"**
3. หา **"Messenger"**
4. คลิก **"Set up"**

### ขั้นตอนที่ 4: ได้ Page Access Token

1. ในหน้า Messenger settings
2. เลื่อนลงมาหา **"Access Tokens"**
3. คลิก **"Add or remove pages"**
4. เลือก Page `PKG Recruitment`
5. ยอมรับ permissions
6. คลิก **"Generate Token"** ข้าง Page
7. **Copy Token** (จะยาวมาก)
8. **บันทึก Token** ไว้ในไฟล์ปลอดภัย

**ตัวอย่าง Token:**
```
EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ขั้นตอนที่ 5: ตั้งค่า Webhook (Optional)

**หมายเหตุ:** สำหรับระบบส่งข้อความอย่างเดียว ไม่ต้องตั้งค่า Webhook

ถ้าต้องการรับข้อความจากผู้ใช้:
1. ในหน้า Messenger settings
2. หา **"Webhooks"**
3. คลิก **"Add Callback URL"**
4. กรอก Callback URL (ต้องเป็น HTTPS)
5. Verify Token: `PKG_VERIFY_TOKEN`
6. คลิก **"Verify and Save"**

### ขั้นตอนที่ 6: ใส่ Token ในโค้ด

เปิดไฟล์ `apps-script/auto-send-assessment.js`

หาบรรทัดนี้:
```javascript
const FB_PAGE_ACCESS_TOKEN = 'YOUR_F…OKEN';
const FB_PAGE_ID = 'YOUR_FB_PAGE_ID';
```

แทนที่ด้วย:
```javascript
const FB_PAGE_ACCESS_TOKEN = 'EAAxxxxxxxxxxxxxxxx...';
const FB_PAGE_ID = '123456789012345'; // หา Page ID ได้จาก Page settings
```

**วิธีหา Page ID:**
1. เปิด Facebook Page
2. คลิก **"About"**
3. เลื่อนลงมาหา **"Page ID"**
4. หรือดูจาก URL: `https://www.facebook.com/PKG-Recruitment-123456789012345`

---

## 🔧 Part 3: Deploy Gmail Apps Script

### ขั้นตอนที่ 1: เปิด Google Sheet

1. เปิด Google Sheet ที่มีข้อมูลผู้สมัคร
2. URL: `https://docs.google.com/spreadsheets/d/1dH15UxEDyTldPx4lwU5Y6_BQYbTw_gJRMsC4-HCnXR4`

### ขั้นตอนที่ 2: เปิด Apps Script

1. คลิกเมนู **"Extensions"**
2. เลือก **"Apps Script"**

### ขั้นตอนที่ 3: Copy โค้ด

1. ลบโค้ดเดิมทั้งหมด
2. Copy โค้ดจาก `apps-script/auto-send-assessment.js`
3. วางใน Apps Script editor

### ขั้นตอนที่ 4: แก้ไข Config

หาบรรทัดเหล่านี้และแก้ไข:

```javascript
const SPREADSHEET_ID = '1dH15UxEDyTldPx4lwU5Y6_BQYbTw_gJRMsC4-HCnXR4';
const SHEET_NAME = 'A1_ข้อมูลผู้สมัครทั้งหมด';
```

### ขั้นตอนที่ 5: บันทึกและทดสอบ

1. คลิก **"Save"** (💾)
2. ตั้งชื่อ project: `Recruitment Auto Send`
3. เลือก function: `testSendEmail`
4. คลิก **"Run"** (▶️)
5. อนุญาตสิทธิ์:
   - คลิก **"Review permissions"**
   - เลือก Google Account
   - คลิก **"Advanced"**
   - คลิก **"Go to Recruitment Auto Send (unsafe)"**
   - คลิก **"Allow"**

### ขั้นตอนที่ 6: ตั้ง Trigger อัตโนมัติ

1. คลิกไอคอน **"Triggers"** (⏰) ด้านซ้าย
2. คลิก **"+ Add Trigger"**
3. ตั้งค่า:
   - **Choose which function to run**: `sendAssessmentToNewApplicants`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Day timer`
   - **Select time of day**: `9am to 10am`
4. คลิก **"Save"**

### ขั้นตอนที่ 7: ทดสอบระบบ

1. เพิ่มข้อมูลผู้สมัครทดสอบใน Sheet:
   - ชื่อ: `ทดสอบ ระบบ`
   - Email: `test@example.com`
   - assessmentSent: (ว่าง)
2. รอจนถึง 9:00 น. หรือคลิก **"Run"** ที่ function `sendAssessmentToNewApplicants`
3. ตรวจสอบ Email ว่าได้รับแบบทดสอบหรือไม่

---

## 📊 Part 4: ตรวจสอบและติดตาม

### ตรวจสอบการส่ง

1. เปิด Google Sheet
2. ดูคอลัมน์ `assessmentSent`:
   - `YES` = ส่งแล้ว
   - (ว่าง) = ยังไม่ส่ง
3. ดูคอลัมน์ `assessmentSentDate`: วันที่ส่ง

### ตรวจสอบคะแนน

1. เปิด `hr-dashboard.html`
2. ดูสถิติ:
   - ผู้สมัครทั้งหมด
   - ส่งแล้ว
   - ทำเสร็จแล้ว
3. คลิก **"ดูผลคะแนน"** เพื่อดูรายละเอียด

---

## 🐛 Troubleshooting

### ปัญหา: ส่ง Email ไม่ได้

**สาเหตุ:**
- Gmail Apps Script จำกัด 100 emails/day
- Email ไม่ถูกต้อง

**วิธีแก้:**
- รอวันถัดไป
- ตรวจสอบ Email address

### ปัญหา: ส่ง LINE ไม่ได้

**สาเหตุ:**
- Channel Access Token หมดอายุ
- ผู้สมัครไม่ได้เพิ่ม Bot เป็นเพื่อน

**วิธีแก้:**
- Issue Token ใหม่ (ทุก 30 วัน)
- แจ้งผู้สมัครเพิ่ม Bot เป็นเพื่อน

### ปัญหา: ส่ง Facebook ไม่ได้

**สาเหตุ:**
- Page Access Token หมดอายุ
- ผู้สมัครไม่ได้ message Page ก่อน

**วิธีแก้:**
- Generate Token ใหม่
- แจ้งผู้สมัคร message Page ก่อน

---

## 📞 ติดต่อขอความช่วยเหลือ

ถ้าติดปัญหา:
1. ตรวจสอบคู่มืออีกครั้ง
2. ดู Logs ใน Apps Script
3. ติดต่อ KiloClaw ในแชท PADClaw

---

**สร้างโดย:** KiloClaw 🦾  
**วันที่:** 22 กรกฎาคม 2569
