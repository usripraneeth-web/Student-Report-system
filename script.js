/* =====================================================
   STUDENT REPORT SYSTEM - FULL JAVASCRIPT
===================================================== */

let students = JSON.parse(localStorage.getItem("studentReports")) || [];
let generatedOTP = "";
let pendingUserType = "";
let selectedLoginRole = "admin";

/* ================= GRADE HELPER ================= */
function getGrade(marks) {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B";
    if (marks >= 60) return "C";
    if (marks >= 50) return "D";
    return "F";
}

/* ================= ADMIN SIGNUP ================= */
function adminFullSignup(e) {
    if (e) e.preventDefault();

    const name = document.getElementById("adminName").value.trim();
    const username = document.getElementById("adminUsername").value.trim().toLowerCase();
    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const password = document.getElementById("adminPass").value;
    const confirmPassword = document.getElementById("adminConfirmPass").value;
    const message = document.getElementById("adminSignupMessage");

    if (!name || !email || !username || !password) {
        message.textContent = "Please fill all fields!";
        message.style.color = "#dc2626";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        message.style.color = "#dc2626";
        return;
    }

    let admins = JSON.parse(localStorage.getItem("registeredAdmins")) || [];

    if (admins.find(a => a.email === email || a.username === username)) {
        message.textContent = "Admin username or email already exists!";
        message.style.color = "#dc2626";
        return;
    }

    admins.push({
        name: name,
        username: username,
        email: email,
        password: password
    });

    localStorage.setItem("registeredAdmins", JSON.stringify(admins));

    message.textContent = "Admin Registration Successful! Redirecting to login...";
    message.style.color = "#16a34a";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

/* ================= STUDENT SIGNUP ================= */
function studentFullSignup(e) {
    if (e) e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const dob = document.getElementById("regDOB").value;
    const roll = document.getElementById("regRoll").value.trim();
    const dept = document.getElementById("regDept").value.trim();
    const marks = Number(document.getElementById("regMarks").value);
    const attendance = Number(document.getElementById("regAttendance").value);
    const password = document.getElementById("regPass").value;
    const confirmPassword = document.getElementById("regConfirmPass").value;
    const message = document.getElementById("signupMessage");

    if (!name || !email || !phone || !dob || !roll || !dept) {
        message.textContent = "Please fill all fields!";
        message.style.color = "#dc2626";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        message.style.color = "#dc2626";
        return;
    }

    if (isNaN(marks) || marks < 0 || marks > 100) {
        message.textContent = "Marks must be between 0 and 100!";
        message.style.color = "#dc2626";
        return;
    }

    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        message.textContent = "Attendance must be between 0 and 100!";
        message.style.color = "#dc2626";
        return;
    }

    let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    if (users.find(u => u.email === email)) {
        message.textContent = "Email already registered!";
        message.style.color = "#dc2626";
        return;
    }

    const grade = getGrade(marks);

    const newStudent = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        dob: dob,
        roll: roll,
        department: dept,
        year: "2nd Year",
        marks: marks,
        percentage: marks,
        grade: grade,
        attendance: attendance,
        remarks: grade === "F" ? "Needs Improvement" : "Good Progress",
        password: password,
        date: new Date().toLocaleDateString()
    };

    users.push({
        name: name,
        email: email,
        password: password
    });

    localStorage.setItem("registeredUsers", JSON.stringify(users));

    students.push(newStudent);
    saveData();

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);

    message.textContent = "Registration Successful! Redirecting to login...";
    message.style.color = "#16a34a";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

function signup() {
    studentFullSignup();
}

/* ================= LOGIN ROLE ================= */
function selectLoginRole(role) {
    selectedLoginRole = role;

    const adminButton = document.getElementById("adminRoleBtn");
    const studentButton = document.getElementById("studentRoleBtn");
    const demo = document.getElementById("loginDemo");
    const createAccountLink = document.getElementById("createAccountLink");

    if (adminButton) {
        adminButton.classList.toggle("active", role === "admin");
    }

    if (studentButton) {
        studentButton.classList.toggle("active", role === "student");
    }

    if (createAccountLink) {
        if (role === "admin") {
            createAccountLink.href = "admin-signup.html";
        } else {
            createAccountLink.href = "signup.html";
        }
    }

    if (demo) {
        if (role === "admin") {
            demo.innerHTML = 'Admin Login: <strong>admin / 1234</strong> (or registered Admin credentials)';
        } else {
            demo.innerHTML = 'Student Login: <strong>Use registered Email & Password</strong>';
        }
    }
}

/* ================= LOGIN ================= */
function login() {
    const usernameElement = document.getElementById("username");
    const passwordElement = document.getElementById("password");

    const username = usernameElement.value.trim().toLowerCase();
    const password = passwordElement.value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    /* ADMIN LOGIN */
    if (selectedLoginRole === "admin") {
        let admins = JSON.parse(localStorage.getItem("registeredAdmins")) || [];
        const validAdmin = admins.find(a => (a.username === username || a.email === username) && a.password === password);

        if ((username === "admin" && password === "1234") || validAdmin) {
            pendingUserType = "admin";
            generateOTP();
            return;
        }

        alert("Invalid Admin username or password.");
        return;
    }

    /* STUDENT LOGIN */
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const validStudent = users.find(
        u => u.email.toLowerCase() === username && u.password === password
    );

    if (validStudent) {
        pendingUserType = "student";

        localStorage.setItem("userName", validStudent.name);
        localStorage.setItem("userEmail", validStudent.email);

        generateOTP();
        return;
    }

    alert("Invalid Student email or password. Please Sign Up first!");
}

/* ================= OTP ================= */
function generateOTP() {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const otpElement = document.getElementById("generatedOTP");
    const loginStep = document.getElementById("loginStep");
    const otpStep = document.getElementById("otpStep");

    if (!otpElement || !loginStep || !otpStep) return;

    otpElement.textContent = generatedOTP;

    loginStep.style.display = "none";
    otpStep.style.display = "block";

    const otpInput = document.getElementById("otpInput");
    const otpMessage = document.getElementById("otpMessage");

    if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
    }

    if (otpMessage) {
        otpMessage.textContent = "";
    }
}

function verifyOTP() {
    const enteredOTP = document.getElementById("otpInput").value.trim();
    const message = document.getElementById("otpMessage");

    if (!/^\d{6}$/.test(enteredOTP)) {
        message.textContent = "OTP must contain exactly 6 digits.";
        message.style.color = "#dc2626";
        return;
    }

    if (enteredOTP !== generatedOTP) {
        message.textContent = "Invalid OTP. Please try again.";
        message.style.color = "#dc2626";
        return;
    }

    message.textContent = "OTP verified successfully!";
    message.style.color = "#16a34a";

    setTimeout(() => {
        if (pendingUserType === "admin") {
            const loginPage = document.getElementById("loginPage");
            const portal = document.getElementById("portal");

            if (loginPage) loginPage.style.display = "none";
            if (portal) portal.style.display = "flex";

            updateDashboard();
            displayStudents();
            displayReportStudents();
            updateAnalytics();
        } else if (pendingUserType === "student") {
            window.location.href = "user.html";
        }
    }, 500);
}

function backToLogin() {
    const otpStep = document.getElementById("otpStep");
    const loginStep = document.getElementById("loginStep");

    if (otpStep) otpStep.style.display = "none";
    if (loginStep) loginStep.style.display = "block";

    const otpInput = document.getElementById("otpInput");
    const otpMessage = document.getElementById("otpMessage");

    if (otpInput) otpInput.value = "";
    if (otpMessage) otpMessage.textContent = "";

    generatedOTP = "";
    pendingUserType = "";

    selectLoginRole("admin");
}

/* ================= LOGOUT ================= */
function logout() {
    const portal = document.getElementById("portal");
    const loginPage = document.getElementById("loginPage");

    if (portal) portal.style.display = "none";
    if (loginPage) loginPage.style.display = "flex";

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    if (username) username.value = "";
    if (password) password.value = "";

    backToLogin();
}

function userLogout() {
    window.location.href = "index.html";
}

/* ================= DELETE ACCOUNT ================= */
function deleteMyAccount() {
    const confirmDelete = confirm(
        "Are you sure? Your entire registration and report data will be permanently deleted!"
    );

    if (!confirmDelete) return;

    const currentEmail = localStorage.getItem("userEmail") || "";
    const currentName = localStorage.getItem("userName") || "";

    let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    users = users.filter(u => u.email.toLowerCase() !== currentEmail.toLowerCase());
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    let reports = JSON.parse(localStorage.getItem("studentReports")) || [];
    reports = reports.filter(s => {
        const studentEmail = s.email ? s.email.toLowerCase() : "";
        const studentName = s.name ? s.name.toLowerCase() : "";
        return studentEmail !== currentEmail.toLowerCase() && studentName !== currentName.toLowerCase();
    });

    localStorage.setItem("studentReports", JSON.stringify(reports));
    students = reports;

    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");

    alert("Your account and all records have been completely deleted!");
    window.location.href = "index.html";
}

/* ================= ADMIN RESET ================= */
function adminResetSystem() {
    const confirmation = confirm(
        "WARNING: Are you sure you want to delete ALL registered student accounts, examination marks, and system history?"
    );

    if (!confirmation) return;

    const doubleCheck = prompt("Type 'DELETE' to confirm complete system reset:");
    if (doubleCheck !== "DELETE") {
        alert("Reset cancelled. Confirmation text did not match 'DELETE'.");
        return;
    }

    localStorage.removeItem("studentReports");
    students = [];

    localStorage.removeItem("registeredUsers");
    localStorage.removeItem("registeredAdmins");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");

    alert("System reset complete! All data wiped successfully.");

    updateDashboard();
    displayStudents();
    displayReportStudents();
    updateAnalytics();

    logout();
}

/* ================= SIDEBAR ================= */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
}

/* ================= ADMIN NAVIGATION ================= */
function showSection(sectionId, element) {
    document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) selectedSection.classList.add("active");

    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => item.classList.remove("active"));
    if (element) element.classList.add("active");

    const titles = {
        dashboardSection: ["Dashboard", "Overview of student academic performance"],
        studentsSection: ["Students", "Manage student academic information"],
        reportsSection: ["Reports", "View detailed student reports"],
        performanceSection: ["Performance", "Analyze student performance"],
        settingsSection: ["Settings", "Manage system information"]
    };

    if (titles[sectionId]) {
        setText("pageTitle", titles[sectionId][0]);
        setText("pageSubtitle", titles[sectionId][1]);
    }

    if (sectionId === "studentsSection") displayStudents();
    if (sectionId === "reportsSection") displayReportStudents();
    if (sectionId === "performanceSection") updateAnalytics();
}

/* ================= STUDENT CRUD ================= */
function openStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) modal.style.display = "flex";
}

function closeStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) modal.style.display = "none";
    clearForm();
}

function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("studentRoll").value.trim();
    const department = document.getElementById("studentDepartment").value.trim();
    const year = document.getElementById("studentYear").value;
    const marks = Number(document.getElementById("studentMarks").value);
    const attendance = Number(document.getElementById("studentAttendance").value);
    const remarks = document.getElementById("studentRemarks").value.trim();

    if (!name || !roll || !department || !year) {
        alert("Please fill all required fields.");
        return;
    }

    if (isNaN(marks) || isNaN(attendance) || marks < 0 || marks > 100 || attendance < 0 || attendance > 100) {
        alert("Marks and attendance must be between 0 and 100.");
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        roll: roll,
        department: department,
        year: year,
        marks: marks,
        attendance: attendance,
        remarks: remarks || "Satisfactory",
        date: new Date().toLocaleDateString()
    };

    students.push(student);
    saveData();
    closeStudentModal();
    displayStudents();
    displayReportStudents();
    updateDashboard();
    updateAnalytics();

    alert("Student added successfully!");
}

/* ================= DISPLAY STUDENTS ================= */
function displayStudents() {
    const grid = document.getElementById("studentsGrid");
    if (!grid) return;

    const search = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase() : "";
    const gradeFilter = document.getElementById("gradeFilter") ? document.getElementById("gradeFilter").value : "all";

    const filteredStudents = students.filter(student => {
        const studentName = student.name ? student.name.toLowerCase() : "";
        const studentRoll = student.roll ? student.roll.toLowerCase() : "";
        const matchesSearch = studentName.includes(search) || studentRoll.includes(search);
        const grade = getGrade(Number(student.marks));
        const matchesGrade = gradeFilter === "all" || grade === gradeFilter;

        return matchesSearch && matchesGrade;
    });

    if (filteredStudents.length === 0) {
        grid.innerHTML = `
            <div class="dashboard-card">
                <p class="empty-message">No students found.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredStudents.map(student => {
        const grade = getGrade(Number(student.marks));
        return `
            <div class="student-card">
                <div class="student-card-header">
                    <div class="student-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <span class="grade-badge">${grade}</span>
                </div>
                <h3>${student.name}</h3>
                <div class="student-info">
                    <div>Roll No: ${student.roll}</div>
                    <div>Department: ${student.department}</div>
                    <div>Year: ${student.year || "2nd Year"}</div>
                    <div>Marks: ${student.marks}%</div>
                    <div>Attendance: ${student.attendance}%</div>
                </div>
                <div class="student-actions">
                    <button class="report-btn" onclick="openReport(${student.id})">Report</button>
                    <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    students = students.filter(student => student.id !== id);
    saveData();
    displayStudents();
    displayReportStudents();
    updateDashboard();
    updateAnalytics();
}

/* ================= ADMIN DASHBOARD ================= */
function updateDashboard() {
    const total = students.length;
    setText("totalStudents", total);

    if (total === 0) {
        setText("averageMarks", "0%");
        setText("averageAttendance", "0%");
        setText("topGrade", "-");
        updateRecentStudents();
        updatePerformanceBars();
        return;
    }

    const totalMarks = students.reduce((sum, s) => sum + Number(s.marks), 0);
    const totalAttendance = students.reduce((sum, s) => sum + Number(s.attendance), 0);
    const averageMarks = (totalMarks / total).toFixed(1);
    const averageAttendance = (totalAttendance / total).toFixed(1);

    setText("averageMarks", averageMarks + "%");
    setText("averageAttendance", averageAttendance + "%");

    const gradeOrder = ["A+", "A", "B", "C", "D", "F"];
    let topGrade = "F";

    for (const grade of gradeOrder) {
        if (students.some(s => getGrade(Number(s.marks)) === grade)) {
            topGrade = grade;
            break;
        }
    }

    setText("topGrade", topGrade);
    updateRecentStudents();
    updatePerformanceBars();
}

function updateRecentStudents() {
    const container = document.getElementById("recentStudents");
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = `<p class="empty-message">No students available.</p>`;
        return;
    }

    const recent = students.slice(-5).reverse();
    container.innerHTML = recent.map(s => `
        <div class="performance-item">
            <span class="performance-label">
                <span class="student-avatar small-avatar">${s.name.charAt(0).toUpperCase()}</span>
                ${s.name}
            </span>
            <strong>${getGrade(Number(s.marks))}</strong>
        </div>
    `).join("");
}

function updatePerformanceBars() {
    let excellent = 0, good = 0, average = 0, poor = 0;

    students.forEach(student => {
        const marks = Number(student.marks);
        if (marks >= 90) excellent++;
        else if (marks >= 80) good++;
        else if (marks >= 60) average++;
        else poor++;
    });

    setText("excellentCount", excellent);
    setText("goodCount", good);
    setText("averageCount", average);
    setText("poorCount", poor);
    setText("excellentBarCount", excellent);
    setText("goodBarCount", good);
    setText("averageBarCount", average);
    setText("poorBarCount", poor);

    const total = students.length || 1;
    setBar("excellentBar", (excellent / total) * 100);
    setBar("goodBar", (good / total) * 100);
    setBar("averageBar", (average / total) * 100);
    setBar("poorBar", (poor / total) * 100);
}

/* ================= ADMIN REPORTS ================= */
function displayReportStudents() {
    const container = document.getElementById("reportStudents");
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = `
            <div class="dashboard-card">
                <p class="empty-message">No student reports available.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = students.map(student => `
        <div class="report-card">
            <h3>${student.name}</h3>
            <p>Roll No: ${student.roll}</p>
            <p>Marks: ${student.marks}%</p>
            <p>Attendance: ${student.attendance}%</p>
            <p>Grade: <strong>${getGrade(Number(student.marks))}</strong></p>
            <button class="btn btn-primary" onclick="openReport(${student.id})">View Full Report</button>
        </div>
    `).join("");
}

/* ================= OPEN REPORT ================= */
function openReport(id) {
    const student = students.find(item => item.id === id);
    if (!student) return;

    const content = document.getElementById("modalReportContent");
    if (!content) return;

    content.innerHTML = `
        <div class="report-detail">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Roll Number:</strong> ${student.roll}</p>
            <p><strong>Department:</strong> ${student.department} (${student.year || "2nd Year"})</p>
            ${student.phone ? `<p><strong>Phone:</strong> ${student.phone}</p>` : ""}
            ${student.dob ? `<p><strong>Date of Birth:</strong> ${student.dob}</p>` : ""}
        </div>
        <div class="report-detail">
            <h3>Academic Performance</h3>
            <p><strong>Marks:</strong> ${student.marks}%</p>
            <p><strong>Attendance:</strong> ${student.attendance}%</p>
            <p><strong>Grade:</strong> ${getGrade(Number(student.marks))}</p>
        </div>
        <div class="report-detail">
            <h3>Remarks</h3>
            <p>${student.remarks || "No remarks available."}</p>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:10px;" onclick="window.print()">
            Print / Download PDF
        </button>
    `;

    const reportModal = document.getElementById("reportModal");
    if (reportModal) reportModal.style.display = "flex";
}

function closeReport() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";
}

/* ================= ADMIN ANALYTICS ================= */
function updateAnalytics() {
    const total = students.length;

    if (total === 0) {
        setText("performanceMarks", "0%");
        setText("performanceAttendance", "0%");
        setText("passPercentage", "0%");
        updateCircle("marksCircle", 0);
        updateCircle("attendanceCircle", 0);
        updateCircle("passCircle", 0);
        return;
    }

    const marks = students.reduce((sum, s) => sum + Number(s.marks), 0) / total;
    const attendance = students.reduce((sum, s) => sum + Number(s.attendance), 0) / total;
    const passed = students.filter(s => Number(s.marks) >= 50).length;
    const passPercentage = (passed / total) * 100;

    setText("performanceMarks", marks.toFixed(1) + "%");
    setText("performanceAttendance", attendance.toFixed(1) + "%");
    setText("passPercentage", passPercentage.toFixed(1) + "%");

    updateCircle("marksCircle", marks);
    updateCircle("attendanceCircle", attendance);
    updateCircle("passCircle", passPercentage);
}

/* ================= HELPERS ================= */
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setBar(id, percentage) {
    const element = document.getElementById(id);
    if (element) element.style.width = percentage + "%";
}

function updateCircle(id, percentage) {
    const element = document.getElementById(id);
    if (!element) return;
    const safePercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
    const degrees = safePercentage * 3.6;
    element.style.background = `conic-gradient(#2563eb ${degrees}deg, #e2e8f0 ${degrees}deg)`;
}

function clearForm() {
    const form = document.getElementById("studentForm");
    if (form) form.reset();
}

function saveData() {
    localStorage.setItem("studentReports", JSON.stringify(students));
}

/* ================= STUDENT DASHBOARD ================= */
function showUserSection(sectionId, element) {
    document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) selectedSection.classList.add("active");

    document.querySelectorAll(".sidebar .nav-item").forEach(item => item.classList.remove("active"));
    if (element) element.classList.add("active");

    const titles = {
        userDashboardSection: ["Dashboard", "Overview of your academic performance"],
        userReportSection: ["My Report", "View your academic report"],
        userPerformanceSection: ["Performance", "View your academic performance"],
        userProfileSection: ["Profile", "View your account information"]
    };

    if (titles[sectionId]) {
        setText("userPageTitle", titles[sectionId][0]);
        setText("userPageSubtitle", titles[sectionId][1]);
    }

    if (sectionId === "userDashboardSection" || sectionId === "userPerformanceSection") loadUserDashboard();
    if (sectionId === "userReportSection") displayUserReports();
    if (sectionId === "userProfileSection") loadStudentProfile();
}

function toggleStudentSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
}

function getLoggedStudent() {
    const userEmail = localStorage.getItem("userEmail") || "";
    const userName = localStorage.getItem("userName") || "";

    if (!userEmail && !userName) return null;

    const emailStudent = students.find(s => s.email && s.email.toLowerCase() === userEmail.toLowerCase());
    if (emailStudent) return emailStudent;

    const nameStudent = students.find(s => s.name && s.name.toLowerCase() === userName.toLowerCase());
    return nameStudent || null;
}

function loadStudentProfile() {
    const name = localStorage.getItem("userName") || "Student";
    const email = localStorage.getItem("userEmail") || "-";

    setText("profileUserName", name);
    setText("profileUserEmail", email);
    setText("userTopName", name);

    const myData = getLoggedStudent();
    if (myData) {
        setText("profileUserPhone", myData.phone || "-");
        setText("profileUserDOB", myData.dob || "-");
    }
}

function openEditProfileModal() {
    const currentName = localStorage.getItem("userName") || "";
    const editName = document.getElementById("editName");
    if (editName) editName.value = currentName;

    const myData = getLoggedStudent();
    if (myData) {
        const editPhone = document.getElementById("editPhone");
        const editDOB = document.getElementById("editDOB");
        if (editPhone) editPhone.value = myData.phone || "";
        if (editDOB) editDOB.value = myData.dob || "";
    }

    const modal = document.getElementById("editProfileModal");
    if (modal) modal.style.display = "flex";
}

function closeEditProfileModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.style.display = "none";
}

function saveEditedProfile(e) {
    if (e) e.preventDefault();

    const nameElement = document.getElementById("editName");
    const phoneElement = document.getElementById("editPhone");
    const dobElement = document.getElementById("editDOB");

    const newName = nameElement ? nameElement.value.trim() : "";
    const newPhone = phoneElement ? phoneElement.value.trim() : "";
    const newDOB = dobElement ? dobElement.value : "";
    const currentEmail = localStorage.getItem("userEmail") || "";
    const currentName = localStorage.getItem("userName") || "";

    if (!newName) {
        alert("Name cannot be empty.");
        return;
    }

    localStorage.setItem("userName", newName);

    let users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    users = users.map(u => {
        if (u.email && u.email.toLowerCase() === currentEmail.toLowerCase()) {
            return { ...u, name: newName };
        }
        return u;
    });
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    students = students.map(s => {
        const sameEmail = s.email && s.email.toLowerCase() === currentEmail.toLowerCase();
        const sameName = s.name && s.name.toLowerCase() === currentName.toLowerCase();
        if (sameEmail || sameName) {
            return { ...s, name: newName, phone: newPhone, dob: newDOB };
        }
        return s;
    });

    saveData();
    closeEditProfileModal();
    loadStudentProfile();
    loadUserDashboard();

    alert("Profile updated successfully!");
}

function loadUserDashboard() {
    const userName = localStorage.getItem("userName") || "Student";
    const userEmail = localStorage.getItem("userEmail") || "-";

    setText("userName", userName);
    setText("displayUserName", userName);
    setText("displayUserEmail", userEmail);
    setText("userTopName", userName);
    setText("dashboardUserName", userName);

    const myData = getLoggedStudent();

    if (!myData) {
        setText("userAverageMarks", "0%");
        setText("userAverageAttendance", "0%");
        setText("userGrade", "-");
        setText("summaryMarks", "0%");
        setText("summaryAttendance", "0%");
        setText("summaryGrade", "-");
        setText("performanceMarks", "0%");
        setText("performanceAttendance", "0%");
        setText("performanceGrade", "-");
        updateCircle("studentMarksCircle", 0);
        updateCircle("studentAttendanceCircle", 0);
        updateCircle("studentGradeCircle", 0);
        setBar("studentMarksBar", 0);
        setText("studentMarksBarCount", "0%");
        setBar("studentAttendanceBar", 0);
        setText("studentAttendanceBarCount", "0%");
        displayUserReports();
        displayStudentPerformance();
        return;
    }

    const sMarks = Number(myData.marks) || 0;
    const sAtt = Number(myData.attendance) || 0;
    const sGrade = myData.grade || getGrade(sMarks);

    setText("userAverageMarks", sMarks + "%");
    setText("userAverageAttendance", sAtt + "%");
    setText("userGrade", sGrade);
    setText("summaryMarks", sMarks + "%");
    setText("summaryAttendance", sAtt + "%");
    setText("summaryGrade", sGrade);
    setText("performanceMarks", sMarks + "%");
    setText("performanceAttendance", sAtt + "%");
    setText("performanceGrade", sGrade);

    updateCircle("studentMarksCircle", sMarks);
    updateCircle("studentAttendanceCircle", sAtt);

    let gradePercentage = 40;
    if (sGrade === "A+") gradePercentage = 100;
    else if (sGrade === "A") gradePercentage = 90;
    else if (sGrade === "B") gradePercentage = 80;
    else if (sGrade === "C") gradePercentage = 70;
    else if (sGrade === "D") gradePercentage = 60;

    updateCircle("studentGradeCircle", gradePercentage);
    setBar("studentMarksBar", sMarks);
    setText("studentMarksBarCount", sMarks + "%");
    setBar("studentAttendanceBar", sAtt);
    setText("studentAttendanceBarCount", sAtt + "%");

    displayUserReports();
    displayStudentPerformance();
}

function displayUserReports() {
    const container = document.getElementById("userReports");
    if (!container) return;

    const userName = localStorage.getItem("userName") || "Student";
    const userEmail = localStorage.getItem("userEmail") || "-";
    const myData = getLoggedStudent();

    if (!myData) {
        container.innerHTML = `
            <div class="dashboard-card">
                <h3>No Report Available</h3>
                <p>Your student report has not been found.</p>
            </div>
        `;
        return;
    }

    const grade = myData.grade || getGrade(Number(myData.marks));

    container.innerHTML = `
        <div class="user-report-item">
            <div class="report-header">
                <h3>${myData.name || userName}</h3>
            </div>
            <div class="report-details" style="display:grid;gap:8px;margin-top:10px;">
                <div><strong>Email:</strong> <span>${myData.email || userEmail}</span></div>
                <div><strong>Phone:</strong> <span>${myData.phone || "N/A"}</span></div>
                <div><strong>DOB:</strong> <span>${myData.dob || "N/A"}</span></div>
                <div><strong>Roll Number:</strong> <span>${myData.roll || "N/A"}</span></div>
                <div><strong>Department:</strong> <span>${myData.department || "N/A"}</span></div>
                <div><strong>Year:</strong> <span>${myData.year || "2nd Year"}</span></div>
                <div><strong>Marks:</strong> <span>${myData.marks}%</span></div>
                <div><strong>Attendance:</strong> <span>${myData.attendance}%</span></div>
                <div><strong>Grade:</strong> <span>${grade}</span></div>
                <div><strong>Remarks:</strong> <span>${myData.remarks || "Good Progress"}</span></div>
            </div>
            <button class="btn btn-primary" style="margin-top:15px;width:100%;" onclick="window.print()">
                Print Report Card
            </button>
        </div>
    `;
}

function displayStudentPerformance() {
    const container = document.getElementById("studentPerformanceList");
    if (!container) return;

    const userName = localStorage.getItem("userName") || "Student";
    const myData = getLoggedStudent();

    if (!myData) {
        container.innerHTML = `
            <div class="performance-item"><span>Student Name</span><strong>${userName}</strong></div>
            <div class="performance-item"><span>Marks</span><strong>0%</strong></div>
            <div class="performance-item"><span>Attendance</span><strong>0%</strong></div>
            <div class="performance-item"><span>Grade</span><strong>-</strong></div>
        `;
        return;
    }

    const grade = myData.grade || getGrade(Number(myData.marks));

    container.innerHTML = `
        <div class="performance-item"><span>Student Name</span><strong>${myData.name}</strong></div>
        <div class="performance-item"><span>Student ID / Roll No</span><strong>${myData.roll || "N/A"}</strong></div>
        <div class="performance-item"><span>Marks</span><strong>${myData.marks}%</strong></div>
        <div class="performance-item"><span>Attendance</span><strong>${myData.attendance}%</strong></div>
        <div class="performance-item"><span>Grade</span><strong>${grade}</strong></div>
    `;
}

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("dashboardSection")) {
        updateDashboard();
        displayStudents();
        displayReportStudents();
        updateAnalytics();
    }

    if (document.getElementById("userDashboardSection")) {
        loadUserDashboard();
        loadStudentProfile();
    }
});