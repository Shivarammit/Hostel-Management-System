const delay = (ms) => new Promise((res) => setTimeout(res, ms));


const sampleUsers = [
{ id: 1, name: 'Admin User', email: 'admin@hostel.com', password: 'admin', role: 'Admin' },
{ id: 2, name: 'RC User', email: 'rc@hostel.com', password: 'rc', role: 'RC' },
{ id: 3, name: 'Parent User', email: 'parent@hostel.com', password: 'parent', role: 'Parent', childId: 5 },
{ id: 4, name: 'Student User', email: 'student@hostel.com', password: 'student', role: 'Student', room: 'B-102', feesDue: 0 },
{ id: 5, name: 'Child Student', email: 'child@hostel.com', password: 'child', role: 'Student', room: 'C-201', feesDue: 1500 }
];


let gatepasses = [
// example
];


let attendanceLog = {}; // keyed by date -> {studentId: presentBool}


export const api = {
async login(email, password){
await delay(300);
const u = sampleUsers.find(x => x.email === email && x.password === password);
if(!u) throw new Error('Invalid credentials');
// return token-like object
return { user: { id: u.id, name: u.name, email: u.email, role: u.role, childId: u.childId, room: u.room, feesDue: u.feesDue } };
},
async register(payload){
await delay(300);
const exists = sampleUsers.some(x => x.email === payload.email);
if(exists) throw new Error('Email already registered');
const newUser = { id: sampleUsers.length+1, ...payload };
sampleUsers.push(newUser);
return { user: newUser };
},
async fetchGatePasses(){
await delay(200);
return gatepasses.slice().reverse();
},
async createGatePass(gp){
await delay(200);
const newGp = { id: Date.now(), status: 'PendingParent', createdAt: new Date().toISOString(), ...gp };
gatepasses.push(newGp);
return newGp;
},
async updateGatePass(id, update){
await delay(150);
const idx = gatepasses.findIndex(x => x.id === id);
if(idx === -1) throw new Error('Not found');
gatepasses[idx] = { ...gatepasses[idx], ...update };
return gatepasses[idx];
},
async fetchStudents(){
await delay(200);
return sampleUsers.filter(u => u.role === 'Student');
},
async markAttendance(date, records){
await delay(150);
attendanceLog[date] = records;
return { date, records };
},
async getAttendance(date){
await delay(100);
return attendanceLog[date] || {};
}
};