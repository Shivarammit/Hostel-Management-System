const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// --- Sample Users (Admin, RC, Parent, Students) ---
const sampleUsers = [
  { id: 1, name: "Admin User", email: "admin@hostel.com", password: "admin", role: "Admin" },
  { id: 2, name: "RC User", email: "rc@hostel.com", password: "rc", role: "RC" },
  { id: 3, name: "Parent User", email: "parent@hostel.com", password: "parent", role: "Parent", childId: 5 },
  { id: 4, name: "Student User", email: "student@hostel.com", password: "student", role: "Student", room: "B-102", feesDue: 0 },
  { id: 5, name: "Child Student", email: "child@hostel.com", password: "child", role: "Student", room: "C-201", feesDue: 1500 },
];

// --- Global in-memory storage for gate passes & attendance ---
let gatepasses = JSON.parse(localStorage.getItem("gatepasses") || "[]");
let attendanceLog = JSON.parse(localStorage.getItem("attendanceLog") || "{}");

function persistGatePasses() {
  localStorage.setItem("gatepasses", JSON.stringify(gatepasses));
}

function persistAttendance() {
  localStorage.setItem("attendanceLog", JSON.stringify(attendanceLog));
}

// --- Helper for weekly attendance ---
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export const api = {
  // ---------------- AUTH -----------------
  async login(email, password) {
    await delay(300);
    const u = sampleUsers.find(x => x.email === email && x.password === password);
    if (!u) throw new Error("Invalid credentials");
    return {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        childId: u.childId,
        room: u.room,
        feesDue: u.feesDue,
      }
    };
  },

  async register(payload) {
    await delay(300);
    const exists = sampleUsers.some(x => x.email === payload.email);
    if (exists) throw new Error("Email already registered");
    const newUser = { id: sampleUsers.length + 1, ...payload };
    sampleUsers.push(newUser);
    return { user: newUser };
  },

  // ---------------- GATE PASS -----------------
  async fetchGatePasses() {
    await delay(200);
    return gatepasses.slice().reverse();
  },

  async createGatePass(gp) {
    await delay(200);
    const newGp = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: "PendingParent", // student created -> pending parent approval first
      parentApproved: false,
      rcApproved: false,
      ...gp,
    };
    gatepasses.push(newGp);
    persistGatePasses();
    return newGp;
  },

  async updateGatePass(id, update) {
    await delay(150);
    const idx = gatepasses.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Gate pass not found");

    gatepasses[idx] = { ...gatepasses[idx], ...update };

    // Update status based on approvals
    const gp = gatepasses[idx];
    if (gp.parentApproved && gp.rcApproved) gp.status = "Approved";
    else if (gp.parentApproved && !gp.rcApproved) gp.status = "PendingRC";
    else if (!gp.parentApproved) gp.status = "RejectedByParent";

    persistGatePasses();
    return gatepasses[idx];
  },

  // ---------------- STUDENTS -----------------
  async fetchStudents() {
    await delay(200);
    return sampleUsers.filter(u => u.role === "Student");
  },

  // ---------------- ATTENDANCE -----------------
  async markAttendance(date, records) {
    await delay(150);
    attendanceLog[date] = records;
    persistAttendance();
    return { date, records };
  },

  async getAttendance(date) {
    await delay(100);
    return attendanceLog[date] || {};
  },

  async getAttendanceWeek(weekKey) {
    await delay(150);
    const weekRecords = {};
    Object.keys(attendanceLog).forEach(date => {
      if (getWeekKey(date) === weekKey) weekRecords[date] = attendanceLog[date];
    });
    return weekRecords;
  }
};
