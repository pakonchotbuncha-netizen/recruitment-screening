// real-time-sync.js - Real-time Sync with Google Sheets
// ดึงข้อมูลจาก Sheet อัตโนมัติเมื่อมีผู้สมัครใหม่

class RealTimeSync {
  constructor() {
    this.sheetId = '1p_KWMT8PfBHRVUUuvUQTO1JBdHoHQFhHtbKwWj_ev74';
    this.gid = '1144176219';
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.syncStatus = 'idle'; // idle, syncing, error, success
    this.webhookUrl = null; // สำหรับรับ notification จาก Sheet
  }

  /**
   * เริ่มการ sync อัตโนมัติ
   * @param {number} intervalMs - ช่วงเวลาในการ sync (milliseconds)
   */
  startAutoSync(intervalMs = 60000) { // Default: 1 minute
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    console.log('🔄 Starting auto-sync every', intervalMs / 1000, 'seconds');
    
    // Sync ทันที
    this.syncFromSheet();
    
    // ตั้ง interval
    this.syncInterval = setInterval(() => {
      this.syncFromSheet();
    }, intervalMs);
    
    this.syncStatus = 'syncing';
  }

  /**
   * หยุดการ sync อัตโนมัติ
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
    this.syncStatus = 'idle';
  }

  /**
   * Sync ข้อมูลจาก Google Sheet
   */
  async syncFromSheet() {
    try {
      this.syncStatus = 'syncing';
      console.log('🔄 Syncing from Google Sheet...');
      
      // ดึงข้อมูลจาก Sheet ผ่าน Apps Script API
      const response = await this.fetchFromSheet();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data');
      }
      
      const sheetData = response.data;
      const sheetColumns = response.columns;
      
      // เปรียบเทียบกับข้อมูลปัจจุบัน
      const currentData = store.getApplicants();
      const { toAdd, toUpdate, toDelete } = this.compareData(currentData, sheetData);
      
      // อัปเดตข้อมูล
      if (toAdd.length > 0) {
        console.log(`➕ Adding ${toAdd.length} new applicants`);
        toAdd.forEach(applicant => {
          store.saveApplicant(applicant);
        });
      }
      
      if (toUpdate.length > 0) {
        console.log(`🔄 Updating ${toUpdate.length} applicants`);
        toUpdate.forEach(applicant => {
          store.saveApplicant(applicant);
        });
      }
      
      if (toDelete.length > 0) {
        console.log(`🗑️ Removing ${toDelete.length} applicants`);
        toDelete.forEach(id => {
          store.deleteApplicant(id);
        });
      }
      
      // บันทึกเวลา sync ล่าสุด
      this.lastSyncTime = new Date().toISOString();
      this.syncStatus = 'success';
      
      // บันทึก audit log
      pdpa.logAudit('DATA_SYNC', null, {
        added: toAdd.length,
        updated: toUpdate.length,
        deleted: toDelete.length,
        timestamp: this.lastSyncTime
      });
      
      console.log('✅ Sync completed successfully');
      
      // Trigger event
      this.triggerSyncEvent('success', {
        added: toAdd.length,
        updated: toUpdate.length,
        deleted: toDelete.length
      });
      
      return {
        success: true,
        added: toAdd.length,
        updated: toUpdate.length,
        deleted: toDelete.length
      };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.syncStatus = 'error';
      
      // Trigger event
      this.triggerSyncEvent('error', { error: error.message });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ดึงข้อมูลจาก Sheet ผ่าน Apps Script API
   */
  async fetchFromSheet() {
    // ในสภาพแวดล้อมจริง ต้องมี Apps Script URL
    // ตัวอย่าง: const apiUrl = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
    
    const apiUrl = localStorage.getItem('sheet_api_url');
    
    if (!apiUrl) {
      // ถ้าไม่มี API URL ให้ใช้ mock data
      console.warn('⚠️ No API URL configured, using mock data');
      return this.getMockData();
    }
    
    try {
      const response = await fetch(`${apiUrl}?action=get_applicants`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch from Sheet:', error);
      throw error;
    }
  }

  /**
   * Mock data สำหรับทดสอบ
   */
  getMockData() {
    return {
      success: true,
      data: [
        {
          'รหัสผู้สมัคร': 'A1-001',
          'ชื่อ-นามสกุล': 'สมชาย ใจดี',
          'ตำแหน่ง': 'Software Engineer',
          'Email': 'somchai@example.com',
          'เบอร์โทร': '0812345678',
          'แผนก': 'IT',
          'วันที่สมัคร': '2026-03-15',
          'สถานะ': 'ใหม่'
        },
        // เพิ่มข้อมูลทดสอบอื่นๆ ที่นี่
      ],
      columns: ['รหัสผู้สมัคร', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'Email', 'เบอร์โทร', 'แผนก', 'วันที่สมัคร', 'สถานะ'],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * เปรียบเทียบข้อมูลระหว่างระบบกับ Sheet
   */
  compareData(currentData, sheetData) {
    const toAdd = [];
    const toUpdate = [];
    const toDelete = [];
    
    // สร้าง map ของข้อมูลปัจจุบัน
    const currentMap = new Map();
    currentData.forEach(applicant => {
      const key = applicant.id || applicant.fullName;
      currentMap.set(key, applicant);
    });
    
    // สร้าง map ของข้อมูลจาก Sheet
    const sheetMap = new Map();
    sheetData.forEach(row => {
      const applicant = this.mapSheetRowToApplicant(row);
      const key = applicant.id || applicant.fullName;
      sheetMap.set(key, applicant);
    });
    
    // หาข้อมูลที่ต้องเพิ่มหรืออัปเดต
    sheetMap.forEach((sheetApplicant, key) => {
      const currentApplicant = currentMap.get(key);
      
      if (!currentApplicant) {
        // ข้อมูลใหม่
        toAdd.push(sheetApplicant);
      } else if (this.hasDataChanged(currentApplicant, sheetApplicant)) {
        // ข้อมูลมีการเปลี่ยนแปลง
        toUpdate.push(sheetApplicant);
      }
    });
    
    // หาข้อมูลที่ต้องลบ (มีในระบบแต่ไม่มีใน Sheet)
    currentMap.forEach((currentApplicant, key) => {
      if (!sheetMap.has(key)) {
        toDelete.push(currentApplicant.id);
      }
    });
    
    return { toAdd, toUpdate, toDelete };
  }

  /**
   * แปลงข้อมูลจาก Sheet เป็นรูปแบบ Applicant
   */
  mapSheetRowToApplicant(row) {
    return {
      id: row['รหัสผู้สมัคร'] || row['ID'] || row['id'],
      fullName: row['ชื่อ-นามสกุล'] || row['ชื่อ'] || row['fullName'] || row['name'],
      position: row['ตำแหน่ง'] || row['position'] || row['jobTitle'],
      email: row['Email'] || row['email'] || row['อีเมล์'],
      phone: row['เบอร์โทร'] || row['phone'] || row['telephone'],
      department: row['แผนก'] || row['department'] || row['dept'],
      applyDate: row['วันที่สมัคร'] || row['applyDate'] || row['date'],
      status: this.mapStatus(row['สถานะ'] || row['status'] || 'new'),
      source: 'google_sheet',
      syncedAt: new Date().toISOString()
    };
  }

  /**
   * แปลงสถานะจาก Sheet
   */
  mapStatus(sheetStatus) {
    const statusMap = {
      'ใหม่': 'new',
      'ผ่านการคัดเลือก': 'screened',
      'ทำแบบทดสอบแล้ว': 'assessed',
      'ได้เข้าสัมภาษณ์': 'interview_selected',
      'สัมภาษณ์แล้ว': 'interviewed',
      'รับเข้าทำงาน': 'accepted',
      'ไม่ผ่าน': 'rejected',
      'new': 'new',
      'screened': 'screened',
      'assessed': 'assessed',
      'interview_selected': 'interview_selected',
      'interviewed': 'interviewed',
      'accepted': 'accepted',
      'rejected': 'rejected'
    };
    
    return statusMap[sheetStatus] || 'new';
  }

  /**
   * ตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงหรือไม่
   */
  hasDataChanged(current, updated) {
    const fieldsToCheck = ['fullName', 'position', 'email', 'phone', 'department', 'status'];
    
    for (const field of fieldsToCheck) {
      if (current[field] !== updated[field]) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Trigger sync event
   */
  triggerSyncEvent(status, data) {
    const event = new CustomEvent('sync-complete', {
      detail: { status, data, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }

  /**
   * ตั้งค่า API URL
   */
  setApiUrl(url) {
    localStorage.setItem('sheet_api_url', url);
    console.log('✅ API URL configured:', url);
  }

  /**
   * ดึงสถานะการ sync
   */
  getSyncStatus() {
    return {
      status: this.syncStatus,
      lastSyncTime: this.lastSyncTime,
      isAutoSyncEnabled: this.syncInterval !== null
    };
  }

  /**
   * Sync ข้อมูลกลับไปยัง Sheet (Two-way sync)
   */
  async syncToSheet(applicantData) {
    const apiUrl = localStorage.getItem('sheet_api_url');
    
    if (!apiUrl) {
      console.warn('⚠️ No API URL configured, cannot sync to Sheet');
      return { success: false, error: 'API URL not configured' };
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_applicant',
          data: applicantData
        })
      });
      
      const result = await response.json();
      
      // บันทึก audit log
      pdpa.logAudit('DATA_SYNC_TO_SHEET', applicantData.id, {
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('Failed to sync to Sheet:', error);
      return { success: false, error: error.message };
    }
  }
}

const sync = new RealTimeSync();

// Auto-start sync when page loads (optional)
// Uncomment the line below to enable auto-sync
// sync.startAutoSync(60000); // Sync every 1 minute
