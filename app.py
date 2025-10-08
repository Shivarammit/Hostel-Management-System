from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from typing import List, Optional

app = FastAPI()
DATABASE = "hostel.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Models
class FeeCollectionRequest(BaseModel):
    semester: str

class RoomAllocationRequest(BaseModel):
    alumni_id: int
    room_id: int

class AttendanceUpdate(BaseModel):
    alumni_id: int
    attendance_date: str
    status: str

class GatepassRequest(BaseModel):
    alumni_id: int
    out_date: str
    in_date: str

class GatepassApproval(BaseModel):
    request_id: int
    approved: bool

class PaymentRequest(BaseModel):
    alumni_id: int
    amount: float

# Admin APIs
@app.post("/admin/trigger_fee_collection")
def trigger_fee_collection(semester: FeeCollectionRequest):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    # Insert payment record for all students with status 'pending'
    c.execute("SELECT alumni_id FROM student")
    students = c.fetchall()
    for s in students:
        c.execute(
            "INSERT INTO student_transaction (alumni_id, payment_date, amount, status) VALUES (?, ?, ?, ?)",
            (s['alumni_id'], None, 0.0, 'pending')  # amount and date can be updated later
        )
    conn.commit()
    conn.close()
    return {"msg": f"Fee collection cycle {semester.semester} triggered"}

@app.post("/admin/allocate_room")
def allocate_room(request: RoomAllocationRequest):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    # Check if room is available
    c.execute("SELECT * FROM rooms WHERE room_id=? AND is_allocated=0", (request.room_id,))
    room = c.fetchone()
    if not room:
        raise HTTPException(status_code=400, detail="Room not available")
    # Allocate room
    c.execute("INSERT INTO student_allocation (alumni_id, room_id) VALUES (?, ?)", (request.alumni_id, request.room_id))
    c.execute("UPDATE rooms SET is_allocated=1 WHERE room_id=?", (request.room_id,))
    conn.commit()
    conn.close()
    return {"msg": "Room allocated"}

# Residential Counselor APIs
@app.post("/rc/update_attendance")
def update_attendance(attendance: AttendanceUpdate):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute(
        "INSERT INTO attendance (alumni_id, attendance_date, status) VALUES (?, ?, ?)",
        (attendance.alumni_id, attendance.attendance_date, attendance.status)
    )
    conn.commit()
    conn.close()
    return {"msg": "Attendance updated"}

@app.get("/rc/verify_gatepass/{request_id}")
def verify_gatepass(request_id: int):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT approved_by_parent FROM gatepass_request WHERE request_id=?", (request_id,))
    row = c.fetchone()
    if row and row[0] == 1:
        return {"allowed": True}
    else:
        return {"allowed": False}

# Parent APIs
@app.get("/parent/gatepass_requests/{parent_id}")
def get_gatepass_requests(parent_id: int):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("""
        SELECT g.request_id, g.out_date, g.in_date, g.status FROM gatepass_request g
        JOIN student s ON g.alumni_id = s.alumni_id
        WHERE s.parent_id = ?
    """, (parent_id,))
    rows = c.fetchall()
    return [dict(row) for row in rows]

@app.post("/parent/approve_gatepass")
def approve_gatepass(approval: GatepassApproval):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    status = 'approved' if approval.approved else 'rejected'
    c.execute("UPDATE gatepass_request SET status=?, approved_by_parent=? WHERE request_id=?",
              (status, 1 if approval.approved else 0, approval.request_id))
    conn.commit()
    conn.close()
    return {"msg": f"Gatepass {status}"}

# Student APIs
@app.post("/student/pay_fee")
def pay_fee(payment: PaymentRequest):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("UPDATE student_transaction SET status='paid', payment_date=date('now'), amount=? WHERE alumni_id=? AND status='pending'",
              (payment.amount, payment.alumni_id))
    conn.commit()
    conn.close()
    return {"msg": "Payment successful"}

@app.post("/student/apply_gatepass")
def apply_gatepass(gatepass: GatepassRequest):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("INSERT INTO gatepass_request (alumni_id, out_date, in_date) VALUES (?, ?, ?)",
              (gatepass.alumni_id, gatepass.out_date, gatepass.in_date))
    conn.commit()
    conn.close()
    return {"msg": "Gatepass applied"}

@app.get("/student/room_allocation/{alumni_id}")
def get_room_allocation(alumni_id: int):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("""
        SELECT r.room_number FROM student_allocation sa
        JOIN rooms r ON sa.room_id = r.room_id
        WHERE sa.alumni_id = ?
    """, (alumni_id,))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Room not allocated")
    return {"room_number": row[0]}
