// ai-analysis.js - AI Analysis Page

let currentApplicant = null;
let currentAssessment = null;

document.addEventListener('DOMContentLoaded', () => {
    loadApplicantAndAssessment();
});

function loadApplicantAndAssessment() {
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
                <label class="text-sm font-medium text-gray-600">วันที่สมัคร</label>
                <p>${formatDate(currentApplicant.applyDate)}</p>
            </div>
        </div>
    `;
    
    // Load assessment
    const assessments = store.getAssessments();
    currentAssessment = assessments.find(a => a.applicantId === applicantId);
    
    if (!currentAssessment) {
        document.getElementById('scoresDisplay').innerHTML = `
            <div class="col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">⚠️ ผู้สมัครยังไม่ได้ทำแบบทดสอบ <a href="assessment.html" class="underline font-semibold">ทำแบบทดสอบ</a></p>
            </div>
        `;
        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('analyzeBtn').classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }
    
    // Display scores
    displayScores(currentAssessment.scores);
}

function displayScores(scores) {
    const categories = {
        attitude: { name: 'ทัศนคติ', icon: '🎯', color: 'blue' },
        skill: { name: 'ทักษะ', icon: '💡', color: 'green' },
        cc: { name: 'ทุนองค์กร (CC)', icon: '🏢', color: 'purple' },
        '3e3p': { name: '3E3P', icon: '📊', color: 'orange' }
    };
    
    const scoresHtml = Object.keys(categories).map(key => {
        const cat = categories[key];
        const score = scores[key];
        if (!score) return '';
        
        return `
            <div class="bg-${cat.color}-50 border border-${cat.color}-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-${cat.color}-900">${cat.icon} ${cat.name}</h3>
                    <span class="text-2xl font-bold text-${cat.color}-600">${score.percentage}%</span>
                </div>
                <div class="text-sm text-${cat.color}-700">
                    <p>คะแนนเฉลี่ย: ${score.average} / 5</p>
                    <p>คะแนนรวม: ${score.total} / ${score.count * 5}</p>
                </div>
                <div class="mt-2 bg-${cat.color}-200 rounded-full h-2">
                    <div class="bg-${cat.color}-500 h-2 rounded-full" style="width: ${score.percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Overall score
    const overallHtml = `
        <div class="col-span-2 bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-gray-900 text-lg">📈 คะแนนรวม</h3>
                <span class="text-3xl font-bold text-gray-700">${scores.overall.percentage}%</span>
            </div>
            <div class="text-sm text-gray-700">
                <p>คะแนนเฉลี่ย: ${scores.overall.average} / 5</p>
                <p>คะแนนรวม: ${scores.overall.total} / ${scores.overall.count * 5}</p>
            </div>
            <div class="mt-2 bg-gray-300 rounded-full h-3">
                <div class="bg-gray-600 h-3 rounded-full" style="width: ${scores.overall.percentage}%"></div>
            </div>
        </div>
    `;
    
    document.getElementById('scoresDisplay').innerHTML = scoresHtml + overallHtml;
}

function generateAIAnalysis() {
    if (!currentApplicant || !currentAssessment) {
        alert('ไม่มีข้อมูลสำหรับวิเคราะห์');
        return;
    }
    
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner border-white"></span> กำลังวิเคราะห์...';
    
    // Simulate AI analysis (in real implementation, this would call an AI API)
    setTimeout(() => {
        const analysis = performAnalysis();
        displayAnalysis(analysis);
        
        btn.innerHTML = '✅ วิเคราะห์เสร็จสิ้น';
        btn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
    }, 2000);
}

function performAnalysis() {
    const scores = currentAssessment.scores;
    const analysis = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        overallAssessment: '',
        recommendation: ''
    };
    
    // Analyze strengths
    if (scores.attitude && scores.attitude.average >= 4) {
        analysis.strengths.push('มีทัศนคติเชิงบวกที่ดีเยี่ยม');
    }
    if (scores.skill && scores.skill.average >= 4) {
        analysis.strengths.push('มีทักษะที่แข็งแกร่ง');
    }
    if (scores.cc && scores.cc.average >= 4) {
        analysis.strengths.push('มีทุนองค์กร (CC) สูง สอดคล้องกับวัฒนธรรมองค์กร');
    }
    if (scores['3e3p'] && scores['3e3p'].average >= 4) {
        analysis.strengths.push('มีคุณสมบัติ 3E3P ครบถ้วน');
    }
    
    // Analyze weaknesses
    if (scores.attitude && scores.attitude.average < 3) {
        analysis.weaknesses.push('ทัศนคติอาจต้องพัฒนาเพิ่มเติม');
    }
    if (scores.skill && scores.skill.average < 3) {
        analysis.weaknesses.push('ทักษะอาจไม่ตรงกับความต้องการของตำแหน่ง');
    }
    if (scores.cc && scores.cc.average < 3) {
        analysis.weaknesses.push('ทุนองค์กร (CC) อาจไม่สอดคล้องกับวัฒนธรรมองค์กร');
    }
    if (scores['3e3p'] && scores['3e3p'].average < 3) {
        analysis.weaknesses.push('คุณสมบัติ 3E3P ยังต้องพัฒนา');
    }
    
    // Overall assessment
    const overallAvg = scores.overall.average;
    if (overallAvg >= 4.5) {
        analysis.overallAssessment = 'ยอดเยี่ยม';
        analysis.recommendation = 'ควรรับเข้าทำงานอย่างยิ่ง';
    } else if (overallAvg >= 4) {
        analysis.overallAssessment = 'ดีมาก';
        analysis.recommendation = 'ควรรับเข้าทำงาน';
    } else if (overallAvg >= 3.5) {
        analysis.overallAssessment = 'ดี';
        analysis.recommendation = 'พิจารณาเข้าสัมภาษณ์';
    } else if (overallAvg >= 3) {
        analysis.overallAssessment = 'ปานกลาง';
        analysis.recommendation = 'ต้องพิจารณาเพิ่มเติม';
    } else {
        analysis.overallAssessment = 'ต้องปรับปรุง';
        analysis.recommendation = 'ยังไม่ผ่านในขณะนี้';
    }
    
    // Recommendations
    if (scores.attitude && scores.attitude.average < 4) {
        analysis.recommendations.push('พัฒนาทัศนคติเชิงบวกและการทำงานเป็นทีม');
    }
    if (scores.skill && scores.skill.average < 4) {
        analysis.recommendations.push('พัฒนาทักษะเฉพาะทางให้ตรงกับตำแหน่ง');
    }
    if (scores.cc && scores.cc.average < 4) {
        analysis.recommendations.push('ศึกษาและทำความเข้าใจวัฒนธรรมองค์กร (CC)');
    }
    if (scores['3e3p'] && scores['3e3p'].average < 4) {
        analysis.recommendations.push('พัฒนาคุณสมบัติ 3E3P (Energy, Enthusiasm, Execution, Purpose, Passion, Perseverance)');
    }
    
    if (analysis.recommendations.length === 0) {
        analysis.recommendations.push('พร้อมทำงานทันที ไม่ต้องพัฒนาเพิ่มเติม');
    }
    
    return analysis;
}

function displayAnalysis(analysis) {
    const content = document.getElementById('analysisContent');
    
    content.innerHTML = `
        <div>
            <h4 class="font-bold text-green-700 mb-2">✅ จุดแข็ง</h4>
            <ul class="list-disc list-inside space-y-1">
                ${analysis.strengths.length > 0 ? 
                    analysis.strengths.map(s => `<li>${s}</li>`).join('') : 
                    '<li class="text-gray-500">ไม่มีข้อมูล</li>'
                }
            </ul>
        </div>
        
        <div>
            <h4 class="font-bold text-red-700 mb-2">⚠️ จุดที่ต้องพัฒนา</h4>
            <ul class="list-disc list-inside space-y-1">
                ${analysis.weaknesses.length > 0 ? 
                    analysis.weaknesses.map(w => `<li>${w}</li>`).join('') : 
                    '<li class="text-gray-500">ไม่มีข้อมูล</li>'
                }
            </ul>
        </div>
        
        <div>
            <h4 class="font-bold text-blue-700 mb-2">💡 ข้อเสนอแนะ</h4>
            <ul class="list-disc list-inside space-y-1">
                ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>
        
        <div class="border-t pt-4 mt-4">
            <h4 class="font-bold text-gray-900 mb-2">📊 สรุปภาพรวม</h4>
            <p class="text-lg"><strong>ระดับ:</strong> ${analysis.overallAssessment}</p>
            <p class="text-lg"><strong>คำแนะนำ:</strong> ${analysis.recommendation}</p>
        </div>
    `;
    
    document.getElementById('aiAnalysis').classList.remove('hidden');
    
    // Save analysis
    const analysisData = {
        applicantId: currentApplicant.id,
        analysis: analysis,
        analyzedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`analysis_${currentApplicant.id}`, JSON.stringify(analysisData));
}

function selectForInterview() {
    if (!currentApplicant) return;
    
    if (!confirm(`ต้องการคัดเลือก ${currentApplicant.fullName} เข้าสัมภาษณ์หรือไม่?`)) {
        return;
    }
    
    // Update status
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === currentApplicant.id);
    if (index >= 0) {
        applicants[index].status = 'interview_selected';
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
    }
    
    alert('คัดเลือกเข้าสัมภาษณ์สำเร็จ!');
    window.location.href = 'interview.html';
}

function rejectApplicant() {
    if (!currentApplicant) return;
    
    if (!confirm(`ต้องการปฏิเสธ ${currentApplicant.fullName} หรือไม่?`)) {
        return;
    }
    
    // Update status
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === currentApplicant.id);
    if (index >= 0) {
        applicants[index].status = 'rejected';
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
    }
    
    alert('บันทึกผลการปฏิเสธ');
    window.location.href = 'applicants.html';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
