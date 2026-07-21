// security.js - Security Module
// ป้องกันการโจมตีจากภายนอกและคุ้มครองข้อมูล

class SecurityModule {
  constructor() {
    this.authKey = 'auth_session';
    this.rateLimitKey = 'rate_limit';
    this.blockedIPsKey = 'blocked_ips';
    this.suspiciousActivitiesKey = 'suspicious_activities';
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  // ===== AUTHENTICATION =====

  /**
   * เข้าสู่ระบบ
   */
  async login(username, password) {
    // ตรวจสอบ rate limit
    if (this.isRateLimited(username)) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    
    // ในสภาพแวดล้อมจริง ควรตรวจสอบกับ backend
    // ตัวอย่าง: ตรวจสอบกับ Google Apps Script
    const valid = await this.validateCredentials(username, password);
    
    if (!valid) {
      this.recordFailedLogin(username);
      throw new Error('Invalid username or password');
    }
    
    // สร้าง session token
    const session = {
      username: username,
      token: this.generateToken(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    };
    
    localStorage.setItem(this.authKey, JSON.stringify(session));
    
    // บันทึก audit log
    pdpa.logAudit('USER_LOGIN', null, {
      username: username,
      timestamp: session.createdAt
    });
    
    // Clear failed login attempts
    this.clearFailedLogins(username);
    
    return session;
  }

  /**
   * ออกจากระบบ
   */
  logout() {
    const session = this.getSession();
    
    if (session) {
      // บันทึก audit log
      pdpa.logAudit('USER_LOGOUT', null, {
        username: session.username,
        timestamp: new Date().toISOString()
      });
    }
    
    localStorage.removeItem(this.authKey);
  }

  /**
   * ตรวจสอบว่าเข้าสู่ระบบหรือไม่
   */
  isAuthenticated() {
    const session = this.getSession();
    
    if (!session) {
      return false;
    }
    
    // ตรวจสอบว่า session หมดอายุหรือไม่
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * ดึงข้อมูล session
   */
  getSession() {
    const data = localStorage.getItem(this.authKey);
    return data ? JSON.parse(data) : null;
  }

  /**
   * ตรวจสอบ credentials (ตัวอย่าง)
   */
  async validateCredentials(username, password) {
    // ในสภาพแวดล้อมจริง ควรตรวจสอบกับ backend
    // ตัวอย่าง: ตรวจสอบกับ Google Apps Script
    
    const apiUrl = localStorage.getItem('auth_api_url');
    
    if (!apiUrl) {
      // Mock validation for testing
      console.warn('⚠️ No auth API configured, using mock validation');
      return username === 'admin' && password === 'admin123';
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          username: username,
          password: password
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // ===== AUTHORIZATION =====

  /**
   * ตรวจสอบสิทธิ์การเข้าถึง
   */
  hasPermission(permission) {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    const session = this.getSession();
    const userPermissions = this.getUserPermissions(session.username);
    
    return userPermissions.includes(permission) || userPermissions.includes('*');
  }

  /**
   * ดึงสิทธิ์ของผู้ใช้
   */
  getUserPermissions(username) {
    // ในสภาพแวดล้อมจริง ควรดึงจาก backend
    const permissions = {
      'admin': ['*'], // All permissions
      'hr': ['read', 'write', 'delete', 'export'],
      'interviewer': ['read', 'write_interview'],
      'viewer': ['read']
    };
    
    return permissions[username] || ['read'];
  }

  /**
   * ตรวจสอบสิทธิ์และ redirect ถ้าไม่มีสิทธิ์
   */
  requirePermission(permission) {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    
    if (!this.hasPermission(permission)) {
      alert('You do not have permission to access this resource');
      window.history.back();
      return false;
    }
    
    return true;
  }

  // ===== RATE LIMITING =====

  /**
   * ตรวจสอบ rate limit
   */
  isRateLimited(identifier) {
    const limits = this.getRateLimits();
    const key = identifier.toLowerCase();
    
    if (!limits[key]) {
      return false;
    }
    
    const now = Date.now();
    const recentAttempts = limits[key].filter(timestamp => 
      now - timestamp < this.lockoutDuration
    );
    
    return recentAttempts.length >= this.maxLoginAttempts;
  }

  /**
   * บันทึกการ login ที่ล้มเหลว
   */
  recordFailedLogin(identifier) {
    const limits = this.getRateLimits();
    const key = identifier.toLowerCase();
    
    if (!limits[key]) {
      limits[key] = [];
    }
    
    limits[key].push(Date.now());
    localStorage.setItem(this.rateLimitKey, JSON.stringify(limits));
    
    // บันทึก suspicious activity
    this.recordSuspiciousActivity('FAILED_LOGIN', {
      identifier: identifier,
      timestamp: new Date().toISOString(),
      ip: this.getClientIP()
    });
  }

  /**
   * ล้างการ login ที่ล้มเหลว
   */
  clearFailedLogins(identifier) {
    const limits = this.getRateLimits();
    const key = identifier.toLowerCase();
    delete limits[key];
    localStorage.setItem(this.rateLimitKey, JSON.stringify(limits));
  }

  /**
   * ดึง rate limits
   */
  getRateLimits() {
    const data = localStorage.getItem(this.rateLimitKey);
    return data ? JSON.parse(data) : {};
  }

  // ===== INPUT VALIDATION & SANITIZATION =====

  /**
   * ทำความสะอาด input (ป้องกัน XSS)
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * ตรวจสอบ email
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * ตรวจสอบ phone number
   */
  validatePhone(phone) {
    const re = /^[0-9+\-\s()]{10,15}$/;
    return re.test(phone);
  }

  /**
   * ตรวจสอบความแข็งแรงของรหัสผ่าน
   */
  validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(v => v).length;
    
    return {
      checks: checks,
      score: score,
      strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    };
  }

  // ===== CONTENT SECURITY =====

  /**
   * ตรวจสอบ Content Security Policy
   */
  checkCSP() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!meta) {
      console.warn('⚠️ No Content-Security-Policy meta tag found');
      return false;
    }
    
    return true;
  }

  /**
   * สร้าง CSP meta tag
   */
  generateCSPMeta() {
    return '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdn.tailwindcss.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; connect-src \'self\' https://script.google.com;">';
  }

  // ===== SUSPICIOUS ACTIVITY DETECTION =====

  /**
   * บันทึกกิจกรรมที่น่าสงสัย
   */
  recordSuspiciousActivity(type, details) {
    const activities = this.getSuspiciousActivities();
    
    activities.push({
      id: this.generateId(),
      type: type,
      details: details,
      timestamp: new Date().toISOString(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    });
    
    // เก็บ activity ไม่เกิน 1000 รายการ
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
    localStorage.setItem(this.suspiciousActivitiesKey, JSON.stringify(activities));
    
    // แจ้งเตือนถ้ามีกิจกรรมน่าสงสัยมาก
    if (activities.length > 100) {
      console.warn('🚨 High number of suspicious activities detected!');
    }
  }

  /**
   * ดึงกิจกรรมที่น่าสงสัย
   */
  getSuspiciousActivities() {
    const data = localStorage.getItem(this.suspiciousActivitiesKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * ตรวจสอบกิจกรรมที่น่าสงสัย
   */
  checkSuspiciousActivities() {
    const activities = this.getSuspiciousActivities();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentActivities = activities.filter(a => 
      new Date(a.timestamp).getTime() > oneHourAgo
    );
    
    return {
      total: activities.length,
      recent: recentActivities.length,
      byType: this.groupByType(recentActivities)
    };
  }

  /**
   * จัดกลุ่มกิจกรรมตามประเภท
   */
  groupByType(activities) {
    const grouped = {};
    activities.forEach(a => {
      if (!grouped[a.type]) {
        grouped[a.type] = 0;
      }
      grouped[a.type]++;
    });
    return grouped;
  }

  // ===== DATA ENCRYPTION =====

  /**
   * เข้ารหัสข้อมูล (ตัวอย่าง)
   */
  async encryptData(data, key) {
    // ในสภาพแวดล้อมจริง ควรใช้ Web Crypto API
    // ตัวอย่าง: ใช้ Base64 encoding สำหรับ demonstration
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    return btoa(String.fromCharCode(...dataBuffer));
  }

  /**
   * ถอดรหัสข้อมูล (ตัวอย่าง)
   */
  async decryptData(encryptedData, key) {
    // ในสภาพแวดล้อมจริง ควรใช้ Web Crypto API
    const decoder = new TextDecoder();
    const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    return JSON.parse(decoder.decode(dataBuffer));
  }

  // ===== SECURITY HEADERS =====

  /**
   * ตรวจสอบ security headers
   */
  checkSecurityHeaders() {
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
    
    // ในสภาพแวดล้อมจริง ควรตรวจสอบ response headers
    console.log('🔒 Security headers check:', headers);
    
    return headers;
  }

  // ===== UTILITIES =====

  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  generateId() {
    return 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getClientIP() {
    // ในสภาพแวดล้อมจริง ควรดึง IP จาก server
    return 'client_ip';
  }

  /**
   * สร้าง security report
   */
  generateSecurityReport() {
    return {
      timestamp: new Date().toISOString(),
      isAuthenticated: this.isAuthenticated(),
      session: this.getSession(),
      rateLimits: this.getRateLimits(),
      suspiciousActivities: this.checkSuspiciousActivities(),
      cspEnabled: this.checkCSP(),
      securityHeaders: this.checkSecurityHeaders()
    };
  }
}

const security = new SecurityModule();

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if on protected page
  const protectedPages = ['applicants.html', 'assessment.html', 'ai-analysis.html', 'interview.html', 'summary.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage)) {
    if (!security.isAuthenticated()) {
      // Redirect to login (or show login modal)
      console.warn('⚠️ Not authenticated. Redirecting to login...');
      // window.location.href = 'login.html';
    }
  }
});
