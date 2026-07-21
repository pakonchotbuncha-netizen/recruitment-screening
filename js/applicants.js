// applicants.js - จัดการหน้ารายชื่อผู้สมัคร

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderApplicants();
    setupForm();
    setupFileUpload();
});

// ===== FORM SUBMIT =====
function setupForm() {
    const form = document.getElementById('applicantForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const applicant = {
            fullName: document.getElementById('fullName').value.trim(),
            position: document.getElementById('position').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            department: document.getElementById('department').value.trim(),
            applyDate: document.getElementById('applyDate').value,
            notes: document.getElementById('notes').value.trim(),
            status: 'new'
        };
        
        store.saveApplicant(applicant);
        form.reset();
        renderApplicants();
        showNotification('เพิ่มผู้สมัครสำเร็จ', 'success');
    });
}

// ===== FILE UPLOAD =====
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            importApplicants(jsonData);
        } catch (error) {
            showNotification('ไม่สามารถอ่านไฟล์ได้: ' + error.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function importApplicants(data) {
    let imported = 0;
    
    data.forEach(row => {
        // Map columns (รองรับทั้งภาษาไทยและอังกฤษ)
        const applicant = {
            fullName: row['ชื่อ-นามสกุล'] || row['ชื่อ'] || row['fullName'] || row['name'] || '',
            position: row['ตำแหน่ง'] || row['position'] || row['jobTitle'] || '',
            email: row['Email'] || row['email'] || row['อีเมล์'] || '',
            phone: row['เบอร์โทร'] || row['phone'] || row['telephone'] || '',
            department: row['แผนก'] || row['department'] || row['dept'] || '',
            applyDate: row['วันที่สมัคร'] || row['applyDate'] || row['date'] || '',
            notes: row['หมายเหตุ'] || row['notes'] || row['remark'] || '',
            status: 'new'
        };
        
        // ตรวจสอบว่ามีชื่อหรือไม่
        if (applicant.fullName) {
            const saved = store.saveApplicant(applicant);
            // แจ้งเตือนผู้สมัครใหม่
            if (typeof notification !== 'undefined') {
                notification.notifyNewApplicant(saved);
            }
            imported++;
        }
    });
    
    renderApplicants();
    showNotification(`นำเข้าสำเร็จ ${imported} รายการ`, 'success');
}

// ===== RENDER TABLE =====
function renderApplicants() {
    const applicants = store.getApplicants();
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter
    let filtered = applicants;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (searchTerm) {
        filtered = filtered.filter(a => 
            a.fullName.toLowerCase().includes(searchTerm) ||
            a.position.toLowerCase().includes(searchTerm) ||
            a.department.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update counts
    document.getElementById('showingCount').textContent = filtered.length;
    document.getElementById('totalCount').textContent = applicants.length;
    
    // Render table
    const tbody = document.getElementById('applicantsTable');
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้สมัคร
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(applicant => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-4 py-3">
                <div class="font-medium">${applicant.fullName}</div>
                ${applicant.email ? `<div class="text-sm text-gray-500">${applicant.email}</div>` : ''}
            </td>
            <td class="px-4 py-3">${applicant.position || '-'}</td>
            <td class="px-4 py-3">${applicant.department || '-'}</td>
            <td class="px-4 py-3">${formatDate(applicant.applyDate)}</td>
            <td class="px-4 py-3">
                ${getStatusBadge(applicant.status)}
            </td>
            <td class="px-4 py-3 text-center">
                <div class="flex gap-1 justify-center">
                    <button onclick="viewApplicant('${applicant.id}')" class="text-blue-600 hover:text-blue-800 px-2" title="ดูรายละเอียด">
                        👁️
                    </button>
                    <button onclick="updateStatus('${applicant.id}', 'screened')" class="text-green-600 hover:text-green-800 px-2" title="ผ่านการคัดเลือก">
                        ✅
                    </button>
                    <button onclick="deleteApplicant('${applicant.id}')" class="text-red-600 hover:text-red-800 px-2" title="ลบ">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== STATUS BADGE =====
function getStatusBadge(status) {
    const badges = {
        new: '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">ใหม่</span>',
        screened: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">ผ่านการคัดเลือก</span>',
        assessed: '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">ทำแบบทดสอบแล้ว</span>',
        interview_selected: '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">ได้เข้าสัมภาษณ์</span>',
        interviewed: '<span class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">สัมภาษณ์แล้ว</span>',
        accepted: '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">รับเข้าทำงาน</span>',
        rejected: '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">ไม่ผ่าน</span>'
    };
    return badges[status] || badges.new;
}

// ===== VIEW APPLICANT =====
function viewApplicant(id) {
    const applicants = store.getApplicants();
    const applicant = applicants.find(a => a.id === id);
    
    if (!applicant) return;
    
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</label>
                    <p class="text-lg font-semibold">${applicant.fullName}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">ตำแหน่ง</label>
                    <p class="text-lg">${applicant.position || '-'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Email</label>
                    <p>${applicant.email || '-'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">เบอร์โทร</label>
                    <p>${applicant.phone || '-'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">แผนก</label>
                    <p>${applicant.department || '-'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">วันที่สมัคร</label>
                    <p>${formatDate(applicant.applyDate)}</p>
                </div>
                <div class="col-span-2">
                    <label class="text-sm font-medium text-gray-600">สถานะ</label>
                    <p>${getStatusBadge(applicant.status)}</p>
                </div>
                ${applicant.notes ? `
                <div class="col-span-2">
                    <label class="text-sm font-medium text-gray-600">หมายเหตุ</label>
                    <p class="bg-gray-50 p-3 rounded">${applicant.notes}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="border-t pt-4 mt-4">
                <h4 class="font-semibold mb-2">การดำเนินการ</h4>
                <div class="flex gap-2 flex-wrap">
                    <button onclick="updateStatus('${applicant.id}', 'screened'); closeModal();" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                        ✅ ผ่านการคัดเลือก
                    </button>
                    <button onclick="goToAssessment('${applicant.id}'); closeModal();" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
                        📝 ทำแบบทดสอบ
                    </button>
                    <button onclick="goToInterview('${applicant.id}'); closeModal();" class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm">
                        🎤 นัดสัมภาษณ์
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// ===== UPDATE STATUS =====
function updateStatus(id, status) {
    const applicants = store.getApplicants();
    const index = applicants.findIndex(a => a.id === id);
    
    if (index >= 0) {
        applicants[index].status = status;
        applicants[index].updatedAt = new Date().toISOString();
        localStorage.setItem(store.keys.applicants, JSON.stringify(applicants));
        renderApplicants();
        showNotification('อัปเดตสถานะสำเร็จ', 'success');
    }
}

// ===== DELETE APPLICANT =====
function deleteApplicant(id) {
    if (!confirm('ต้องการลบผู้สมัครนี้หรือไม่?')) return;
    
    store.deleteApplicant(id);
    renderApplicants();
    showNotification('ลบผู้สมัครสำเร็จ', 'success');
}

// ===== NAVIGATION =====
function goToAssessment(id) {
    localStorage.setItem('currentApplicantId', id);
    window.location.href = 'assessment.html';
}

function goToInterview(id) {
    localStorage.setItem('currentApplicantId', id);
    window.location.href = 'interview.html';
}

// ===== EXPORT =====
function exportData() {
    const data = store.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showNotification('Export สำเร็จ', 'success');
}

// ===== CLEAR ALL =====
function clearAll() {
    if (!confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้!')) return;
    
    store.clearAll();
    renderApplicants();
    showNotification('ล้างข้อมูลสำเร็จ', 'success');
}

// ===== DOWNLOAD TEMPLATE =====
function downloadTemplate() {
    const template = [
        ['ชื่อ-นามสกุล', 'ตำแหน่ง', 'Email', 'เบอร์โทร', 'แผนก', 'วันที่สมัคร', 'หมายเหตุ'],
        ['สมชาย ใจดี', 'Software Engineer', 'somchai@example.com', '0812345678', 'IT', '2026-07-21', ''],
        ['สมหญิง รักเรียน', 'HR Manager', 'somying@example.com', '0823456789', 'HR', '2026-07-21', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'applicant_template.xlsx');
}

// ===== UTILITIES =====
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
