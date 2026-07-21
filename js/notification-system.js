// notification-system.js - ระบบแจ้งเตือน
// แจ้งเตือนผู้สมัครใหม่ + แจ้งเตือนก่อนสัมภาษณ์ 3 วัน

class NotificationSystem {
  constructor() {
    this.notificationsKey = 'recruitment_notifications';
    this.settingsKey = 'notification_settings';
    this.subscribersKey = 'notification_subscribers';
    this.checkInterval = null;
  }

  // ===== NOTIFICATION CREATION =====

  /**
   * สร้างการแจ้งเตือนใหม่
   */
  createNotification(type, title, message, data = {}) {
    const notifications = this.getNotifications();
    
    const notification = {
      id: this.generateId(),
      type: type, // new_applicant, interview_reminder, status_change, system
      title: title,
      message: message,
      data: data,
      read: false,
      createdAt: new Date().toISOString(),
      priority: this.getPriority(type) // low, medium, high, urgent
    };
    
    notifications.unshift(notification); // เพิ่มไว้บนสุด
    
    // เก็บไม่เกิน 500 รายการ
    if (notifications.length > 500) {
      notifications.splice(500);
    }
    
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    
    // แสดง notification popup
    this.showPopup(notification);
    
    // แจ้งเตือนผู้ที่เกี่ยวข้อง
    this.notifySubscribers(notification);
    
    // บันทึก audit log
    if (typeof pdpa !== 'undefined') {
      pdpa.logAudit('NOTIFICATION_CREATED', null, {
        type: type,
        title: title,
        timestamp: notification.createdAt
      });
    }
    
    return notification;
  }

  /**
   * แจ้งเตือน: มีผู้สมัครใหม่
   */
  notifyNewApplicant(applicant) {
    return this.createNotification(
      'new_applicant',
      '🆕 มีผู้สมัครใหม่',
      `${applicant.fullName} สมัครตำแหน่ง ${applicant.position}`,
      {
        applicantId: applicant.id,
        applicantName: applicant.fullName,
        position: applicant.position,
        email: applicant.email,
        applyDate: applicant.applyDate
      }
    );
  }

  /**
   * แจ้งเตือน: ใกล้ถึงวันสัมภาษณ์ (3 วันล่วงหน้า)
   */
  notifyInterviewReminder(interview, daysBefore = 3) {
    const interviewDate = new Date(interview.scheduledDate);
    const now = new Date();
    const daysUntil = Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > daysBefore) {
      return null; // ยังไม่ถึงเวลาแจ้งเตือน
    }
    
    const applicant = this.getApplicant(interview.applicantId);
    if (!applicant) return null;
    
    let urgency = '';
    if (daysUntil <= 0) {
      urgency = '🔴 วันนี้!';
    } else if (daysUntil === 1) {
      urgency = '🟠 พรุ่งนี้!';
    } else {
      urgency = `🟡 อีก ${daysUntil} วัน`;
    }
    
    return this.createNotification(
      'interview_reminder',
      `📅 แจ้งเตือนการสัมภาษณ์ ${urgency}`,
      `${applicant.fullName} - ตำแหน่ง ${applicant.position}\nวันที่: ${this.formatDate(interview.scheduledDate)}\nเวลา: ${interview.scheduledTime || 'ไม่ระบุ'}`,
      {
        applicantId: applicant.id,
        applicantName: applicant.fullName,
        position: applicant.position,
        interviewDate: interview.scheduledDate,
        interviewTime: interview.scheduledTime,
        daysUntil: daysUntil,
        interviewId: interview.id
      }
    );
  }

  /**
   * แจ้งเตือน: เปลี่ยนสถานะผู้สมัคร
   */
  notifyStatusChange(applicant, oldStatus, newStatus) {
    const statusText = {
      'new': 'ใหม่',
      'screened': 'ผ่านการคัดเลือก',
      'assessed': 'ทำแบบทดสอบแล้ว',
      'interview_selected': 'ได้เข้าสัมภาษณ์',
      'interviewed': 'สัมภาษณ์แล้ว',
      'accepted': 'รับเข้าทำงาน',
      'rejected': 'ไม่ผ่าน'
    };
    
    return this.createNotification(
      'status_change',
      `🔄 เปลี่ยนสถานะ: ${applicant.fullName}`,
      `${statusText[oldStatus] || oldStatus} → ${statusText[newStatus] || newStatus}`,
      {
        applicantId: applicant.id,
        applicantName: applicant.fullName,
        oldStatus: oldStatus,
        newStatus: newStatus
      }
    );
  }

  // ===== NOTIFICATION MANAGEMENT =====

  /**
   * ดึงการแจ้งเตือนทั้งหมด
   */
  getNotifications(filters = {}) {
    const data = localStorage.getItem(this.notificationsKey);
    let notifications = data ? JSON.parse(data) : [];
    
    // Filter
    if (filters.type) {
      notifications = notifications.filter(n => n.type === filters.type);
    }
    if (filters.read !== undefined) {
      notifications = notifications.filter(n => n.read === filters.read);
    }
    if (filters.priority) {
      notifications = notifications.filter(n => n.priority === filters.priority);
    }
    if (filters.startDate) {
      notifications = notifications.filter(n => 
        new Date(n.createdAt) >= new Date(filters.startDate)
      );
    }
    
    return notifications;
  }

  /**
   * ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
   */
  getUnreadNotifications() {
    return this.getNotifications({ read: false });
  }

  /**
   * ทำเครื่องหมายว่าอ่านแล้ว
   */
  markAsRead(notificationId) {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index >= 0) {
      notifications[index].read = true;
      notifications[index].readAt = new Date().toISOString();
      localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  }

  /**
   * ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
   */
  markAllAsRead() {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      n.read = true;
      n.readAt = new Date().toISOString();
    });
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifications));
    return true;
  }

  /**
   * ลบการแจ้งเตือน
   */
  deleteNotification(notificationId) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(this.notificationsKey, JSON.stringify(filtered));
    return true;
  }

  /**
   * ล้างการแจ้งเตือนทั้งหมด
   */
  clearAllNotifications() {
    localStorage.setItem(this.notificationsKey, JSON.stringify([]));
    return true;
  }

  // ===== SUBSCRIBER MANAGEMENT =====

  /**
   * เพิ่มผู้รับการแจ้งเตือน
   */
  addSubscriber(subscriber) {
    const subscribers = this.getSubscribers();
    
    const newSubscriber = {
      id: this.generateId(),
      name: subscriber.name,
      email: subscriber.email,
      phone: subscriber.phone,
      roles: subscriber.roles || ['hr'], // admin, hr, interviewer, manager
      notificationTypes: subscriber.notificationTypes || ['all'], // new_applicant, interview_reminder, status_change, system
      active: true,
      createdAt: new Date().toISOString()
    };
    
    subscribers.push(newSubscriber);
    localStorage.setItem(this.subscribersKey, JSON.stringify(subscribers));
    
    return newSubscriber;
  }

  /**
   * ดึงผู้รับการแจ้งเตือน
   */
  getSubscribers() {
    const data = localStorage.getItem(this.subscribersKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * แจ้งเตือนผู้ที่เกี่ยวข้อง
   */
  notifySubscribers(notification) {
    const subscribers = this.getSubscribers();
    
    const relevantSubscribers = subscribers.filter(sub => {
      // ตรวจสอบว่าเปิดรับ notification type นี้หรือไม่
      if (!sub.notificationTypes.includes('all') && 
          !sub.notificationTypes.includes(notification.type)) {
        return false;
      }
      
      // ตรวจสอบ role
      // ในสภาพแวดล้อมจริง ควรตรวจสอบตาม role
      return sub.active;
    });
    
    // ส่งการแจ้งเตือน (ในสภาพแวดล้อมจริง ควรส่ง email/line notification)
    relevantSubscribers.forEach(sub => {
      console.log(`📧 Sending notification to ${sub.email}:`, notification.title);
      
      // ตัวอย่าง: ส่ง email
      // this.sendEmail(sub.email, notification);
      
      // ตัวอย่าง: ส่ง LINE notification
      // this.sendLineNotification(sub.phone, notification);
    });
    
    return relevantSubscribers.length;
  }

  // ===== AUTO-CHECK SCHEDULED INTERVIEWS =====

  /**
   * เริ่มตรวจสอบการสัมภาษณ์อัตโนมัติ
   */
  startAutoCheck(intervalMs = 3600000) { // Default: 1 hour
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    console.log('🔔 Starting auto-check for interview reminders');
    
    // ตรวจสอบทันที
    this.checkInterviewReminders();
    
    // ตั้ง interval
    this.checkInterval = setInterval(() => {
      this.checkInterviewReminders();
    }, intervalMs);
  }

  /**
   * หยุดตรวจสอบอัตโนมัติ
   */
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Auto-check stopped');
    }
  }

  /**
   * ตรวจสอบการแจ้งเตือนการสัมภาษณ์
   */
  checkInterviewReminders() {
    console.log('🔍 Checking for interview reminders...');
    
    const interviews = this.getInterviews();
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    let reminderCount = 0;
    
    interviews.forEach(interview => {
      if (!interview.scheduledDate) return;
      if (interview.reminderSent) return; // ส่งแจ้งเตือนแล้ว
      
      const interviewDate = new Date(interview.scheduledDate);
      
      // ตรวจสอบว่าอยู่ในช่วง 3 วันล่วงหน้าหรือไม่
      if (interviewDate >= now && interviewDate <= threeDaysLater) {
        const notification = this.notifyInterviewReminder(interview);
        
        if (notification) {
          // บันทึกว่าส่งแจ้งเตือนแล้ว
          interview.reminderSent = true;
          interview.reminderSentAt = new Date().toISOString();
          this.saveInterview(interview);
          reminderCount++;
        }
      }
    });
    
    if (reminderCount > 0) {
      console.log(`✅ Sent ${reminderCount} interview reminders`);
    }
    
    return reminderCount;
  }

  // ===== NOTIFICATION POPUP =====

  /**
   * แสดง popup การแจ้งเตือน
   */
  showPopup(notification) {
    // สร้าง popup element
    const popup = document.createElement('div');
    popup.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-50 animate-slide-in';
    popup.style.borderLeft = `4px solid ${this.getPriorityColor(notification.priority)}`;
    
    popup.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">
          <h3 class="font-bold text-gray-900">${notification.title}</h3>
          <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${notification.message}</p>
          <p class="text-xs text-gray-400 mt-2">${this.formatTime(notification.createdAt)}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 ml-2">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // ลบ popup หลังจาก 5 วินาที
    setTimeout(() => {
      if (popup.parentElement) {
        popup.style.animation = 'slide-out 0.3s ease';
        setTimeout(() => popup.remove(), 300);
      }
    }, 5000);
  }

  // ===== NOTIFICATION CENTER UI =====

  /**
   * สร้าง Notification Center
   */
  renderNotificationCenter() {
    const notifications = this.getNotifications();
    const unreadCount = this.getUnreadNotifications().length;
    
    return `
      <div class="notification-center">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">🔔 การแจ้งเตือน</h2>
          <div class="flex gap-2">
            <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">${unreadCount} ยังไม่ได้อ่าน</span>
            <button onclick="notification.markAllAsRead(); renderNotificationCenter();" class="text-blue-600 hover:text-blue-800 text-sm">
              อ่านทั้งหมด
            </button>
          </div>
        </div>
        
        <div class="space-y-2">
          ${notifications.length === 0 ? 
            '<p class="text-gray-500 text-center py-8">ไม่มีการแจ้งเตือน</p>' :
            notifications.slice(0, 20).map(n => this.renderNotificationItem(n)).join('')
          }
        </div>
        
        ${notifications.length > 20 ? `
          <div class="text-center mt-4">
            <button onclick="showAllNotifications()" class="text-blue-600 hover:text-blue-800">
              ดูทั้งหมด (${notifications.length})
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * แสดงรายการแจ้งเตือน
   */
  renderNotificationItem(notification) {
    const priorityColor = this.getPriorityColor(notification.priority);
    const typeIcon = this.getTypeIcon(notification.type);
    
    return `
      <div class="border rounded-lg p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}" 
           style="border-left: 3px solid ${priorityColor}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span>${typeIcon}</span>
              <h3 class="font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-700'}">
                ${notification.title}
              </h3>
            </div>
            <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">${notification.message}</p>
            <p class="text-xs text-gray-400 mt-2">${this.formatTime(notification.createdAt)}</p>
          </div>
          <div class="flex gap-1">
            ${!notification.read ? `
              <button onclick="notification.markAsRead('${notification.id}'); renderNotificationCenter();" 
                      class="text-blue-600 hover:text-blue-800 text-sm px-2" title="ทำเครื่องหมายว่าอ่านแล้ว">
                ✓
              </button>
            ` : ''}
            <button onclick="notification.deleteNotification('${notification.id}'); renderNotificationCenter();" 
                    class="text-red-600 hover:text-red-800 text-sm px-2" title="ลบ">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== UTILITIES =====

  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getPriority(type) {
    const priorities = {
      'new_applicant': 'medium',
      'interview_reminder': 'high',
      'status_change': 'low',
      'system': 'low'
    };
    return priorities[type] || 'medium';
  }

  getPriorityColor(priority) {
    const colors = {
      'low': '#10b981', // green
      'medium': '#3b82f6', // blue
      'high': '#f59e0b', // yellow
      'urgent': '#ef4444' // red
    };
    return colors[priority] || '#3b82f6';
  }

  getTypeIcon(type) {
    const icons = {
      'new_applicant': '🆕',
      'interview_reminder': '📅',
      'status_change': '🔄',
      'system': '⚙️'
    };
    return icons[type] || '🔔';
  }

  getApplicant(applicantId) {
    if (typeof store !== 'undefined') {
      const applicants = store.getApplicants();
      return applicants.find(a => a.id === applicantId);
    }
    return null;
  }

  getInterviews() {
    if (typeof store !== 'undefined') {
      return store.getInterviews();
    }
    return [];
  }

  saveInterview(interview) {
    if (typeof store !== 'undefined') {
      const interviews = store.getInterviews();
      const index = interviews.findIndex(i => i.id === interview.id);
      if (index >= 0) {
        interviews[index] = interview;
      } else {
        interviews.push(interview);
      }
      localStorage.setItem(store.keys.interviews, JSON.stringify(interviews));
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'เมื่อสักครู่';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ชั่วโมงที่แล้ว`;
    
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * ดึงสถิติการแจ้งเตือน
   */
  getStats() {
    const notifications = this.getNotifications();
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        new_applicant: notifications.filter(n => n.type === 'new_applicant').length,
        interview_reminder: notifications.filter(n => n.type === 'interview_reminder').length,
        status_change: notifications.filter(n => n.type === 'status_change').length,
        system: notifications.filter(n => n.type === 'system').length
      },
      byPriority: {
        urgent: notifications.filter(n => n.priority === 'urgent').length,
        high: notifications.filter(n => n.priority === 'high').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        low: notifications.filter(n => n.priority === 'low').length
      }
    };
  }
}

const notification = new NotificationSystem();

// Auto-start interview reminder check
document.addEventListener('DOMContentLoaded', () => {
  // เริ่มตรวจสอบการสัมภาษณ์อัตโนมัติ (ทุก 1 ชั่วโมง)
  notification.startAutoCheck(3600000);
});

// CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-out {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease;
  }
`;
document.head.appendChild(style);
