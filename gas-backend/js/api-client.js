// api-client.js - API Client สำหรับเชื่อมต่อ Google Apps Script Backend
// แทนที่ localStorage ด้วย API calls

class APIClient {
  constructor() {
    this.baseUrl = ''; // Will be set after deployment
    this.session = null;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    localStorage.setItem('api_base_url', url);
  }

  getBaseUrl() {
    return this.baseUrl || localStorage.getItem('api_base_url') || '';
  }

  // ===== HTTP METHODS =====
  
  async get(action, params = {}) {
    const url = new URL(this.getBaseUrl());
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    return response.json();
  }

  async post(action, data = {}) {
    const response = await fetch(this.getBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    return response.json();
  }

  // ===== APPLICANTS =====
  
  async getApplicants() {
    const result = await this.get('get_applicants');
    if (result.success) {
      this.cache.set('applicants', { data: result.data, timestamp: Date.now() });
    }
    return result;
  }

  async getApplicant(id) {
    return this.get('get_applicant', { id });
  }

  async saveApplicant(data) {
    const result = await this.post('save_applicant', { data });
    if (result.success) {
      this.cache.delete('applicants');
    }
    return result;
  }

  async updateApplicant(id, data) {
    const result = await this.post('update_applicant', { id, data });
    if (result.success) {
      this.cache.delete('applicants');
    }
    return result;
  }

  async deleteApplicant(id) {
    const result = await this.post('delete_applicant', { id });
    if (result.success) {
      this.cache.delete('applicants');
    }
    return result;
  }

  async importApplicants(dataArray) {
    const result = await this.post('import_applicants', { data: dataArray });
    if (result.success) {
      this.cache.delete('applicants');
    }
    return result;
  }

  // ===== ASSESSMENTS =====
  
  async getAssessments() {
    return this.get('get_assessments');
  }

  async saveAssessment(data) {
    return this.post('save_assessment', { data });
  }

  // ===== INTERVIEWS =====
  
  async getInterviews() {
    return this.get('get_interviews');
  }

  async saveInterview(data) {
    return this.post('save_interview', { data });
  }

  // ===== NOTIFICATIONS =====
  
  async getNotifications() {
    return this.get('get_notifications');
  }

  async createNotification(data) {
    return this.post('create_notification', { data });
  }

  async markNotificationRead(id) {
    return this.post('mark_notification_read', { id });
  }

  // ===== STATS =====
  
  async getStats() {
    return this.get('get_stats');
  }

  // ===== AUTH =====
  
  async login(username, password) {
    const result = await this.post('login', { username, password });
    if (result.success) {
      this.session = result.session;
      localStorage.setItem('session', JSON.stringify(result.session));
    }
    return result;
  }

  logout() {
    this.session = null;
    localStorage.removeItem('session');
  }

  getSession() {
    if (!this.session) {
      const stored = localStorage.getItem('session');
      if (stored) {
        this.session = JSON.parse(stored);
      }
    }
    return this.session;
  }

  isAuthenticated() {
    return !!this.getSession();
  }

  // ===== CONSENT (PDPA) =====
  
  async recordConsent(data) {
    return this.post('record_consent', { data });
  }

  // ===== UTILITIES =====
  
  async checkInterviewReminders() {
    return this.get('check_interview_reminders');
  }

  // Cache helper
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
}

// Create global instance
const api = new APIClient();

// Compatibility layer - make api work like store
const store = {
  keys: {
    applicants: 'applicants',
    assessments: 'assessments',
    interviews: 'interviews',
    notifications: 'notifications'
  },

  async getApplicants() {
    const result = await api.getApplicants();
    return result.success ? result.data : [];
  },

  async saveApplicant(data) {
    const result = await api.saveApplicant(data);
    return result.success ? result.data : null;
  },

  async deleteApplicant(id) {
    return api.deleteApplicant(id);
  },

  async getAssessments() {
    const result = await api.getAssessments();
    return result.success ? result.data : [];
  },

  async saveAssessment(data) {
    return api.saveAssessment(data);
  },

  async getInterviews() {
    const result = await api.getInterviews();
    return result.success ? result.data : [];
  },

  async saveInterview(data) {
    return api.saveInterview(data);
  },

  async getStats() {
    const result = await api.getStats();
    return result.success ? result.data : {};
  },

  async exportAll() {
    const [applicants, assessments, interviews] = await Promise.all([
      this.getApplicants(),
      this.getAssessments(),
      this.getInterviews()
    ]);
    return { applicants, assessments, interviews, exportedAt: new Date().toISOString() };
  }
};
