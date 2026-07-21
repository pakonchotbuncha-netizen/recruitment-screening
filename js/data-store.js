// data-store.js - จัดการข้อมูลระบบคัดกรองและสัมภาษณ์
// ใช้ localStorage เก็บข้อมูล

class DataStore {
  constructor() {
    this.keys = {
      applicants: 'recruitment_applicants',
      assessments: 'recruitment_assessments',
      interviews: 'recruitment_interviews',
      summaries: 'recruitment_summaries
    };
  }

  // ===== APPLICANTS =====
  getApplicants() {
    const data = localStorage.getItem(this.keys.applicants);
    return data ? JSON.parse(data) : [];
  }

  saveApplicant(applicant) {
    const applicants = this.getApplicants();
    applicant.id = applicant.id || this.generateId();
    applicant.createdAt = applicant.createdAt || new Date().toISOString();
    applicant.status = applicant.status || 'new'; // new, screened, assessed, interview_selected, interviewed, accepted, rejected
    
    const index = applicants.findIndex(a => a.id === applicant.id);
    if (index >= 0) {
      applicants[index] = { ...applicants[index], ...applicant };
    } else {
      applicants.push(applicant);
    }
    
    localStorage.setItem(this.keys.applicants, JSON.stringify(applicants));
    return applicant;
  }

  deleteApplicant(id) {
    const applicants = this.getApplicants();
    const filtered = applicants.filter(a => a.id !== id);
    localStorage.setItem(this.keys.applicants, JSON.stringify(filtered));
  }

  // ===== ASSESSMENTS =====
  getAssessments() {
    const data = localStorage.getItem(this.keys.assessments);
    return data ? JSON.parse(data) : [];
  }

  saveAssessment(assessment) {
    const assessments = this.getAssessments();
    assessment.id = assessment.id || this.generateId();
    assessment.submittedAt = assessment.submittedAt || new Date().toISOString();
    
    const index = assessments.findIndex(a => a.applicantId === assessment.applicantId);
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    
    localStorage.setItem(this.keys.assessments, JSON.stringify(assessments));
    return assessment;
  }

  // ===== INTERVIEWS =====
  getInterviews() {
    const data = localStorage.getItem(this.keys.interviews);
    return data ? JSON.parse(data) : [];
  }

  saveInterview(interview) {
    const interviews = this.getInterviews();
    interview.id = interview.id || this.generateId();
    interview.createdAt = interview.createdAt || new Date().toISOString();
    
    const index = interviews.findIndex(i => i.applicantId === interview.applicantId);
    if (index >= 0) {
      interviews[index] = interview;
    } else {
      interviews.push(interview);
    }
    
    localStorage.setItem(this.keys.interviews, JSON.stringify(interviews));
    return interview;
  }

  // ===== SUMMARIES =====
  getSummaries() {
    const data = localStorage.getItem(this.keys.summaries);
    return data ? JSON.parse(data) : [];
  }

  saveSummary(summary) {
    const summaries = this.getSummaries();
    summary.id = summary.id || this.generateId();
    summary.createdAt = summary.createdAt || new Date().toISOString();
    
    const index = summaries.findIndex(s => s.applicantId === summary.applicantId);
    if (index >= 0) {
      summaries[index] = summary;
    } else {
      summaries.push(summary);
    }
    
    localStorage.setItem(this.keys.summaries, JSON.stringify(summaries));
    return summary;
  }

  // ===== UTILITIES =====
  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getStats() {
    const applicants = this.getApplicants();
    return {
      total: applicants.length,
      new: applicants.filter(a => a.status === 'new').length,
      screened: applicants.filter(a => a.status === 'screened').length,
      assessed: applicants.filter(a => a.status === 'assessed').length,
      interviewSelected: applicants.filter(a => a.status === 'interview_selected').length,
      interviewed: applicants.filter(a => a.status === 'interviewed').length,
      accepted: applicants.filter(a => a.status === 'accepted').length,
      rejected: applicants.filter(a => a.status === 'rejected').length
    };
  }

  exportAll() {
    return {
      applicants: this.getApplicants(),
      assessments: this.getAssessments(),
      interviews: this.getInterviews(),
      summaries: this.getSummaries(),
      exportedAt: new Date().toISOString()
    };
  }

  importAll(data) {
    if (data.applicants) localStorage.setItem(this.keys.applicants, JSON.stringify(data.applicants));
    if (data.assessments) localStorage.setItem(this.keys.assessments, JSON.stringify(data.assessments));
    if (data.interviews) localStorage.setItem(this.keys.interviews, JSON.stringify(data.interviews));
    if (data.summaries) localStorage.setItem(this.keys.summaries, JSON.stringify(data.summaries));
  }

  clearAll() {
    Object.values(this.keys).forEach(key => localStorage.removeItem(key));
  }
}

const store = new DataStore();
