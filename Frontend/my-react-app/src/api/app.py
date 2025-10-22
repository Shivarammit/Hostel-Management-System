from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import sqlite3

app = FastAPI()

# CORS configuration for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "hms.db"

def get_db():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Data models with aliases for frontend camelCase
class GatepassCreateRequest(BaseModel):
    student_id: int = Field(..., alias="studentId")
    reason: str
    from_date: str = Field(..., alias="fromDate")
    to_date: str = Field(..., alias="toDate")

class FeeCollectionRequest(BaseModel):
    semester: int
    amount: float

class RoomAllocationRequest(BaseModel):
    student_id: int
    room_id: int

class AttendanceUpdate(BaseModel):
    stu_id: int
    attendance: str
    date: str

class GatepassApproval(BaseModel):
    approval_id: int
    approved: bool

class ParentLogin(BaseModel):
    username: str
    password: str

class StudentLogin(BaseModel):
    username: str
    password: str

class PaymentRequest(BaseModel):
    student_id: int
    amount: float
class RCLogin(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str
# Example Admin APIs
@app.post("/admin/trigger_fee_collection")
def trigger_fee_collection(req: FeeCollectionRequest, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT id FROM Student WHERE semester=?", (req.semester,))
    students = c.fetchall()
    for row in students:
        c.execute("INSERT INTO Fee (student_id, amount, status) VALUES (?, ?, ?)", (row['id'], req.amount, 'pending'))
    db.commit()
    return {"msg": f"Fee collection triggered for semester {req.semester}"}

@app.post("/admin/allocate_room")
def allocate_room(req: RoomAllocationRequest, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT status FROM Rooms WHERE id=?", (req.room_id,))
    room = c.fetchone()
    if not room or room['status'] == 'allocated':
        raise HTTPException(status_code=400, detail="Room not available")
    c.execute("UPDATE Student SET room_id=? WHERE id=?", (req.room_id, req.student_id))
    c.execute("UPDATE Rooms SET status='allocated' WHERE id=?", (req.room_id,))
    db.commit()
    return {"msg": "Room allocated"}

@app.post("/admin/release_room")
def release_room(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT room_id FROM Student WHERE id=?", (student_id,))
    row = c.fetchone()
    if not row or not row['room_id']:
        raise HTTPException(status_code=404, detail="Student or room not found")
    c.execute("UPDATE Rooms SET status='available' WHERE id=?", (row['room_id'],))
    c.execute("UPDATE Student SET room_id=NULL WHERE id=?", (student_id,))
    db.commit()
    return {"msg": "Room released"}

@app.get("/admin/reports/fee_payment")
def generate_fee_report(db=Depends(get_db)):
    c = db.cursor()
    c.execute("""
        SELECT s.id, s.username, f.amount, f.status FROM Student s
        LEFT JOIN Fee f ON s.id = f.student_id
    """)
    rows = c.fetchall()
    return {"fee_report": [dict(r) for r in rows]}

@app.get("/admin/reports/attendance")
def generate_attendance_report(db=Depends(get_db)):
    c = db.cursor()
    c.execute("""
        SELECT s.id, s.username, a.attendance, a.date FROM Student s
        LEFT JOIN Attendance a ON s.id = a.stu_id
    """)
    rows = c.fetchall()
    return {"attendance_report": [dict(r) for r in rows]}

# Attendance update API for RC
@app.post("/rc/update_attendance")
def update_attendance(attendance: AttendanceUpdate, db=Depends(get_db)):
    c = db.cursor()
    c.execute("INSERT INTO Attendance (stu_id, attendance, date) VALUES (?, ?, ?)",
              (attendance.stu_id, attendance.attendance, attendance.date))
    db.commit()
    return {"msg": "Attendance updated"}
@app.post("/rc/login")
def rc_login(login: RCLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM RC WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Return user details as needed
    return {"msg": "Login successful", "rc_id": user['id'], "name": user['name'], "role": "RC"}

@app.post("/admin/login")
def admin_login(login: AdminLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Admin WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Return user details as needed
    return {"msg": "Login successful", "admin_id": user['id'], "name": user['name'], "role": user.get('role', 'Admin')}

# Gatepass verification API
@app.get("/rc/verify_gatepass/{approval_id}")
def verify_gatepass(approval_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT status, parent_ack FROM Approval WHERE id=?", (approval_id,))
    approval = c.fetchone()
    if not approval:
        raise HTTPException(status_code=404, detail="Gatepass request not found")
    allowed = approval['status'] == 'approved' and approval['parent_ack'] == 'approved'
    return {"allowed": allowed, "status": approval['status'], "parent_ack": approval['parent_ack']}

@app.get("/rc/view_records/{student_id}")
def rc_view_records(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=?", (student_id,))
    fees = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Attendance WHERE stu_id=?", (student_id,))
    attendance = [dict(row) for row in c.fetchall()]
    return {"fee_records": fees, "attendance_records": attendance}

# Parent login
@app.post("/parent/login")
def parent_login(login: ParentLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Parent WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"msg": "Login successful", "parent_id": user['id']}

# Approve/reject gatepass by parent
@app.post("/parent/approve_gatepass")
def approve_gatepass(approval: GatepassApproval, db=Depends(get_db)):
    status = 'approved' if approval.approved else 'rejected'
    c = db.cursor()
    c.execute("UPDATE Approval SET status=?, parent_ack=? WHERE id=?", (status, status, approval.approval_id))
    db.commit()
    return {"msg": f"Gatepass {status}"}

@app.get("/parent/student_records/{student_id}")
def parent_view_student_records(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=?", (student_id,))
    fees = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Attendance WHERE stu_id=?", (student_id,))
    attendance = [dict(row) for row in c.fetchall()]
    return {"fee_records": fees, "attendance_records": attendance}

# Student login
@app.post("/student/login")
def student_login(login: StudentLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Student WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "name": user["name"] if "name" in user else "",
        "role": "Student"
    }
    return {"msg": "Login successful", "user": user_data}

# Student pays fee
@app.post("/student/pay_fee")
def pay_fee(payment: PaymentRequest, db=Depends(get_db)):
    c = db.cursor()
    c.execute("UPDATE Fee SET status='paid', amount=? WHERE student_id=? AND status='pending'",
              (payment.amount, payment.student_id))
    if c.rowcount == 0:
        raise HTTPException(status_code=400, detail="No pending fee found")
    db.commit()
    return {"msg": "Payment successful"}

# Download student fee receipt
@app.get("/student/fee_receipt/{student_id}")
def download_receipt(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=? AND status='paid' ORDER BY id DESC LIMIT 1", (student_id,))
    receipt = c.fetchone()
    if not receipt:
        raise HTTPException(status_code=404, detail="No paid fee found")
    return {"receipt": dict(receipt)}

# Get rooms with student list
@app.get("/api/rooms")
def get_rooms(db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Rooms")
    rooms = []
    for row in c.fetchall():
        room = dict(row)
        c2 = db.cursor()
        c2.execute("SELECT id, name, phone FROM Student WHERE room_id=?", (room["id"],))
        students = [dict(s) for s in c2.fetchall()]
        room["students"] = students
        room["hostel"] = {"hostelName": room.get("room_number", "")}
        rooms.append(room)
    return {"rooms": rooms}

# List all gatepasses
@app.get("/api/gatepasses")
def list_gatepasses(db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Approval")
    rows = c.fetchall()
    gatepasses = [dict(row) for row in rows]
    return gatepasses

# Approve gatepass by parent
@app.post("/api/gatepasses/{id}/parent-approve")
def parent_approve(id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("UPDATE Approval SET parentApproved=1, status='PendingRC', parent_ack='approved' WHERE id=?", (id,))
    db.commit()
    return {"msg": "Parent approved"}

# Approve gatepass by RC
@app.post("/api/gatepasses/{id}/rc-approve")
def rc_approve(id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("UPDATE Approval SET rcApproved=1, status='Approved' WHERE id=?", (id,))
    db.commit()
    return {"msg": "RC approved"}

# Reject gatepass
@app.post("/api/gatepasses/{id}/reject")
def gatepass_reject(id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("UPDATE Approval SET status='Rejected' WHERE id=?", (id,))
    db.commit()
    return {"msg": "Gate pass rejected"}
@app.post("/api/gatepasses")
async def create_gatepass(req: GatepassCreateRequest, db=Depends(get_db)):
    try:
        from_date = datetime.strptime(req.from_date, "%Y-%m-%d")
        to_date = datetime.strptime(req.to_date, "%Y-%m-%d")
        days = (to_date - from_date).days + 1
        c = db.cursor()
        c.execute(
            "INSERT INTO Approval (stu_id, rc_id, status, parent_ack, days, reason, from_date, to_date) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (req.student_id, None, "Pending", None, days, req.reason, req.from_date, req.to_date)
        )
        db.commit()
        return {"msg": "Gate pass created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create gate pass: {e}")