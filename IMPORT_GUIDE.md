# คู่มือการนำเข้าข้อมูลผู้สมัครจาก Google Sheet

## 📋 ข้อมูลตั้งต้น

**Google Sheet:** https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74/edit?gid=1144176219#gid=1144176219

⚠️ **ห้ามแก้ไข Sheet เดิม** - ใช้เป็นข้อมูลอ้างอิงเท่านั้น

---

## 🚀 วิธีนำเข้าข้อมูล (สำหรับผู้ปฏิบัติงาน)

### วิธีที่ 1: Export CSV แล้ว Import (แนะนำ)

#### ขั้นตอนที่ 1: Export จาก Google Sheet
1. เปิด Sheet: https://docs.google.com/spreadsheets/d/1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74
2. เลือก tab ที่มีข้อมูลผู้สมัคร (gid=1144176219)
3. คลิก **File → Download → Comma Separated Values (.csv)**
4. บันทึกไฟล์ลงในเครื่อง

#### ขั้นตอนที่ 2: Import เข้าระบบ
1. เปิดระบบ: เปิดไฟล์ `applicants.html` ในเบราว์เซอร์
2. คลิกปุ่ม **"อัพโหลดไฟล์ Excel/CSV"**
3. เลือกไฟล์ CSV ที่ export มา
4. ระบบจะนำเข้าข้อมูลอัตโนมัติ

---

### วิธีที่ 2: Import ผ่าน Apps Script (สำหรับ Admin)

หากต้องการดึงข้อมูลอัตโนมัติผ่าน API:

#### ขั้นตอนที่ 1: สร้าง Apps Script ใน Sheet
1. เปิด Sheet
2. คลิก **Extensions → Apps Script**
3. Copy โค้ดจาก `apps-script/Code.gs` ไปวาง
4. Deploy เป็น Web App

#### ขั้นตอนที่ 2: ดึงข้อมูลเข้าระบบ
1. เปิดไฟล์ `applicants.html`
2. เปิด Console (F12)
3. รันคำสั่ง:
```javascript
fetch('YOUR_APPS_SCRIPT_URL?action=get_applicants')
  .then(r => r.json())
  .then(data => {
    data.data.forEach(applicant => {
      store.saveApplicant({
        fullName: applicant['ชื่อ-นามสกุล'] || applicant['name'],
        position: applicant['ตำแหน่ง'] || applicant['position'],
        email: applicant['Email'] || applicant['email'],
        phone: applicant['เบอร์โทร'] || applicant['phone'],
        department: applicant['แผนก'] || applicant['department'],
        applyDate: applicant['วันที่สมัคร'] || applicant['date'],
        status: 'new'
      });
    });
    renderApplicants();
    alert(`นำเข้าสำเร็จ ${data.data.length} รายการ`);
  });
```

---

## 📊 โครงสร้างข้อมูลที่รองรับ

ระบบรองรับคอลัมน์ทั้งภาษาไทยและอังกฤษ:

| ฟิลด์ | ภาษาไทย | ภาษาอังกฤษ | จำเป็น |
|-------|---------|-----------|--------|
| ชื่อ-นามสกุล | ชื่อ-นามสกุล, ชื่อ | fullName, name | ✅ |
| ตำแหน่ง | ตำแหน่ง | position, jobTitle | ✅ |
| Email | Email, อีเมล์ | email | ❌ |
| เบอร์โทร | เบอร์โทร | phone, telephone | ❌ |
| แผนก | แผนก | department, dept | ❌ |
| วันที่สมัคร | วันที่สมัคร | applyDate, date | ❌ |
| หมายเหตุ | หมายเหตุ | notes, remark | ❌ |

---

## 🔄 การ Sync ข้อมูล

หากต้องการอัปเดตข้อมูลจาก Sheet:

1. Export CSV ใหม่จาก Sheet
2. Import เข้าระบบอีกครั้ง
3. ระบบจะอัปเดตข้อมูลที่มีอยู่และเพิ่มข้อมูลใหม่

⚠️ **หมายเหตุ:** ระบบใช้ localStorage เก็บข้อมูล หาก clear browser data ข้อมูลจะหายไป

---

## 💾 การ Backup ข้อมูล

### Export ข้อมูลออกจากระบบ
1. เปิดหน้า `applicants.html`
2. คลิกปุ่ม **"📤 Export"**
3. ระบบจะดาวน์โหลดไฟล์ JSON พร้อมข้อมูลทั้งหมด

### Import ข้อมูลจาก Backup
1. เปิด Console (F12)
2. รันคำสั่ง:
```javascript
const backupData = JSON.parse('วาง JSON ที่นี่');
store.importAll(backupData);
renderApplicants();
alert('Import สำเร็จ');
```

---

## 📝 หมายเหตุ

- ระบบเก็บข้อมูลใน localStorage ของเบราว์เซอร์
- ข้อมูลจะไม่ sync ระหว่างเครื่อง
- ควร export backup เป็นระยะ
- หากต้องการระบบ database จริง ให้พัฒนาเป็น Google Apps Script + Google Sheets backend

---

## 🆘 การแก้ไขปัญหา

### ข้อมูลไม่แสดงหลัง import
- ตรวจสอบว่าไฟล์ CSV มี header row
- ตรวจสอบว่าคอลัมน์ชื่อตรงกับที่ระบบรองรับ
- เปิด Console (F12) ดู error message

### ข้อมูลหายไป
- ตรวจสอบว่าไม่ได้ clear browser data
- Import จากไฟล์ backup ที่ export ไว้

### ต้องการ reset ข้อมูล
1. เปิดหน้า `applicants.html`
2. คลิกปุ่ม **"🗑️ ล้างข้อมูลทั้งหมด"**
3. Confirm การลบ

---

**สร้างโดย:** KiloClaw 🦾  
**วันที่:** 21 กรกฎาคม 2569
