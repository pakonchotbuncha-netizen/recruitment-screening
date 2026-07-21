// interview.js - Interview Process (Steps 5-8)

let currentApplicant = null;

document.addEventListener('DOMContentLoaded', () => {
    loadApplicant();
    renderSelectedList();
    renderConfirmationList();
});

function loadApplicant() {
    const applicantId = localStorage.getItem('currentApplicantId');
    if (!applicantId) return;
    
    const applicants = store.getApplicants();
    currentApplicant = applicants.find(a => a.id === applicantId);
}

// ===== STEP 5: SELECTED LIST =====
function renderSelectedList() {
    const applicants = store.getApplicants();
    const selected = applicants.filter(a => a.status === 'interview_selected' || a.status === 'assessed');
    
    const container = document.getElementById('selectedList');
    
    if (selected.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">ยังไม่มีผู้สมัครที่ได้รับการคัดเลือก</p>';
        return;
    }
    
    container.innerHTML = selected.map(a => `
        <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div>
                <p class="font-semibold">${a.fullName}</p>
                <p class="text-sm text-gray-500">${a.position || '-'} | ${a.department || '-'}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="selectApplicant('${a.id}')" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                    เลือก
                </button>
                <span class="px-3 py-1 ${a.status === 'interview_selected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded text-sm">
                    ${a.status === 'interview_selected' ? '✓ คัดเลือกแล้ว' : 'รอคัดเลือก'}
                </span>
            </div>
        </div>
    `).join('');
}

function selectApplicant(id) {
    localStorage.setItem('currentApplicantId', id);
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === id);
    if (index >= 0) {
        applicants[index].status = 'interview_selected';
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
        currentApplicant = applicants[index];
        renderSelectedList();
        renderConfirmationList();
    }
}

// ===== STEP 6: CONFIRMATION =====
function renderConfirmationList() {
    const applicants = store.getApplicants();
    const selected = applicants.filter(a => a.status === 'interview_selected');
    
    const container = document.getElementById('confirmationList');
    
    if (selected.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">ยังไม่มีผู้สมัครที่ตอบรับ</p>';
        return;
    }
    
    container.innerHTML = selected.map(a => {
        const interview = getInterview(a.id);
        const confirmed = interview && interview.confirmed;
        
        return `
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                    <p class="font-semibold">${a.fullName}</p>
                    <p class="text-sm text-gray-500">${a.position || '-'}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="confirmInterview('${a.id}')" class="${confirmed ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-1 rounded text-sm" ${confirmed ? 'disabled' : ''}>
                        ${confirmed ? '✓ ตอบรับแล้ว' : 'ยืนยันการตอบรับ'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function confirmInterview(id) {
    const interview = getInterview(id) || {
        applicantId: id,
        confirmed: false,
        confirmedAt: null,
        scores: []
    };
    
    interview.confirmed = true;
    interview.confirmedAt = new Date().toISOString();
    saveInterview(interview);
    
    renderConfirmationList();
    alert('ยืนยันการตอบรับสำเร็จ!');
}

// ===== STEP 7: AI INTERVIEW FORM =====
function generateInterviewForm() {
    if (!currentApplicant) {
        alert('กรุณาเลือกผู้สมัครก่อน');
        return;
    }
    
    const container = document.getElementById('interviewForm');
    container.innerHTML = '<p class="text-center text-gray-500">🔄 กำลังสร้างแบบสัมภาษณ์...</p>';
    
    setTimeout(() => {
        const questions = generateAIQuestions();
        
        container.innerHTML = `
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-purple-800">🤖 AI สร้างแบบสัมภาษณ์อัตโนมัติสำหรับ <strong>${currentApplicant.fullName}</strong> ตำแหน่ง <strong>${currentApplicant.position}</strong></p>
            </div>
            
            <div class="space-y-4">
                <h3 class="font-bold text-lg">คำถามสัมภาษณ์</h3>
                ${questions.map((q, i) => `
                    <div class="border rounded-lg p-4">
                        <p class="font-semibold mb-2">${i + 1}. ${q.question}</p>
                        <p class="text-sm text-gray-600">💡 ${q.hint}</p>
                        <div class="mt-2 text-xs text-purple-600">หมวด: ${q.category}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Save questions
        const interview = getInterview(currentApplicant.id) || { applicantId: currentApplicant.id };
        interview.questions = questions;
        saveInterview(interview);
        
        // Render scoring section
        renderScoringSection(questions);
    }, 1500);
}

function generateAIQuestions() {
    const position = currentApplicant?.position || 'ทั่วไป';
    
    return [
        {
            question: `เล่าเกี่ยวกับประสบการณ์ที่เกี่ยวข้องกับตำแหน่ง ${position} ให้ฟังหน่อย`,
            hint: 'ประเมิน: ความรู้และประสบการณ์ในสายงาน',
            category: 'ทักษะวิชาชีพ'
        },
        {
            question: 'เมื่อเจอปัญหาที่ยากในการทำงาน คุณจัดการอย่างไร?',
            hint: 'ประเมิน: การแก้ปัญหาและความคิดเชิงวิเคราะห์',
            category: 'ทักษะ'
        },
        {
            question: 'คุณทำงานเป็นทีมอย่างไร? ยกตัวอย่างการทำงานเป็นทีมที่สำเร็จ',
            hint: 'ประเมิน: CC4 - การทำงานทีมด้วยฉันทมติ',
            category: 'CC'
        },
        {
            question: 'คุณมีวิธีการพัฒนาตัวเองอย่างไรให้ทันกับการเปลี่ยนแปลง?',
            hint: 'ประเมิน: CC2 - การปรับตัวและสร้างนวัตกรรม',
            category: 'CC'
        },
        {
            question: 'อะไรคือแรงจูงใจในการทำงานของคุณ? คุณมีเป้าหมายอะไรในอาชีพ?',
            hint: 'ประเมิน: 3P - Purpose & Passion',
            category: '3E3P'
        },
        {
            question: 'เล่าสถานการณ์ที่คุณต้องทำงานภายใต้ความกดดัน คุณจัดการอย่างไร?',
            hint: 'ประเมิน: 3E - Energy & Execution',
            category: '3E3P'
        },
        {
            question: 'คุณสร้างความเป็นผู้นำและรับใช้ทีมอย่างไร?',
            hint: 'ประเมิน: CC1 - Servant Leadership',
            category: 'CC'
        },
        {
            question: 'คุณมีคำถามอะไรเกี่ยวกับองค์กรหรือตำแหน่งนี้ไหม?',
            hint: 'ประเมิน: ความสนใจและแรงจูงใจ',
            category: 'ทัศนคติ'
        }
    ];
}

// ===== STEP 8: SCORING =====
function renderScoringSection(questions) {
    const interviewers = [
        { id: 1, name: 'ผู้สัมภาษณ์ 1 (หัวหน้างาน)' },
        { id: 2, name: 'ผู้สัมภาษณ์ 2 (HR)' },
        { id: 3, name: 'ผู้สัมภาษณ์ 3 (เพื่อนร่วมงาน)' },
        { id: 4, name: 'ผู้สัมภาษณ์ 4 (ผู้บริหาร)' },
        { id: 5, name: 'ผู้สัมภาษณ์ 5 (ที่ปรึกษา)' }
    ];
    
    const container = document.getElementById('interviewerScores');
    
    container.innerHTML = interviewers.map(interviewer => `
        <div class="border rounded-lg p-4">
            <h4 class="font-bold mb-3">${interviewer.name}</h4>
            <div class="space-y-3">
                ${(questions || []).map((q, i) => `
                    <div>
                        <label class="text-sm text-gray-700">ข้อ ${i + 1}: ${q.question.substring(0, 50)}...</label>
                        <div class="flex gap-2 mt-1">
                            ${[1,2,3,4,5].map(score => `
                                <label class="flex items-center">
                                    <input type="radio" name="interviewer${interviewer.id}_q${i}" value="${score}" class="mr-1">
                                    <span class="text-sm">${score}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div>
                    <label class="text-sm text-gray-700">ความคิดเห็นเพิ่มเติม:</label>
                    <textarea id="comment_interviewer${interviewer.id}" rows="2" class="w-full border rounded px-3 py-2 mt-1 text-sm" placeholder="บันทึกความคิดเห็น..."></textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function submitInterviewScores() {
    if (!currentApplicant) {
        alert('กรุณาเลือกผู้สมัครก่อน');
        return;
    }
    
    const interview = getInterview(currentApplicant.id);
    if (!interview || !interview.questions) {
        alert('กรุณาสร้างแบบสัมภาษณ์ก่อน');
        return;
    }
    
    const scores = [];
    const numQuestions = interview.questions.length;
    
    for (let interviewerId = 1; interviewerId <= 5; interviewerId++) {
        const interviewerScores = [];
        let totalScore = 0;
        let answeredCount = 0;
        
        for (let q = 0; q < numQuestions; q++) {
            const selected = document.querySelector(`input[name="interviewer${interviewerId}_q${q}"]:checked`);
            if (selected) {
                const score = parseInt(selected.value);
                interviewerScores.push(score);
                totalScore += score;
                answeredCount++;
            }
        }
        
        const comment = document.getElementById(`comment_interviewer${interviewerId}`)?.value || '';
        
        scores.push({
            interviewerId: interviewerId,
            scores: interviewerScores,
            total: totalScore,
            average: answeredCount > 0 ? (totalScore / answeredCount).toFixed(2) : 0,
            comment: comment
        });
    }
    
    // Save scores
    interview.scores = scores;
    interview.completedAt = new Date().toISOString();
    saveInterview(interview);
    
    // Update applicant status
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === currentApplicant.id);
    if (index >= 0) {
        applicants[index].status = 'interviewed';
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
    }
    
    alert('ส่งคะแนนการสัมภาษณ์สำเร็จ!');
}

// ===== HELPERS =====
function getInterview(applicantId) {
    const interviews = store.getInterviews();
    return interviews.find(i => i.applicantId === applicantId);
}

function saveInterview(interview) {
    const interviews = store.getInterviews();
    const index = interviews.findIndex(i => i.applicantId === interview.applicantId);
    if (index >= 0) {
        interviews[index] = interview;
    } else {
        interviews.push(interview);
    }
    localStorage.setItem(store.keys.interviews, JSON.stringify(interviews));
}

function goToSummary() {
    if (!currentApplicant) {
        alert('กรุณาเลือกผู้สมัครก่อน');
        return;
    }
    window.location.href = 'summary.html';
}
