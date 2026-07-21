# คู่มือ Deploy แบบง่ายที่สุด (5 นาที)

## 📋 สิ่งที่ต้องเตรียม

1. ✅ เปิด Google Sheet: https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74
2. ✅ มีสิทธิ์แก้ไข Sheet (Owner หรือ Editor)

---

## 🚀 ขั้นตอนการ Deploy (ทำตามทีละขั้น)

### ขั้นตอนที่ 1: เปิด Apps Script

1. เปิด Google Sheet ด้านบน
2. มองหาเมนู **"ส่วนขยาย"** (Extensions) ที่ด้านบน
3. คลิก **"Apps Script"**

![ขั้นตอนที่ 1](https://i.imgur.com/placeholder1.png)

---

### ขั้นตอนที่ 2: Copy โค้ด Backend

1. ในหน้า Apps Script จะเห็นไฟล์ `Code.gs`
2. **ลบโค้ดเดิมทั้งหมด** (Ctrl+A → Delete)
3. เปิดไฟล์นี้ในเครื่องของคุณ:
   ```
   /root/.openclaw/workspace/recruitment-screening/gas-backend/Code.gs
   ```
4. **Copy โค้ดทั้งหมด** (Ctrl+A → Ctrl+C)
5. **วางใน Apps Script** (Ctrl+V)
6. กด **บันทึก** (Ctrl+S) หรือคลิกไอคอน 💾

![ขั้นตอนที่ 2](https://i.imgur.com/placeholder2.png)

---

### ขั้นตอนที่ 3: สร้างไฟล์ HTML

1. ใน Apps Script ด้านซ้ายมือ คลิก **"+"** ข้าง "Files"
2. เลือก **"HTML"**
3. ตั้งชื่อไฟล์: **`Index`** (ไม่ต้องใส่ .html)
4. **ลบโค้ดเดิมทั้งหมด**
5. เปิดไฟล์นี้ในเครื่องของคุณ:
   ```
   /root/.openclaw/workspace/recruitment-screening/gas-backend/Index.html
   ```
6. **Copy โค้ดทั้งหมด**
7. **วางใน Apps Script**
8. กด **บันทึก** (Ctrl+S)

![ขั้นตอนที่ 3](https://i.imgur.com/placeholder3.png)

---

### ขั้นตอนที่ 4: รัน Setup

1. ใน Apps Script มองหา dropdown ที่เขียนว่า **"เลือกฟังก์ชัน"**
2. เลือก **`setup`**
3. คลิกปุ่ม **"Run"** ▶️ (สีฟ้า)
4. รอจนเห็น **"การดำเนินการเสร็จสมบูรณ์"**
5. ถ้าถูกถามว่า **"อนุญาตสิทธิ์"** → คลิก **"อนุญาต"**

![ขั้นตอนที่ 4](https://i.imgur.com/placeholder4.png)

---

### ขั้นตอนที่ 5: Deploy เป็น Web App

1. คลิกปุ่ม **"Deploy"** (มุมขวาบน)
2. เลือก **"New deployment"** (การ deploy ใหม่)
3. คลิกไอคอน **⚙️** ข้าง "Select type"
4. เลือก **"Web app"**
5. กรอกข้อมูล:
   - **Description**: `ระบบคัดกรอง v1.0`
   - **Execute as**: เลือก **"Me"** (ฉัน)
   - **Who has access**: เลือก **"Anyone"** (ทุกคน)
6. คลิก **"Deploy"**

![ขั้นตอนที่ 5](https://i.imgur.com/placeholder5.png)

---

### ขั้นตอนที่ 6: Copy URL

1. รอจนเห็นหน้าต่าง **"New deployment"**
2. **Copy URL** ที่แสดง (เช่น `https://script.google.com/macros/s/AKfycbx.../exec`)
3. คลิก **"Done"**
4. **ส่ง URL นี้ให้ผู้ปฏิบัติงานทุกคน**

![ขั้นตอนที่ 6](https://i.imgur.com/placeholder6.png)

---

## ✅ เสร็จสิ้น!

ผู้ปฏิบัติงานสามารถ:
1. เปิด URL
2. Login ด้วย:
   - Admin: `admin` / `admin123`
   - HR: `hr` / `hr123`
   - Interviewer: `interviewer` / `interview123`
3. ทำงานร่วมกันได้ทันที!

---

## 🆘 ถ้าติดปัญหา

### ปัญหา: ไม่เห็นเมนู "ส่วนขยาย"
- ตรวจสอบว่าคุณกำลังใช้ Google Account ส่วนตัว (ไม่ใช่ Workspace)
- หรือลองใช้ Chrome browser

### ปัญหา: ไม่สามารถรัน setup ได้
- ตรวจสอบว่ามีสิทธิ์แก้ไข Sheet
- ลอง refresh หน้าเว็บแล้วทำใหม่

### ปัญหา: Deploy ไม่สำเร็จ
- ตรวจสอบว่าเลือก "Anyone" ใน "Who has access"
- ลอง Deploy ใหม่อีกครั้ง

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าทำตามแล้วติดปัญหา:
1. ถ่ายภาพหน้าจอที่ติดปัญหา
2. ส่งมาในแชทนี้
3. ผมจะช่วยแก้ให้ทันที!

---

**สร้างโดย:** KiloClaw 🦾  
**วันที่:** 21 กรกฎาคม 2569
