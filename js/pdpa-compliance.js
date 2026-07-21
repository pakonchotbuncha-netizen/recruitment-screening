// pdpa-compliance.js - PDPA Compliance Module
// พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562

class PDPACompliance {
  constructor() {
    this.consentKey = 'pdpa_consents';
    this.auditLogKey = 'pdpa_audit_log';
    this.dataProcessingKey = 'pdpa_data_processing';
  }

  // ===== CONSENT MANAGEMENT =====
  
  /**
   * บันทึกความยินยอมในการเก็บข้อมูล
   * @param {string} applicantId - รหัสผู้สมัคร
   * @param {object} consentData - ข้อมูลความยินยอม
   */
  recordConsent(applicantId, consentData) {
    const consents = this.getConsents();
    
    const consent = {
      applicantId: applicantId,
      timestamp: new Date().toISOString(),
      purposes: consentData.purposes || [], // วัตถุประสงค์ในการเก็บข้อมูล
      duration: consentData.duration || 'until_withdrawal', // ระยะเวลาเก็บข้อมูล
      dataTypes: consentData.dataTypes || [], // ประเภทข้อมูลที่เก็บ
      rightsAcknowledged: consentData.rightsAcknowledged || false, // รับทราบสิทธิ
      ip: consentData.ip || this.getClientIP(),
      userAgent: consentData.userAgent || navigator.userAgent,
      version: '1.0',
      status: 'granted' // granted, withdrawn, expired
    };
    
    consents.push(consent);
    localStorage.setItem(this.consentKey, JSON.stringify(consents));
    
    // บันทึก audit log
    this.logAudit('CONSENT_GRANTED', applicantId, {
      purposes: consent.purposes,
      timestamp: consent.timestamp
    });
    
    return consent;
  }

  /**
   * ตรวจสอบว่าผู้สมัครให้ความยินยอมหรือไม่
   */
  hasConsent(applicantId, purpose = null) {
    const consents = this.getConsents();
    const consent = consents.find(c => 
      c.applicantId === applicantId && 
      c.status === 'granted'
    );
    
    if (!consent) return false;
    
    // ตรวจสอบวัตถุประสงค์
    if (purpose && !consent.purposes.includes(purpose)) {
      return false;
    }
    
    return true;
  }

  /**
   * ถอนความยินยอม
   */
  withdrawConsent(applicantId, reason = '') {
    const consents = this.getConsents();
    const index = consents.findIndex(c => 
      c.applicantId === applicantId && 
      c.status === 'granted'
    );
    
    if (index >= 0) {
      consents[index].status = 'withdrawn';
      consents[index].withdrawnAt = new Date().toISOString();
      consents[index].withdrawalReason = reason;
      
      localStorage.setItem(this.consentKey, JSON.stringify(consents));
      
      // บันทึก audit log
      this.logAudit('CONSENT_WITHDRAWN', applicantId, {
        reason: reason,
        timestamp: consents[index].withdrawnAt
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * ดึงความยินยอมทั้งหมด
   */
  getConsents() {
    const data = localStorage.getItem(this.consentKey);
    return data ? JSON.parse(data) : [];
  }

  // ===== DATA SUBJECT RIGHTS =====

  /**
   * สิทธิในการเข้าถึงข้อมูล (Right to Access)
   */
  requestDataAccess(applicantId) {
    if (!this.hasConsent(applicantId)) {
      throw new Error('No consent found for this applicant');
    }
    
    const applicants = JSON.parse(localStorage.getItem('recruitment_applicants') || '[]');
    const applicant = applicants.find(a => a.id === applicantId);
    
    if (!applicant) {
      throw new Error('Applicant not found');
    }
    
    // บันทึก audit log
    this.logAudit('DATA_ACCESS_REQUEST', applicantId, {
      timestamp: new Date().toISOString()
    });
    
    return applicant;
  }

  /**
   * สิทธิในการแก้ไขข้อมูล (Right to Rectification)
   */
  requestDataRectification(applicantId, updates) {
    if (!this.hasConsent(applicantId)) {
      throw new Error('No consent found for this applicant');
    }
    
    const applicants = JSON.parse(localStorage.getItem('recruitment_applicants') || '[]');
    const index = applicants.findIndex(a => a.id === applicantId);
    
    if (index < 0) {
      throw new Error('Applicant not found');
    }
    
    // บันทึกข้อมูลเดิมก่อนแก้ไข
    const originalData = { ...applicants[index] };
    
    // อัปเดตข้อมูล
    applicants[index] = { ...applicants[index], ...updates };
    applicants[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('recruitment_applicants', JSON.stringify(applicants));
    
    // บันทึก audit log
    this.logAudit('DATA_RECTIFICATION', applicantId, {
      originalData: originalData,
      updatedData: updates,
      timestamp: new Date().toISOString()
    });
    
    return applicants[index];
  }

  /**
   * สิทธิในการลบข้อมูล (Right to Erasure / Right to be Forgotten)
   */
  requestDataErasure(applicantId, reason = '') {
    if (!this.hasConsent(applicantId)) {
      throw new Error('No consent found for this applicant');
    }
    
    const applicants = JSON.parse(localStorage.getItem('recruitment_applicants') || '[]');
    const index = applicants.findIndex(a => a.id === applicantId);
    
    if (index < 0) {
      throw new Error('Applicant not found');
    }
    
    // บันทึกข้อมูลก่อนลบ (สำหรับ audit)
    const deletedData = applicants[index];
    
    // ลบข้อมูล
    applicants.splice(index, 1);
    localStorage.setItem('recruitment_applicants', JSON.stringify(applicants));
    
    // ลบข้อมูลที่เกี่ยวข้อง
    this.deleteRelatedData(applicantId);
    
    // บันทึก audit log
    this.logAudit('DATA_ERASURE', applicantId, {
      deletedData: deletedData,
      reason: reason,
      timestamp: new Date().toISOString()
    });
    
    return true;
  }

  /**
   * ลบข้อมูลที่เกี่ยวข้องทั้งหมด
   */
  deleteRelatedData(applicantId) {
    // ลบแบบทดสอบ
    const assessments = JSON.parse(localStorage.getItem('recruitment_assessments') || '[]');
    const filteredAssessments = assessments.filter(a => a.applicantId !== applicantId);
    localStorage.setItem('recruitment_assessments', JSON.stringify(filteredAssessments));
    
    // ลบการสัมภาษณ์
    const interviews = JSON.parse(localStorage.getItem('recruitment_interviews') || '[]');
    const filteredInterviews = interviews.filter(i => i.applicantId !== applicantId);
    localStorage.setItem('recruitment_interviews', JSON.stringify(filteredInterviews));
    
    // ลบสรุปผล
    const summaries = JSON.parse(localStorage.getItem('recruitment_summaries') || '[]');
    const filteredSummaries = summaries.filter(s => s.applicantId !== applicantId);
    localStorage.setItem('recruitment_summaries', JSON.stringify(filteredSummaries));
    
    // ลบความยินยอม
    const consents = this.getConsents();
    const filteredConsents = consents.filter(c => c.applicantId !== applicantId);
    localStorage.setItem(this.consentKey, JSON.stringify(filteredConsents));
  }

  // ===== DATA PORTABILITY =====

  /**
   * สิทธิในการโอนย้ายข้อมูล (Right to Data Portability)
   */
  requestDataPortability(applicantId) {
    if (!this.hasConsent(applicantId)) {
      throw new Error('No consent found for this applicant');
    }
    
    const applicants = JSON.parse(localStorage.getItem('recruitment_applicants') || '[]');
    const applicant = applicants.find(a => a.id === applicantId);
    
    if (!applicant) {
      throw new Error('Applicant not found');
    }
    
    // รวบรวมข้อมูลทั้งหมด
    const assessments = JSON.parse(localStorage.getItem('recruitment_assessments') || '[]');
    const interviews = JSON.parse(localStorage.getItem('recruitment_interviews') || '[]');
    const summaries = JSON.parse(localStorage.getItem('recruitment_summaries') || '[]');
    
    const portableData = {
      applicant: applicant,
      assessments: assessments.filter(a => a.applicantId === applicantId),
      interviews: interviews.filter(i => i.applicantId === applicantId),
      summaries: summaries.filter(s => s.applicantId === applicantId),
      exportedAt: new Date().toISOString()
    };
    
    // บันทึก audit log
    this.logAudit('DATA_PORTABILITY_REQUEST', applicantId, {
      timestamp: new Date().toISOString()
    });
    
    return portableData;
  }

  // ===== AUDIT LOG =====

  /**
   * บันทึก audit log
   */
  logAudit(action, applicantId, details = {}) {
    const logs = this.getAuditLogs();
    
    const log = {
      id: this.generateId(),
      action: action,
      applicantId: applicantId,
      details: details,
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser(),
      ip: this.getClientIP()
    };
    
    logs.push(log);
    
    // เก็บ log ไม่เกิน 10000 รายการ
    if (logs.length > 10000) {
      logs.splice(0, logs.length - 10000);
    }
    
    localStorage.setItem(this.auditLogKey, JSON.stringify(logs));
    
    return log;
  }

  /**
   * ดึง audit logs
   */
  getAuditLogs(filters = {}) {
    const data = localStorage.getItem(this.auditLogKey);
    let logs = data ? JSON.parse(data) : [];
    
    // Filter
    if (filters.applicantId) {
      logs = logs.filter(l => l.applicantId === filters.applicantId);
    }
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.startDate) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
    }
    
    return logs;
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(format = 'json') {
    const logs = this.getAuditLogs();
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      const headers = ['id', 'action', 'applicantId', 'timestamp', 'user', 'ip'];
      const rows = logs.map(l => [
        l.id,
        l.action,
        l.applicantId,
        l.timestamp,
        l.user,
        l.ip
      ]);
      return [headers, ...rows].map(r => r.join(',')).join('\n');
    }
    
    return '';
  }

  // ===== DATA PROCESSING RECORDS =====

  /**
   * บันทึกการประมวลผลข้อมูล
   */
  recordDataProcessing(purpose, legalBasis, dataTypes, retentionPeriod) {
    const records = this.getDataProcessingRecords();
    
    const record = {
      id: this.generateId(),
      purpose: purpose,
      legalBasis: legalBasis, // consent, contract, legal_obligation, vital_interests, public_task, legitimate_interests
      dataTypes: dataTypes,
      retentionPeriod: retentionPeriod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    records.push(record);
    localStorage.setItem(this.dataProcessingKey, JSON.stringify(records));
    
    return record;
  }

  /**
   * ดึงบันทึกการประมวลผลข้อมูล
   */
  getDataProcessingRecords() {
    const data = localStorage.getItem(this.dataProcessingKey);
    return data ? JSON.parse(data) : [];
  }

  // ===== PRIVACY NOTICE =====

  /**
   * สร้าง Privacy Notice
   */
  generatePrivacyNotice() {
    return {
      title: 'ประกาศความเป็นส่วนตัว (Privacy Notice)',
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      sections: [
        {
          title: '1. ข้อมูลที่เก็บรวบรวม',
          content: 'เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน ได้แก่ ชื่อ-นามสกุล, ข้อมูลติดต่อ, ประวัติการศึกษา, ประวัติการทำงาน, และผลการประเมิน'
        },
        {
          title: '2. วัตถุประสงค์ในการเก็บรวบรวม',
          content: 'เราเก็บรวบรวมข้อมูลของท่านเพื่อ: (1) พิจารณาคุณสมบัติสำหรับการจ้างงาน, (2) ติดต่อสื่อสาร, (3) ปฏิบัติตามข้อกำหนดทางกฎหมาย'
        },
        {
          title: '3. ฐานทางกฎหมาย',
          content: 'เราประมวลผลข้อมูลของท่านบนฐานของความยินยอม (Consent) ที่ท่านได้ให้แก่เรา'
        },
        {
          title: '4. ระยะเวลาเก็บรักษา',
          content: 'เราเก็บรักษาข้อมูลของท่านตราบเท่าที่จำเป็นเพื่อวัตถุประสงค์ดังกล่าว หรือตามที่กฎหมายกำหนด'
        },
        {
          title: '5. สิทธิของท่าน',
          content: 'ท่านมีสิทธิในการ: (1) เข้าถึงข้อมูล, (2) แก้ไขข้อมูล, (3) ลบข้อมูล, (4) จำกัดการประมวลผล, (5) โอนย้ายข้อมูล, (6) คัดค้านการประมวลผล, (7) ถอนความยินยอม'
        },
        {
          title: '6. การติดต่อ',
          content: 'หากท่านมีคำถามหรือต้องการใช้สิทธิ กรุณาติดต่อ: [ข้อมูลติดต่อ]'
        }
      ]
    };
  }

  // ===== UTILITIES =====

  generateId() {
    return 'pdpa_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getClientIP() {
    // ในสภาพแวดล้อมจริง ควรดึง IP จาก server
    return 'client_ip';
  }

  getCurrentUser() {
    return localStorage.getItem('current_user') || 'anonymous';
  }
}

const pdpa = new PDPACompliance();
