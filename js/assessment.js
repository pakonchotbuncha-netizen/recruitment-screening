// assessment.js - จัดการหน้าแบบทดสอบ

let currentApplicant = null;
let currentTab = 'attitude';

// ===== QUESTIONS DATA =====
const questions = {
    attitude: [
        {
            id: 'att1',
            question: 'ท่านรู้สึกอย่างไรเมื่อต้องทำงานภายใต้ความกดดัน?',
            options: [
                { value: 1, text: 'รู้สึกเครียดและหลีกเลี่ยง' },
                { value: 2, text: 'พยายามทนทำต่อไป' },
                { value: 3, text: 'หาวิธีจัดการกับความกดดัน' },
                { value: 4, text: 'มองว่าเป็นความท้าทายและเรียนรู้' },
                { value: 5, text: 'ใช้โอกาสพัฒนาตัวเองและทีม' }
            ]
        },
        {
            id: 'att2',
            question: 'เมื่อเกิดข้อขัดแย้งในทีม ท่านจะทำอย่างไร?',
            options: [
                { value: 1, text: 'หลีกเลี่ยงและไม่เข้าร่วม' },
                { value: 2, text: 'รอให้คนอื่นแก้ไข' },
                { value: 3, text: 'พยายามประนีประนอม' },
                { value: 4, text: 'รับฟังทุกฝ่ายและหาทางออก' },
                { value: 5, text: 'สร้างฉันทมติและเรียนรู้จากความขัดแย้ง' }
            ]
        },
        {
            id: 'att3',
            question: 'ท่านมีทัศนคติต่อการเปลี่ยนแปลงอย่างไร?',
            options: [
                { value: 1, text: 'ไม่ชอบเปลี่ยนแปลง ยึดติดกับวิธีเดิม' },
                { value: 2, text: 'ยอมรับแต่รู้สึกไม่สบายใจ' },
                { value: 3, text: 'ปรับตัวได้แต่ต้องใช้เวลา' },
                { value: 4, text: 'ยอมรับและมองหาโอกาสใหม่' },
                { value: 5, text: 'กระตือรือร้นและริเริ่มเปลี่ยนแปลง' }
            ]
        },
        {
            id: 'att4',
            question: 'เมื่อทำงานสำเร็จ ท่านรู้สึกอย่างไร?',
            options: [
                { value: 1, text: 'พอใจแค่ตัวเอง' },
                { value: 2, text: 'ดีใจแต่ไม่แบ่งปัน' },
                { value: 3, text: 'ขอบคุณทีมที่ช่วย' },
                { value: 4, text: 'ยกความดีให้ทีมและเรียนรู้' },
                { value: 5, text: 'แบ่งปันความสำเร็จและสร้างแรงบันดาลใจ' }
            ]
        },
        {
            id: 'att5',
            question: 'ท่านจัดการกับข้อผิดพลาดอย่างไร?',
            options: [
                { value: 1, text: 'โทษคนอื่นหรือสถานการณ์' },
                { value: 2, text: 'รู้สึกผิดและหลีกเลี่ยง' },
                { value: 3, text: 'ยอมรับและแก้ไข' },
                { value: 4, text: 'เรียนรู้และป้องกันไม่ให้เกิดซ้ำ' },
                { value: 5, text: 'แบ่งปันบทเรียนและช่วยทีมเรียนรู้' }
            ]
        }
    ],
    skill: [
        {
            id: 'skill1',
            question: 'ท่านสามารถวางแผนและจัดลำดับความสำคัญของงานได้อย่างไร?',
            options: [
                { value: 1, text: 'ทำตามที่บอกเท่านั้น' },
                { value: 2, text: 'พยายามจัดลำดับแต่ยังสับสน' },
                { value: 3, text: 'สามารถจัดลำดับงานพื้นฐานได้' },
                { value: 4, text: 'วางแผนและจัดลำดับได้อย่างมีประสิทธิภาพ' },
                { value: 5, text: 'วางแผนเชิงกลยุทธ์และปรับตัวได้ตามสถานการณ์' }
            ]
        },
        {
            id: 'skill2',
            question: 'ทักษะการสื่อสารและการนำเสนอของท่านเป็นอย่างไร?',
            options: [
                { value: 1, text: 'กลัวการพูดต่อหน้าคนอื่น' },
                { value: 2, text: 'สื่อสารได้แต่ไม่ชัดเจน' },
                { value: 3, text: 'สื่อสารและนำเสนอได้ดีในระดับหนึ่ง' },
                { value: 4, text: 'สื่อสารชัดเจนและโน้มน้าวได้' },
                { value: 5, text: 'เป็นนักสื่อสารที่ยอดเยี่ยมและสร้างแรงบันดาลใจ' }
            ]
        },
        {
            id: 'skill3',
            question: 'ท่านสามารถแก้ปัญหาที่ซับซ้อนได้อย่างไร?',
            options: [
                { value: 1, text: 'หลีกเลี่ยงปัญหาที่ซับซ้อน' },
                { value: 2, text: 'พยายามแก้แต่ยังขาดระบบ' },
                { value: 3, text: 'วิเคราะห์และแก้ปัญหาเป็นขั้นตอน' },
                { value: 4, text: 'ใช้ข้อมูลและวิเคราะห์อย่างมีระบบ' },
                { value: 5, text: 'คิดค้นแนวทางใหม่และป้องกันปัญหาล่วงหน้า' }
            ]
        },
        {
            id: 'skill4',
            question: 'ท่านทำงานเป็นทีมอย่างไร?',
            options: [
                { value: 1, text: 'ชอบทำงานคนเดียว' },
                { value: 2, text: 'ทำงานตามที่ได้รับมอบหมาย' },
                { value: 3, text: 'ร่วมมือและช่วยเหลือทีม' },
                { value: 4, text: 'สร้างบรรยากาศทีมที่ดี' },
                { value: 5, text: 'เป็นผู้นำทีมและสร้างแรงบันดาลใจ' }
            ]
        },
        {
            id: 'skill5',
            question: 'ท่านเรียนรู้สิ่งใหม่อย่างไร?',
            options: [
                { value: 1, text: 'ไม่ชอบเรียนรู้สิ่งใหม่' },
                { value: 2, text: 'เรียนรู้เมื่อจำเป็น' },
                { value: 3, text: 'เรียนรู้และพัฒนาตัวเองอย่างต่อเนื่อง' },
                { value: 4, text: 'แสวงหาความรู้ใหม่อยู่เสมอ' },
                { value: 5, text: 'แบ่งปันความรู้และสร้างวัฒนธรรมการเรียนรู้' }
            ]
        }
    ],
    cc: [
        {
            id: 'cc1',
            question: 'CC1: ความเก่งในการนำผู้รับใช้ (Servant Leadership)',
            options: [
                { value: 1, text: 'ยังไม่เข้าใจแนวคิด' },
                { value: 2, text: 'เข้าใจแต่ยังปฏิบัติไม่ได้' },
                { value: 3, text: 'พยายามปฏิบัติในบางสถานการณ์' },
                { value: 4, text: 'ปฏิบัติได้อย่างสม่ำเสมอ' },
                { value: 5, text: 'เป็นแบบอย่างและสอนคนอื่นได้' }
            ]
        },
        {
            id: 'cc2',
            question: 'CC2: ความเก่งในการปรับตัวและสร้างนวัตกรรม',
            options: [
                { value: 1, text: 'ยึดติดกับวิธีเดิม' },
                { value: 2, text: 'ยอมรับการเปลี่ยนแปลงแต่ไม่ริเริ่ม' },
                { value: 3, text: 'ปรับตัวและคิดค้นวิธีใหม่ในบางเรื่อง' },
                { value: 4, text: 'สร้างนวัตกรรมและปรับปรุงอย่างต่อเนื่อง' },
                { value: 5, text: 'เป็นผู้นำการเปลี่ยนแปลงและสร้างวัฒนธรรมนวัตกรรม' }
            ]
        },
        {
            id: 'cc3',
            question: 'CC3: ความเก่งในการสร้างคุณค่าบนฐานความไว้วางใจ',
            options: [
                { value: 1, text: 'ยังไม่สร้างความไว้วางใจ' },
                { value: 2, text: 'พยายามแต่ยังไม่สม่ำเสมอ' },
                { value: 3, text: 'สร้างความไว้วางใจในระดับหนึ่ง' },
                { value: 4, text: 'สร้างคุณค่าและได้รับความไว้วางใจ' },
                { value: 5, text: 'เป็นที่ยอมรับและสร้างคุณค่าเกินคาดหวัง' }
            ]
        },
        {
            id: 'cc4',
            question: 'CC4: ความเก่งในการทำงานทีมด้วยฉันทมติ',
            options: [
                { value: 1, text: 'ทำงานคนเดียวเป็นหลัก' },
                { value: 2, text: 'ทำงานตามทีมแต่ไม่มีส่วนร่วม' },
                { value: 3, text: 'ร่วมมือและหาฉันทมติในบางเรื่อง' },
                { value: 4, text: 'สร้างฉันทมติและทำงานเป็นทีมได้ดี' },
                { value: 5, text: 'เป็นผู้นำทีมและสร้างฉันทมติในทุกการตัดสินใจ' }
            ]
        },
        {
            id: 'cc5',
            question: 'CC5: ความเก่งในวิชาชีพและวินัยองค์กร',
            options: [
                { value: 1, text: 'ยังไม่แสดงความเป็นวิชาชีพ' },
                { value: 2, text: 'พยายามแต่ยังขาดวินัย' },
                { value: 3, text: 'แสดงวิชาชีพและมีวินัยในระดับหนึ่ง' },
                { value: 4, text: 'เป็นมืออาชีพและมีวินัยสูง' },
                { value: 5, text: 'เป็นแบบอย่างและสร้างวัฒนธรรมวิชาชีพ' }
            ]
        },
        {
            id: 'cc6',
            question: 'CC6: ความเก่งในการใช้เทคโนโลยี',
            options: [
                { value: 1, text: 'ไม่ใช้เทคโนโลยี' },
                { value: 2, text: 'ใช้พื้นฐานเท่านั้น' },
                { value: 3, text: 'ใช้เทคโนโลยีในการทำงานได้' },
                { value: 4, text: 'ใช้เทคโนโลยีเพิ่มประสิทธิภาพ' },
                { value: 5, text: 'เป็นผู้นำและสอนคนอื่นใช้เทคโนโลยี' }
            ]
        },
        {
            id: 'cc7',
            question: 'CC7: ความเก่งในการสร้างบรรยากาศด้วยอารมณ์ขัน',
            options: [
                { value: 1, text: 'ไม่ใช้ humor ในการทำงาน' },
                { value: 2, text: 'ใช้บ้างแต่ไม่สม่ำเสมอ' },
                { value: 3, text: 'สร้างบรรยากาศที่ดีในบางโอกาส' },
                { value: 4, text: 'ใช้ humor สร้างบรรยากาศทีมอย่างสม่ำเสมอ' },
                { value: 5, text: 'เป็นผู้นำในการสร้างวัฒนธรรมความสุข' }
            ]
        }
    ],
    '3e3p': [
        {
            id: '3e1',
            question: '3E ตัวที่ 1: Energy (พลังงาน) - ท่านมีพลังงานและแรงจูงใจในการทำงานอย่างไร?',
            options: [
                { value: 1, text: 'หมดแรงและขาดแรงจูงใจ' },
                { value: 2, text: 'มีพลังงานแต่ไม่สม่ำเสมอ' },
                { value: 3, text: 'มีพลังงานและแรงจูงใจในระดับหนึ่ง' },
                { value: 4, text: 'มีพลังงานสูงและสร้างแรงบันดาลใจ' },
                { value: 5, text: 'เป็นแหล่งพลังงานและสร้างแรงจูงใจให้ทีม' }
            ]
        },
        {
            id: '3e2',
            question: '3E ตัวที่ 2: Enthusiasm (ความกระตือรือร้น) - ท่านมีความกระตือรือร้นต่องานอย่างไร?',
            options: [
                { value: 1, text: 'ไม่มีความกระตือรือร้น' },
                { value: 2, text: 'ทำตามที่บอกเท่านั้น' },
                { value: 3, text: 'กระตือรือร้นในงานที่สนใจ' },
                { value: 4, text: 'กระตือรือร้นและสร้างแรงบันดาลใจ' },
                { value: 5, text: 'เป็นผู้นำและสร้างวัฒนธรรมความกระตือรือร้น' }
            ]
        },
        {
            id: '3e3',
            question: '3E ตัวที่ 3: Execution (การลงมือทำ) - ท่านสามารถแปลงแผนไปสู่การปฏิบัติได้อย่างไร?',
            options: [
                { value: 1, text: 'ไม่ลงมือทำ' },
                { value: 2, text: 'ลงมือทำแต่ไม่สำเร็จ' },
                { value: 3, text: 'ลงมือทำและสำเร็จในบางเรื่อง' },
                { value: 4, text: 'ลงมือทำและสำเร็จอย่างสม่ำเสมอ' },
                { value: 5, text: 'ลงมือทำและสร้างผลลัพธ์ที่ยอดเยี่ยม' }
            ]
        },
        {
            id: '3p1',
            question: '3P ตัวที่ 1: Purpose (เป้าหมาย) - ท่านมีเป้าหมายและวิสัยทัศน์อย่างไร?',
            options: [
                { value: 1, text: 'ไม่มีเป้าหมาย' },
                { value: 2, text: 'มีเป้าหมายแต่ไม่ชัดเจน' },
                { value: 3, text: 'มีเป้าหมายและวางแผน' },
                { value: 4, text: 'มีเป้าหมายชัดเจนและมุ่งมั่น' },
                { value: 5, text: 'มีวิสัยทัศน์และสร้างแรงบันดาลใจให้ทีม' }
            ]
        },
        {
            id: '3p2',
            question: '3P ตัวที่ 2: Passion (ความหลงใหล) - ท่านมีความหลงใหลในงานอย่างไร?',
            options: [
                { value: 1, text: 'ไม่มีความหลงใหล' },
                { value: 2, text: 'ทำเพราะจำเป็น' },
                { value: 3, text: 'หลงใหลในงานบางด้าน' },
                { value: 4, text: 'หลงใหลและสร้างคุณค่า' },
                { value: 5, text: 'หลงใหลและส่งต่อความหลงใหลให้ทีม' }
            ]
        },
        {
            id: '3p3',
            question: '3P ตัวที่ 3: Perseverance (ความพากเพียร) - ท่านมีความพากเพียรต่ออุปสรรคอย่างไร?',
            options: [
                { value: 1, text: 'ยอมแพ้ง่าย' },
                { value: 2, text: 'พยายามแต่ล้มเลิกเร็ว' },
                { value: 3, text: 'พากเพียรในระดับหนึ่ง' },
                { value: 4, text: 'พากเพียรและหาทางแก้' },
                { value: 5, text: 'ไม่ยอมแพ้และสร้างความสำเร็จ' }
            ]
        }
    ]
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadApplicant();
    renderQuestions('attitude');
});

function loadApplicant() {
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
    
    // Load existing assessment if any
    const assessments = store.getAssessments();
    const existing = assessments.find(a => a.applicantId === applicantId);
    if (existing) {
        loadExistingAnswers(existing.answers);
    }
}

function loadExistingAnswers(answers) {
    Object.keys(answers).forEach(qId => {
        const input = document.querySelector(`input[name="${qId}"]:checked`);
        if (input) {
            input.checked = false;
        }
        const target = document.querySelector(`input[name="${qId}"][value="${answers[qId]}"]`);
        if (target) {
            target.checked = true;
        }
    });
}

// ===== TAB NAVIGATION =====
function showTab(tabName) {
    currentTab = tabName;
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.remove('text-gray-500', 'hover:text-gray-700');
            btn.classList.add('text-purple-600', 'border-b-2', 'border-purple-600');
        } else {
            btn.classList.remove('text-purple-600', 'border-b-2', 'border-purple-600');
            btn.classList.add('text-gray-500', 'hover:text-gray-700');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Render questions
    renderQuestions(tabName);
}

// ===== RENDER QUESTIONS =====
function renderQuestions(category) {
    const container = document.getElementById(`${category}Questions`);
    const categoryQuestions = questions[category];
    
    if (!categoryQuestions) {
        container.innerHTML = '<p class="text-gray-500">ไม่มีข้อสอบในหมวดนี้</p>';
        return;
    }
    
    container.innerHTML = categoryQuestions.map((q, index) => `
        <div class="border rounded-lg p-4">
            <p class="font-semibold mb-3">
                <span class="text-purple-600">${index + 1}.</span> ${q.question}
            </p>
            <div class="space-y-2">
                ${q.options.map(opt => `
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input type="radio" name="${q.id}" value="${opt.value}" class="w-4 h-4 text-purple-600">
                        <span class="text-gray-700">${opt.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ===== SUBMIT ASSESSMENT =====
function submitAssessment() {
    if (!currentApplicant) {
        alert('กรุณาเลือกผู้สมัครก่อน');
        return;
    }
    
    const answers = {};
    let allAnswered = true;
    
    // Collect all answers
    Object.keys(questions).forEach(category => {
        questions[category].forEach(q => {
            const selected = document.querySelector(`input[name="${q.id}"]:checked`);
            if (selected) {
                answers[q.id] = parseInt(selected.value);
            } else {
                allAnswered = false;
            }
        });
    });
    
    if (!allAnswered) {
        if (!confirm('ยังมีข้อสอบที่ยังไม่ได้ตอบ ต้องการส่งคำตอบหรือไม่?')) {
            return;
        }
    }
    
    // Calculate scores
    const scores = calculateScores(answers);
    
    // Save assessment
    const assessment = {
        applicantId: currentApplicant.id,
        answers: answers,
        scores: scores,
        submittedAt: new Date().toISOString()
    };
    
    store.saveAssessment(assessment);
    
    // Update applicant status
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === currentApplicant.id);
    if (index >= 0) {
        applicants[index].status = 'assessed';
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
    }
    
    alert('ส่งคำตอบสำเร็จ!');
    window.location.href = 'ai-analysis.html';
}

// ===== CALCULATE SCORES =====
function calculateScores(answers) {
    const scores = {};
    
    Object.keys(questions).forEach(category => {
        const categoryQuestions = questions[category];
        let total = 0;
        let count = 0;
        
        categoryQuestions.forEach(q => {
            if (answers[q.id] !== undefined) {
                total += answers[q.id];
                count++;
            }
        });
        
        scores[category] = {
            total: total,
            count: count,
            average: count > 0 ? (total / count).toFixed(2) : 0,
            percentage: count > 0 ? ((total / (count * 5)) * 100).toFixed(1) : 0
        };
    });
    
    // Overall score
    const allTotals = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
    const allCounts = Object.values(scores).reduce((sum, s) => sum + s.count, 0);
    
    scores.overall = {
        total: allTotals,
        count: allCounts,
        average: allCounts > 0 ? (allTotals / allCounts).toFixed(2) : 0,
        percentage: allCounts > 0 ? ((allTotals / (allCounts * 5)) * 100).toFixed(1) : 0
    };
    
    return scores;
}

// ===== UTILITIES =====
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
