// summary.js - Final Summary (Step 9)

let currentApplicant = null;
let currentAssessment = null;
let currentInterview = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function loadAllData() {
    const applicantId = localStorage.getItem('currentApplicantId');
    if (!applicantId) {
        document.getElementById('applicantDetails').innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">⚠️ กรุณาเลือกผู้สมัครจาก<a href="applicants.html" class="underline font-semibold">หน้ารายชื่อ</a>ก่อน</p>
            </div>
        `;
        return;
    }
    
    const applicants = store.getApplicants();
    currentApplicant = applicants.find(a => a.id === applicantId);
    
    if (!currentApplicant) {
        document.getElementById('applicantDetails').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">❌ ไม่พบข้อมูลผู้สมัคร</p>
            </div>
        `;
        return;
    }
    
    // Display applicant info
    document.getElementById('applicantDetails').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <label class="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</label>
                <p class="text-lg font-semibold">${currentApplicant.fullName}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-600">ตำแหน่ง</label>
                <p class="text-lg">${currentApplicant.position || '-'}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-600">แผนก</label>
                <p>${currentApplicant.department || '-'}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-gray-600">สถานะ</label>
                <p>${getStatusText(currentApplicant.status)}</p>
            </div>
        </div>
    `;
    
    // Load assessment
    const assessments = store.getAssessments();
    currentAssessment = assessments.find(a => a.applicantId === applicantId);
    
    // Load interview
    const interviews = store.getInterviews();
    currentInterview = interviews.find(i => i.applicantId === applicantId);
    
    // Render score summary
    renderScoreSummary();
}

function renderScoreSummary() {
    const container = document.getElementById('scoreSummary');
    
    if (!currentInterview || !currentInterview.scores) {
        container.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">⚠️ ยังไม่มีคะแนนการสัมภาษณ์ <a href="interview.html" class="underline font-semibold">ไปให้คะแนน</a></p>
            </div>
        `;
        return;
    }
    
    const interviewerNames = [
        'ผู้สัมภาษณ์ 1 (หัวหน้างาน)',
        'ผู้สัมภาษณ์ 2 (HR)',
        'ผู้สัมภาษณ์ 3 (เพื่อนร่วมงาน)',
        'ผู้สัมภาษณ์ 4 (ผู้บริหาร)',
        'ผู้สัมภาษณ์ 5 (ที่ปรึกษา)'
    ];
    
    let html = '<div class="overflow-x-auto"><table class="min-w-full">';
    html += '<thead class="bg-gray-100"><tr>';
    html += '<th class="px-4 py-2 text-left">ผู้สัมภาษณ์</th>';
    html += '<th class="px-4 py-2 text-center">คะแนนเฉลี่ย</th>';
    html += '<th class="px-4 py-2 text-center">คะแนนรวม</th>';
    html += '<th class="px-4 py-2 text-left">ความคิดเห็น</th>';
    html += '</tr></thead><tbody>';
    
    let totalAvg = 0;
    let count = 0;
    
    currentInterview.scores.forEach((score, index) => {
        const avg = parseFloat(score.average) || 0;
        totalAvg += avg;
        count++;
        
        html += `
            <tr class="border-b">
                <td class="px-4 py-3">${interviewerNames[index] || `ผู้สัมภาษณ์ ${index + 1}`}</td>
                <td class="px-4 py-3 text-center font-bold">${avg.toFixed(2)} / 5</td>
                <td class="px-4 py-3 text-center">${score.total || 0}</td>
                <td class="px-4 py-3 text-sm">${score.comment || '-'}</td>
            </tr>
        `;
    });
    
    const overallAvg = count > 0 ? (totalAvg / count).toFixed(2) : 0;
    
    html += `
        <tr class="bg-indigo-50 font-bold">
            <td class="px-4 py-3">คะแนนรวมเฉลี่ย</td>
            <td class="px-4 py-3 text-center text-indigo-700 text-lg">${overallAvg} / 5</td>
            <td class="px-4 py-3 text-center">-</td>
            <td class="px-4 py-3">-</td>
        </tr>
    `;
    
    html += '</tbody></table></div>';
    
    // Assessment scores
    if (currentAssessment && currentAssessment.scores) {
        html += `
            <div class="mt-6 border-t pt-4">
                <h3 class="font-bold mb-3">คะแนนแบบทดสอบ</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="bg-blue-50 rounded p-3">
                        <p class="text-sm text-blue-700">ทัศนคติ</p>
                        <p class="text-xl font-bold text-blue-900">${currentAssessment.scores.attitude?.percentage || 0}%</p>
                    </div>
                    <div class="bg-green-50 rounded p-3">
                        <p class="text-sm text-green-700">ทักษะ</p>
                        <p class="text-xl font-bold text-green-900">${currentAssessment.scores.skill?.percentage || 0}%</p>
                    </div>
                    <div class="bg-purple-50 rounded p-3">
                        <p class="text-sm text-purple-700">CC</p>
                        <p class="text-xl font-bold text-purple-900">${currentAssessment.scores.cc?.percentage || 0}%</p>
                    </div>
                    <div class="bg-orange-50 rounded p-3">
                        <p class="text-sm text-orange-700">3E3P</p>
                        <p class="text-xl font-bold text-orange-900">${currentAssessment.scores['3e3p']?.percentage || 0}%</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function generateFinalSummary() {
    if (!currentApplicant || !currentInterview) {
        alert('ไม่มีข้อมูลสำหรับสรุป');
        return;
    }
    
    const btn = document.getElementById('summaryBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner border-white"></span> กำลังสรุปผล...';
    
    setTimeout(() => {
        const summary = performFinalAnalysis();
        displayFinalSummary(summary);
        
        btn.innerHTML = '✅ สรุปผลเสร็จสิ้น';
        btn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
    }, 2000);
}

function performFinalAnalysis() {
    const interviewAvg = currentInterview.scores.reduce((sum, s) => sum + parseFloat(s.average || 0), 0) / currentInterview.scores.length;
    const assessmentAvg = currentAssessment?.scores?.overall?.average || 0;
    
    const combinedScore = (interviewAvg * 0.6 + assessmentAvg * 0.4).toFixed(2);
    
    let recommendation = '';
    let level = '';
    
    if (combinedScore >= 4.5) {
        level = 'ยอดเยี่ยม';
        recommendation = 'ควรรับเข้าทำงานอย่างยิ่ง ผู้สมัครมีคุณสมบัติครบถ้วนทั้งทักษะ ทัศนคติ และวัฒนธรรมองค์กร';
    } else if (combinedScore >= 4) {
        level = 'ดีมาก';
        recommendation = 'ควรรับเข้าทำงาน ผู้สมัครมีคุณสมบัติดีและสอดคล้องกับองค์กร';
    } else if (combinedScore >= 3.5) {
        level = 'ดี';
        recommendation = 'พิจารณารับเข้าทำงาน อาจต้องพัฒนาเพิ่มเติมบางด้าน';
    } else if (combinedScore >= 3) {
        level = 'ปานกลาง';
        recommendation = 'ต้องพิจารณาเพิ่มเติม มีจุดแข็งและจุดอ่อนที่ชัดเจน';
    } else {
        level = 'ต้องปรับปรุง';
        recommendation = 'ยังไม่ผ่านในขณะนี้ คุณสมบัติยังไม่ตรงกับความต้องการ';
    }
    
    // Collect interviewer comments
    const comments = currentInterview.scores
        .filter(s => s.comment && s.comment.trim())
        .map(s => s.comment);
    
    return {
        level: level,
        combinedScore: combinedScore,
        interviewAvg: interviewAvg.toFixed(2),
        assessmentAvg: assessmentAvg.toFixed(2),
        recommendation: recommendation,
        comments: comments,
        strengths: identifyStrengths(),
        concerns: identifyConcerns()
    };
}

function identifyStrengths() {
    const strengths = [];
    
    if (currentAssessment?.scores?.attitude?.average >= 4) {
        strengths.push('ทัศนคติเชิงบวก');
    }
    if (currentAssessment?.scores?.skill?.average >= 4) {
        strengths.push('ทักษะแข็งแกร่ง');
    }
    if (currentAssessment?.scores?.cc?.average >= 4) {
        strengths.push('สอดคล้องกับวัฒนธรรมองค์กร');
    }
    if (currentInterview?.scores) {
        const highScores = currentInterview.scores.filter(s => parseFloat(s.average) >= 4);
        if (highScores.length >= 3) {
            strengths.push('ได้รับการประเมินดีจากผู้สัมภาษณ์ส่วนใหญ่');
        }
    }
    
    return strengths;
}

function identifyConcerns() {
    const concerns = [];
    
    if (currentAssessment?.scores?.attitude?.average < 3) {
        concerns.push('ทัศนคติอาจต้องพัฒนา');
    }
    if (currentAssessment?.scores?.skill?.average < 3) {
        concerns.push('ทักษะอาจไม่เพียงพอ');
    }
    if (currentAssessment?.scores?.cc?.average < 3) {
        concerns.push('อาจไม่สอดคล้องกับวัฒนธรรมองค์กร');
    }
    if (currentInterview?.scores) {
        const lowScores = currentInterview.scores.filter(s => parseFloat(s.average) < 3);
        if (lowScores.length >= 2) {
            concerns.push('ผู้สัมภาษณ์บางคนมีข้อกังวล');
        }
    }
    
    return concerns;
}

function displayFinalSummary(summary) {
    const content = document.getElementById('summaryContent');
    
    content.innerHTML = `
        <div class="text-center mb-6">
            <p class="text-3xl font-bold text-indigo-900">${summary.level}</p>
            <p class="text-xl text-indigo-700 mt-2">คะแนนรวม: ${summary.combinedScore} / 5</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white rounded p-3">
                <p class="text-sm text-gray-600">คะแนนสัมภาษณ์</p>
                <p class="text-xl font-bold">${summary.interviewAvg} / 5</p>
            </div>
            <div class="bg-white rounded p-3">
                <p class="text-sm text-gray-600">คะแนนแบบทดสอบ</p>
                <p class="text-xl font-bold">${summary.assessmentAvg} / 5</p>
            </div>
        </div>
        
        <div class="mb-4">
            <h4 class="font-bold text-green-700 mb-2">✅ จุดแข็ง</h4>
            <ul class="list-disc list-inside space-y-1">
                ${summary.strengths.length > 0 ? 
                    summary.strengths.map(s => `<li>${s}</li>`).join('') : 
                    '<li class="text-gray-500">ไม่มีข้อมูล</li>'
                }
            </ul>
        </div>
        
        <div class="mb-4">
            <h4 class="font-bold text-red-700 mb-2">⚠️ ข้อกังวล</h4>
            <ul class="list-disc list-inside space-y-1">
                ${summary.concerns.length > 0 ? 
                    summary.concerns.map(c => `<li>${c}</li>`).join('') : 
                    '<li class="text-gray-500">ไม่มีข้อกังวล</li>'
                }
            </ul>
        </div>
        
        ${summary.comments.length > 0 ? `
        <div class="mb-4">
            <h4 class="font-bold text-blue-700 mb-2">💬 ความคิดเห็นจากผู้สัมภาษณ์</h4>
            <ul class="list-disc list-inside space-y-1 text-sm">
                ${summary.comments.map(c => `<li>"${c}"</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div class="border-t pt-4 mt-4">
            <h4 class="font-bold text-indigo-900 mb-2">📋 คำแนะนำ AI</h4>
            <p class="text-lg">${summary.recommendation}</p>
        </div>
    `;
    
    document.getElementById('finalSummary').classList.remove('hidden');
    
    // Save summary
    const summaryData = {
        applicantId: currentApplicant.id,
        summary: summary,
        createdAt: new Date().toISOString()
    };
    store.saveSummary(summaryData);
}

function finalDecision(decision) {
    if (!currentApplicant) return;
    
    const action = decision === 'accepted' ? 'รับเข้าทำงาน' : 'ไม่ผ่าน';
    if (!confirm(`ต้องการ${action} ${currentApplicant.fullName} หรือไม่?`)) return;
    
    // Update status
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === currentApplicant.id);
    if (index >= 0) {
        applicants[index].status = decision;
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
    }
    
    alert(`บันทึกการตัดสินใจ: ${action}`);
    window.location.href = 'applicants.html';
}

function getStatusText(status) {
    const statuses = {
        new: 'ใหม่',
        screened: 'ผ่านการคัดเลือก',
        assessed: 'ทำแบบทดสอบแล้ว',
        interview_selected: 'ได้เข้าสัมภาษณ์',
        interviewed: 'สัมภาษณ์แล้ว',
        accepted: 'รับเข้าทำงาน',
        rejected: 'ไม่ผ่าน'
    };
    return statuses[status] || status;
}
