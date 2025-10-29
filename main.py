from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Explicitly allow React app
    allow_credentials=True,
    allow_methods=["*"],               # Allow all HTTP methods
    allow_headers=["*"],               # Allow all headers
)

DATABASE = r"C:\Users\user\OneDrive\Desktop\New folder\Hostel-Management-System\hms.db"
def get_db():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Data Models
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



class StudentLogin(BaseModel):
    username: str
    password: str

class PaymentRequest(BaseModel):
    student_id: int
    amount: float


# FR-1: Trigger Fee Collection
@app.post("/admin/trigger_fee_collection")
def trigger_fee_collection(req: FeeCollectionRequest, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT id FROM Student WHERE semester=?", (req.semester,))
    students = c.fetchall()
    for row in students:
        c.execute("INSERT INTO Fee (student_id, amount, status) VALUES (?, ?, ?)", (row['id'], req.amount, 'pending'))
    db.commit()
    return {"msg": f"Fee collection triggered for semester {req.semester}"}

# FR-2: Manage Rooms Allocation
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

# FR-2: Manage Rooms Release
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

# FR-3: Generate Hostel Reports (summary example)
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

# FR-4: Update Attendance
@app.post("/rc/update_attendance")
def update_attendance(attendance: AttendanceUpdate, db=Depends(get_db)):
    c = db.cursor()
    c.execute("INSERT INTO Attendance (stu_id, attendance, date) VALUES (?, ?, ?)",
              (attendance.stu_id, attendance.attendance, attendance.date))
    db.commit()
    return {"msg": "Attendance updated"}

# FR-5: Gatepass Verification (RC checks approval)
@app.get("/rc/verify_gatepass/{approval_id}")
def verify_gatepass(approval_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT status, parent_ack FROM Approval WHERE id=?", (approval_id,))
    approval = c.fetchone()
    if not approval:
        raise HTTPException(status_code=404, detail="Gatepass request not found")
    allowed = approval['status'] == 'approved' and approval['parent_ack'] == 'approved'
    return {"allowed": allowed, "status": approval['status'], "parent_ack": approval['parent_ack']}

# FR-6: View Records (RC views fee and attendance)
@app.get("/rc/view_records/{student_id}")
def rc_view_records(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=?", (student_id,))
    fees = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Attendance WHERE stu_id=?", (student_id,))
    attendance = [dict(row) for row in c.fetchall()]
    return {"fee_records": fees, "attendance_records": attendance}





# FR-10: Student Login
@app.post("/student/login")
def student_login(login: StudentLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Student WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    print(user)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"msg": "Login successful", "user":user}

# FR-11: Pay Fees
@app.post("/student/pay_fee")
def pay_fee(payment: PaymentRequest, db=Depends(get_db)):
    c = db.cursor()
    c.execute("UPDATE Fee SET status='paid', amount=? WHERE student_id=? AND status='pending'",
              (payment.amount, payment.student_id))
    if c.rowcount == 0:
        raise HTTPException(status_code=400, detail="No pending fee found")
    db.commit()
    return {"msg": "Payment successful"}

# FR-12: Download Receipt (latest paid fee)
@app.get("/student/fee_receipt/{student_id}")
def download_receipt(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=? AND status='paid' ORDER BY id DESC LIMIT 1", (student_id,))
    receipt = c.fetchone()
    if not receipt:
        raise HTTPException(status_code=404, detail="No paid fee found")
    return {"receipt": dict(receipt)}
