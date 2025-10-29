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

DATABASE = r"C:\Users\user\OneDrive\Desktop\New folder\Hostel-Management-System\hms.db"

def get_db():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Data models with aliases for frontend camel
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

class ParentLogin(BaseModel):
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
class StudentRegister(BaseModel):
    username: str
    password: str
    email: str
    phone: str
    semester: int

class ParentRegister(BaseModel):
    username: str
    password: str
    phone: str
    student_id: int

class RCRegister(BaseModel):
    username: str
    password: str
    email: str
    phone: str

class AdminRegister(BaseModel):
    username: str
    password: str
    email: str
    phone: str
class GatepassApproval(BaseModel):
    approval_id: int
    approved: bool

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
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "name": user.get("name", ""),
        "role": "rc"
    }
    return {"msg": "Login successful", "user": user_data}

# ------------------ STUDENT REGISTRATION ------------------
@app.post("/student/register")
def register_student(req: StudentRegister, db=Depends(get_db)):
    c = db.cursor()
    print("Reached",req)
    # Check if username or email already exists
    c.execute("SELECT * FROM Student WHERE username=? OR email=?", (req.username, req.email))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    c.execute("""
        INSERT INTO Student (username, password, email, phone, semester, room_id)
        VALUES (?, ?, ?, ?, ?, NULL)
    """, (req.username, req.password, req.email, req.phone, req.semester))
    print("student register", c)
    db.commit()
    return {"msg": "Student registered successfully"}

# ------------------ PARENT REGISTRATION ------------------
@app.post("/parent/register")
def register_parent(req: ParentRegister, db=Depends(get_db)):
    c = db.cursor()

    # Check if student exists
    c.execute("SELECT id FROM Student WHERE id=?", (int(req.student_id),))

    student = c.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    c.execute("SELECT * FROM Parent WHERE username=?", (req.username,))

    if c.fetchone():
        raise HTTPException(status_code=400, detail="Parent username already exists")

    c.execute("""
        INSERT INTO Parent (student_id, username, phone, password)
        VALUES (?, ?, ?, ?)
    """, (req.student_id, req.username, req.phone, req.password))

    
    db.commit()
    return {"msg": "Parent registered successfully"}
# ------------------ RC REGISTRATION ------------------
@app.post("/rc/register")
def register_rc(req: RCRegister, db=Depends(get_db)):
    c = db.cursor()

    # Check username or email duplicate
    c.execute("SELECT * FROM RC WHERE username=? OR email=?", (req.username, req.email))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    c.execute("""
        INSERT INTO RC ( phone, username, password, email)
        VALUES ( ?, ?, ?, ?)
    """, (req.phone, req.username, req.password, req.email))

    db.commit()
    return {"msg": "RC registered successfully"}



@app.post("/admin/register")
def register_admin(req: AdminRegister, db=Depends(get_db)):
    c = db.cursor()

    # Check username or email duplicate
    c.execute("SELECT * FROM Admin WHERE  email=?", (req.email,))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")

    c.execute("""
        INSERT INTO Admin ( username, phone, password, email)
        VALUES (?, ?, ?, ?)
    """, (req.username, req.phone, req.password, req.email))

    db.commit()
    return {"msg": "Admin registered successfully"}

@app.post("/parent/login")
def parent_login(login: ParentLogin, db=Depends(get_db)):
    c = db.cursor()
    print(login)
    c.execute("SELECT * FROM Parent WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "role": "Parent",
        "student_id":user["student_id"]
    }
    return {"msg": "Login successful", "user": user_data}

@app.post("/admin/login")
def admin_login(login: AdminLogin, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Admin WHERE username=? AND password=?", (login.username, login.password))
    user = c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_data = {
        "id": user["id"],
        "username": user["username"],
        "role": "admin"
    }
    return {"msg": "Login successful", "user": user_data}

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

# Approve/reject gatepass by parent
# @app.post("/parent/approve_gatepass")
# def approve_gatepass(approval: GatepassApproval, db=Depends(get_db)):
#     status = 'approved' if approval.approved else 'rejected'
#     c = db.cursor()
#     c.execute("UPDATE Approval SET status=?, parent_ack=? WHERE id=?", (status, status, approval.approval_id))
#     db.commit()
#     return {"msg": f"Gatepass {status}"}

# @app.get("/parent/student_records/{student_id}")
# def parent_view_student_records(student_id: int, db=Depends(get_db)):
#     c = db.cursor()
#     c.execute("SELECT * FROM Fee WHERE student_id=?", (student_id,))
#     fees = [dict(row) for row in c.fetchall()]
#     c.execute("SELECT * FROM Attendance WHERE stu_id=?", (student_id,))
#     attendance = [dict(row) for row in c.fetchall()]
#     return {"fee_records": fees, "attendance_records": attendance}

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
# FR-9: Parent Views Student Records (fee and attendance)
@app.get("/parent/student_records/{student_id}")
def parent_view_student_records(student_id: int, db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Fee WHERE student_id=?", (student_id,))
    fees = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Attendance WHERE stu_id=?", (student_id,))
    attendance = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Approval WHERE stu_id=?", (student_id,))
    approval = [dict(row) for row in c.fetchall()]
    return {"fee_records": fees, "attendance_records": attendance, "approval":approval}

# FR-8: Approve/Reject Gatepass
@app.post("/parent/approve_gatepass")
def approve_gatepass(approval: GatepassApproval, db=Depends(get_db)):
    c = db.cursor()
    if(approval.approved):
        status='Pending(RC Approval)'
        c.execute("UPDATE Approval SET status=?,parent_ack=? WHERE id=?", (status,"Approved", approval.approval_id))
    else:
        status='Rejected'
        c.execute("UPDATE Approval SET status=?, parent_ack=? WHERE id=?", (status,status, approval.approval_id))
    
    db.commit()
    return {"msg": f"Gatepass {status}"}




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
    print("c",c)
    rooms = []
    for row in c.fetchall():
        room = dict(row)
        c2 = db.cursor()
        c2.execute("SELECT id, username, phone FROM Student WHERE room_id=?", (room["id"],))
        students = [dict(s) for s in c2.fetchall()]
        room["students"] = students
        rooms.append(room)
    return {"rooms": rooms}

# List all gatepasses
@app.get("/api/gatepasses")
def list_gatepasses(db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Approval;")
    rows = c.fetchall()
    print(rows)
    gatepasses = [dict(row) for row in rows]
    return gatepasses

@app.get("/admin/count/students")
def count_students(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM Student")
        count = cursor.fetchone()["count"]
       
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return gatepasses
@app.get("/admin/count/rc")
def count_rc(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM RC")
        count = cursor.fetchone()["count"]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/admin/count/parents")
def count_rc(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM Parent")
        count = cursor.fetchone()["count"]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/admin/count/admins")
def count_admins(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM Admin")
        count = cursor.fetchone()["count"]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/admin/users/parents")
def get_parents(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM Parent")
        parents = [dict(row) for row in cursor.fetchall()]
       
        return {"parents": parents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/admin/users/students")
def get_students(db=Depends(get_db)):
    try:
      
        cursor = db.cursor()
        cursor.execute("SELECT * FROM Student")
        students = [dict(row) for row in cursor.fetchall()]
    
        return {"students": students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/users/rc")
def get_rcs(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT 
                RC.id AS rc_id,
                RC.name,
                RC.phone,
                RC.username,
                RC.password,
                RC.email,
                Rooms.id AS room_id,
                Rooms.room_number,
                Rooms.availability
            FROM RC
            LEFT JOIN Rooms ON RC.id = Rooms.rc_id
        """)
        rows = cursor.fetchall()

        rcs_dict = {}
        for row in rows:
            rc_id = row["rc_id"]
            if rc_id not in rcs_dict:
                rcs_dict[rc_id] = {
                    "id": rc_id,
                    "name": row["name"],
                    "phone": row["phone"],
                    "username": row["username"],
                    "password": row["password"],
                    "email": row["email"],
                    "rooms": []
                }
            if row["room_id"]:
                rcs_dict[rc_id]["rooms"].append({
                    "room_id": row["room_id"],
                    "room_number": row["room_number"],
                    "availability": row["availability"]
                })

        return {"rcs": list(rcs_dict.values())}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/admin/users/admins")
def get_admins(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM Admin")
        admins = [dict(row) for row in cursor.fetchall()]
    
        return {"admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/api/rooms/{room_id}/assign_rc/{rc_id}")
def assign_rc(room_id: int,rc_id:int,db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("UPDATE Rooms SET rc_id = ? WHERE id = ?", (rc_id, room_id))
    db.commit()
    return {"message": "RC assigned successfully"}



# Approve gatepass by parent
@app.post("/api/gatepasses/{id}/parent-approve")
def parent_approve(id: int, db=Depends(get_db)):
    c = db.cursor()

    # When the parent approves, update:
    # - parent_ack = 'Approved'
    # - status = 'Pending-RC' (so RC can review next)
    c.execute("""
        UPDATE Approval
        SET parent_ack = 'Approved',
            status = 'Pending-RC'
        WHERE id = ?
    """, (id,))

    db.commit()
    return {"msg": "Parent approved successfully"}

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
            (req.student_id, None, "Pending", "Pending", days, req.reason, req.from_date, req.to_date)
        )
        db.commit()
        return {"msg": "Gate pass created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create gate pass: {e}")