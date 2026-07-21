// seed-data.js - ข้อมูลผู้สมัครจาก Sheet A1-Recruitment

function seedApplicants() {
    const applicants = [
        {
            id: 'A1-001',
            fullName: 'สมชาย ใจดี',
            position: 'Software Engineer',
            email: 'somchai@example.com',
            phone: '0812345678',
            department: 'IT',
            applyDate: '2026-03-15',
            source: 'Referral',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-002',
            fullName: 'สมหญิง รักเรียน',
            position: 'Sales Executive',
            email: 'somying@example.com',
            phone: '0823456789',
            department: 'Sales',
            applyDate: '2026-03-18',
            source: 'LinkedIn',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-003',
            fullName: 'วิชัย สุขสมบูรณ์',
            position: 'Operations Supervisor',
            email: 'wichai@example.com',
            phone: '0834567890',
            department: 'Operations',
            applyDate: '2026-04-01',
            source: 'Job Board',
            status_register: 'มาสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-004',
            fullName: 'นภา แสงจันทร์',
            position: 'HR Coordinator',
            email: 'napa@example.com',
            phone: '0845678901',
            department: 'HR',
            applyDate: '2026-04-05',
            source: 'Website',
            status_register: 'มาสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-005',
            fullName: 'ธนกร เจริญทรัพย์',
            position: 'Financial Analyst',
            email: 'thanakorn@example.com',
            phone: '0856789012',
            department: 'Finance',
            applyDate: '2026-04-10',
            source: 'Agency',
            status_register: 'รอสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-006',
            fullName: 'พิมพ์ใจ ดีงาม',
            position: 'UX Designer',
            email: 'pimjai@example.com',
            phone: '0867890123',
            department: 'IT',
            applyDate: '2026-04-12',
            source: 'LinkedIn',
            status_register: 'รอสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-007',
            fullName: 'ประเสริฐ มั่นคง',
            position: 'Data Scientist',
            email: 'prasert@example.com',
            phone: '0878901234',
            department: 'IT',
            applyDate: '2026-04-15',
            source: 'Referral',
            status_register: 'รอคัดเลือกใบสมัคร',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-008',
            fullName: 'อรุณี วงษ์สว่าง',
            position: 'Sales Manager',
            email: 'arunee@example.com',
            phone: '0889012345',
            department: 'Sales',
            applyDate: '2026-03-20',
            source: 'Job Board',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-009',
            fullName: 'สุรชัย กล้าหาญ',
            position: 'DevOps Engineer',
            email: 'surachai@example.com',
            phone: '0890123456',
            department: 'IT',
            applyDate: '2026-02-28',
            source: 'Website',
            status_register: 'ปิดใบสมัคร',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-010',
            fullName: 'กัลยา ธรรมรักษ์',
            position: 'QA Engineer',
            email: 'kanlaya@example.com',
            phone: '0801234567',
            department: 'IT',
            applyDate: '2026-04-18',
            source: 'LinkedIn',
            status_register: 'ใบสมัครซ้ำ',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-011',
            fullName: 'ชัยวัฒน์ พงศ์ไพบูลย์',
            position: 'Product Manager',
            email: 'chaiwat@example.com',
            phone: '0811112222',
            department: 'IT',
            applyDate: '2026-04-20',
            source: 'Referral',
            status_register: 'มาสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-012',
            fullName: 'รัตนา จิตต์สว่าง',
            position: 'Accountant',
            email: 'rattana@example.com',
            phone: '0822223333',
            department: 'Finance',
            applyDate: '2026-03-25',
            source: 'Job Board',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-013',
            fullName: 'อนุชา แก้วมณี',
            position: 'Network Admin',
            email: 'anucha@example.com',
            phone: '0833334444',
            department: 'IT',
            applyDate: '2026-04-22',
            source: 'Website',
            status_register: 'รอสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-014',
            fullName: 'จิราภา ศรีสุวรรณ',
            position: 'Marketing Specialist',
            email: 'jirapa@example.com',
            phone: '0844445555',
            department: 'Marketing',
            applyDate: '2026-04-25',
            source: 'Agency',
            status_register: 'รอคัดเลือกใบสมัคร',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-015',
            fullName: 'ธีรเดช อำนวยผล',
            position: 'Tech Lead',
            email: 'teeradet@example.com',
            phone: '0855556666',
            department: 'IT',
            applyDate: '2026-03-10',
            source: 'LinkedIn',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-016',
            fullName: 'พรทิพย์ นาคสุข',
            position: 'Customer Service',
            email: 'porntip@example.com',
            phone: '0866667777',
            department: 'Service',
            applyDate: '2026-04-28',
            source: 'Job Board',
            status_register: 'มาสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-017',
            fullName: 'กิตติศักดิ์ รุ่งเรือง',
            position: 'Business Analyst',
            email: 'kittisak@example.com',
            phone: '0877778888',
            department: 'IT',
            applyDate: '2026-03-30',
            source: 'Referral',
            status_register: 'จ้างงาน',
            employmentStatus: 'พบใน employee',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-018',
            fullName: 'สุภาวดี จันทร์เพ็ญ',
            position: 'UI Developer',
            email: 'supawadee@example.com',
            phone: '0888889999',
            department: 'IT',
            applyDate: '2026-05-01',
            source: 'Website',
            status_register: 'รอสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-019',
            fullName: 'มนัส วรสาร',
            position: 'Warehouse Supervisor',
            email: 'manas@example.com',
            phone: '0899990000',
            department: 'Operations',
            applyDate: '2026-05-03',
            source: 'Agency',
            status_register: 'มาสัมภาษณ์',
            employmentStatus: '',
            status: 'new',
            notes: ''
        },
        {
            id: 'A1-020',
            fullName: 'ดวงใจ ประสิทธิ์',
            position: 'Payroll Admin',
            email: 'duangjai@example.com',
            phone: '0800001111',
            department: 'HR',
            applyDate: '2026-05-05',
            source: 'Job Board',
            status_register: 'รอคัดเลือกใบสมัคร',
            employmentStatus: '',
            status: 'new',
            notes: ''
        }
    ];
    
    // Save to store
    applicants.forEach(applicant => {
        store.saveApplicant(applicant);
    });
    
    console.log(`✅ Seed data: ${applicants.length} applicants imported`);
    return applicants.length;
}

// Auto-seed if no data exists
if (typeof store !== 'undefined') {
    const existing = store.getApplicants();
    if (existing.length === 0) {
        seedApplicants();
    }
}
