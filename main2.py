from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import sqlite3
import os,sys
from datetime import datetime
from fastapi import FastAPI, Request,UploadFile, Form, Depends, HTTPException, File 

app = FastAPI()
import subprocess
# CORS configuration for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://hms-frontend-react.s3-website.ap-south-1.amazonaws.com",
    "https://hms-frontend-react.s3-website.ap-south-1.amazonaws.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# DATABASE = os.path.join(os.path.dirname(__file__), "hms.db")
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
    face_image: str  # base64 image string from frontend
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
class ApprovalUpdate(BaseModel):
    rc_id: int
    action: str  
class HostelFee(BaseModel):
    program: str       # e.g., "BE", "ME", "MBA"
    semester: int           # Semester number (integer)
    amount: float         # Hostel fee amount
    deadline: str      # e.g., "2025-12-31"
    fine: float | None = None  # Optional fine amount

@app.get("/start-attendance")
def start_attendance(request: Request):
    try:
        script_path = r"C:\Users\user\OneDrive\Desktop\New folder\Hostel-Management-System\Attendance\AutoMark\test.py"
        working_dir = os.path.dirname(script_path)

        # Start script (non-blocking)
        process = subprocess.Popen(["python", script_path], cwd=working_dir)

        if process.poll() is None:
            # Process started successfully
            return ({"message": "✅ Attendance recording started"})
        else:
            # Process failed immediately
            return ({"message": "⚠️ Could not start attendance recording"})

    except Exception as e:
        return ({"message": f"❌ Error: {str(e)}"})
    
@app.get('/api/hostel_fee/{id}')
def get_hostel_fee(id: int, db=Depends(get_db)):
    c = db.cursor()
    print(f"\n🟩 START: Fetching hostel fee details for Student ID = {id}")

    # Step 1: Get student's program and semester
    c.execute("SELECT Program, semester FROM Student WHERE id = ?", (id,))
    student = c.fetchone()
    print("➡️ Step 1: Student fetched:", dict(student) if student else None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    program = student["Program"]
    sem = student["semester"]
    print(f"   └─ Program: {program}, Semester: {sem}")

    # Step 2: Find matching hostel fee record
    c.execute("SELECT * FROM Hostel_Fee WHERE program = ? AND sem = ?", (program, sem))
    hostel_fee = c.fetchone()
    print("➡️ Step 2: Hostel fee record:", dict(hostel_fee) if hostel_fee else None)
    if not hostel_fee:
        raise HTTPException(status_code=404, detail="No hostel fee record found for this student")

    fee_id = hostel_fee["id"]
    fee_amount = hostel_fee["fee"]
    fine = hostel_fee["fine"]
    deadline = hostel_fee["deadline"]
    print(f"   └─ Fee ID: {fee_id}, Fee: {fee_amount}, Fine: {fine}, Deadline: {deadline}")

    # Step 3: Check if already paid
    c.execute("""
        SELECT * FROM StudentTransaction
        WHERE stu_id = ? AND Hostel_fee_id = ? AND status = 'Paid'
        ORDER BY time DESC LIMIT 1
    """, (id, fee_id))
    transaction = c.fetchone()
    print("➡️ Step 3: Transaction fetched:", dict(transaction) if transaction else None)

    # Step 4: Handle already paid case
    if transaction:
        total_payable = transaction["amount"]
        fine_amount = total_payable - fee_amount if total_payable > fee_amount else 0
        print("✅ Step 4: Student already paid")
        print(f"   └─ Total Paid: {total_payable}, Fine in Payment: {fine_amount}, Paid On: {transaction['time']}")

        return {
            "student_id": id,
            "program": program,
            "semester": sem,
            "fee_amount": fee_amount,
            "fine": fine_amount,
            "deadline": deadline,
            "status": "Paid",
            "total_payable": total_payable,
            "paid_on": transaction["time"]
        }

    # Step 5: Fine calculation (only if not paid)
    current_date = datetime.now().date()
    deadline_date = datetime.strptime(deadline, "%Y-%m-%d").date()
    fine_amount = 0
    total_amount = fee_amount

    print(f"➡️ Step 5: Fine calculation")
    print(f"   └─ Current Date: {current_date}, Deadline: {deadline_date}")

    if current_date > deadline_date:
        days_late = (current_date - deadline_date).days  # Number of days late
        fine_amount = fine * days_late                   # Fine increases per day
        total_amount += fine_amount   
        print(f"   └─ Fine applied: {fine_amount}")
    else:
        print("   └─ No fine applied (before deadline)")

    # Step 6: Return pending payment details
    print("✅ Step 6: Returning pending payment details")
    print(f"   └─ Total Payable: {total_amount}, Status: Pending, fine(per day):{fine}\n")

    return {
        "student_id": id,
        "program": program,
        "semester": sem,
        "fee_amount": fee_amount,
        "fine": fine,
        "deadline": deadline,
        "status": "Pending",
        "total_payable": total_amount
    }

# ✅ Pay Hostel Fee
@app.post("/api/pay_hostel_fee/{student_id}")
def pay_hostel_fee(student_id: int, db=Depends(get_db)):
    c = db.cursor()

    # 1️⃣ Get student's program and semester
    c.execute("SELECT Program, semester FROM Student WHERE id = ?", (student_id,))
    student = c.fetchone()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    program = student["Program"]
    sem = student["semester"]

    # 2️⃣ Get matching hostel fee
    c.execute("SELECT * FROM Hostel_Fee WHERE program = ? AND sem = ?", (program, sem))
    hostel_fee = c.fetchone()
    if not hostel_fee:
        raise HTTPException(status_code=404, detail="No hostel fee record found")

    fee_id = hostel_fee["id"]
    fee_amount = hostel_fee["fee"]
    fine = hostel_fee["fine"]
    deadline = hostel_fee["deadline"]

    # 3️⃣ Check if already paid
    c.execute("""
        SELECT * FROM StudentTransaction
        WHERE stu_id = ? AND Hostel_fee_id = ? AND status = 'Paid'
    """, (student_id, fee_id))
    if c.fetchone():
        return {"message": "Already paid", "status": "Paid"}

    # 4️⃣ Fine calculation (if past deadline)
    current_date = datetime.now().date()
    deadline_date = datetime.strptime(deadline, "%Y-%m-%d").date()
    total_amount = fee_amount
    if current_date > deadline_date:
        total_amount += fine

    # 5️⃣ Insert new transaction record
    c.execute("""
        INSERT INTO StudentTransaction (stu_id, status, amount, time, Hostel_fee_id)
        VALUES (?, 'Paid', ?, ?, ?)
    """, (student_id, total_amount, datetime.now(), fee_id))
    db.commit()

    return {
        "message": "Payment successful",
        "student_id": student_id,
        "amount": total_amount,
        "status": "Paid"
    }
@app.get("/student/fee_receipt/{student_id}")
def get_fee_receipt(student_id: int, db=Depends(get_db)):
    c = db.cursor()

    c.execute("""
        SELECT st.id, st.amount, st.time, hf.program, hf.sem, s.username, s.email
        FROM StudentTransaction st
        JOIN Hostel_Fee hf ON st.Hostel_fee_id = hf.id
        JOIN Student s ON s.id = st.stu_id
        WHERE st.stu_id = ? AND st.status = 'Paid'
        ORDER BY st.time DESC LIMIT 1
    """, (student_id,))
    transaction = c.fetchone()

    if not transaction:
        raise HTTPException(status_code=404, detail="No paid transaction found")

    receipt = {
        "transaction_id": transaction["id"],
        "student_name": transaction["username"],
        "email": transaction["email"],
        "program": transaction["program"],
        "semester": transaction["sem"],
        "amount": transaction["amount"],
        "date": transaction["time"],
        "status": "Paid"
    }

    return {"receipt": receipt}

@app.post("/admin/hostel_fee_details")
def add_hostel_fee(fee_data: HostelFee, db=Depends(get_db)):
    c = db.cursor()
    try:
        c.execute(
            """
            INSERT INTO Hostel_Fee (program, sem, fee, deadline, fine)
            VALUES (?, ?, ?, ?, ?)
            """,
            (fee_data.program, fee_data.semester, fee_data.amount, fee_data.deadline, fee_data.fine),
        )
        db.commit()
        return {"msg": "✅ Hostel fee details added successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
@app.get("/admin/reports/hostel_fee")
def get_hostel_fee_report(db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Hostel_Fee ORDER BY id DESC")
    data = [dict(row) for row in c.fetchall()]
    return {"data": data}


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
@app.post("/rc/gatepass/{id}/action")
def update_gatepass_status(id: int, data: ApprovalUpdate, db=Depends(get_db)):
    c = db.cursor()

    # Check if approval exists
    c.execute("SELECT * FROM Approval WHERE id = ?", (id,))
    approval = c.fetchone()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    # Update RC acknowledgment
    new_ack = "Accepted" if data.action.lower() == "accept" else "Rejected"
    c.execute("UPDATE Approval SET rc_ack = ? WHERE id = ?", (new_ack, id))

    # Check if both RC and Parent accepted
    c.execute("SELECT rc_ack, parent_ack FROM Approval WHERE id = ?", (id,))
    row = c.fetchone()
    if row["rc_ack"] == "Accepted" and row["parent_ack"] == "Approved":
        c.execute("UPDATE Approval SET status = 'Approved' WHERE id = ?", (id,))
    elif row["rc_ack"] == "Rejected":
        c.execute("UPDATE Approval SET status = 'Rejected' WHERE id = ?", (id,))

    db.commit()
    return {"message": f"Gate pass {new_ack.lower()} successfully."}


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
    try:
        cursor = db.cursor()
        cursor.execute("""
          SELECT 
    s.id AS student_id,
    s.username,
    s.email,
    s.phone,
    s.semester,
    s.Program,
    f.program AS fee_program,
    f.sem AS fee_semester,
    f.fee AS hostel_fee_amount,
    f.deadline,
    f.fine,
    t.amount AS paid_amount,
    t.status AS transaction_status,
    t.time AS transaction_time
FROM Student s
JOIN StudentTransaction t ON s.id = t.stu_id
JOIN Hostel_Fee f ON t.Hostel_fee_id = f.id
WHERE t.status = 'Paid'
ORDER BY t.time DESC;

        """)
        result = [dict(row) for row in cursor.fetchall()]
        print("result",result)
        return {"paid_fees": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/admin/reports/attendance")
def get_attendance_report(db=Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT 
                a.id AS attendance_id,
                s.username AS student_username,
                s.email AS student_email,
                s.phone AS student_phone,
                s.semester AS semester,
                r.username AS rc_username,
                a.attendance AS attendance_status,
                a.date AS date
            FROM Attendance a
            LEFT JOIN Student s ON a.stu_id = s.username
            LEFT JOIN Rooms ro ON s.room_id = ro.id
            LEFT JOIN RC r ON ro.rc_id = r.id
            ORDER BY a.date DESC;
        """)
        data = [dict(row) for row in cursor.fetchall()]
        return {"attendance_report": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
       
        "role": "rc"
    }
    return {"msg": "Login successful", "user": user_data}

# @app.post("/student/register")
# async def register_student(
#     username: str = Form(...),
#     password: str = Form(...),
#     email: str = Form(...),
#     phone: str = Form(...),
#     semester: int = Form(...),
#     image: UploadFile = Form(...),
#     db = Depends(get_db),
# ):
#     c = db.cursor()

#     c.execute("SELECT * FROM Student WHERE username=? OR email=?", (username, email))
#     if c.fetchone():
#         raise HTTPException(status_code=400, detail="Username or email already exists")

#     file_location = os.path.join(UPLOAD_FOLDER, image.filename)
#     with open(file_location, "wb") as f:
#         f.write(await image.read())

#     c.execute(
#         """
#         INSERT INTO Student (username, password, email, phone, semester, face_path, room_id)
#         VALUES (?, ?, ?, ?, ?, ?, NULL)
#         """,
#         (username, password, email, phone, semester, file_location),
#     )
#     db.commit()
#     db.close()

#     # Run Add_faces.py with full path
#     try:
#         subprocess.run(["python", ADD_FACES_PATH, username, file_location], check=True)
#     except subprocess.CalledProcessError as e:
#         raise HTTPException(status_code=500, detail=f"Error running Add_faces.py: {e}")
#     except FileNotFoundError:
#         raise HTTPException(status_code=500, detail="Add_faces.py not found at specified path")

#     return {"msg": f"Student {username} registered successfully and face data added."}

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
    id = c.lastrowid
    return {"msg": "Parent registered successfully","user":req,"id": id}

import sys, os

# Dynamically add Attendance/AutoMark to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "Attendance", "AutoMark"))

from Attendance.AutoMark.Add_faces import process_face


# @app.post("/student/register")
# async def register_student(
#     username: str = Form(...),
#     password: str = Form(...),
#     email: str = Form(...),
#     phone: str = Form(...),
#     semester: int = Form(...),
#     program: str = Form(...),
#     image: UploadFile = File(...),
#     db = Depends(get_db),
# ):
#     c = db.cursor()

#     # check duplicates
#     c.execute("SELECT * FROM Student WHERE username=? OR email=?", (username, email))
#     if c.fetchone():
#         raise HTTPException(status_code=400, detail="Username or email already exists")

#     # save uploaded image file (uploads folder next to main2.py)
#     BASE_DIR = os.path.dirname(__file__)
#     UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
#     os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#     # sanitize filename if needed; here we use timestamp + original name
#     safe_fname = f"{image.filename}"
#     file_location = os.path.join(UPLOAD_FOLDER, safe_fname)

#     with open(file_location, "wb") as f:
#         f.write(await image.read())
#     print(f"[REGISTER] Saved image at {file_location}", flush=True)
#     # process face using the module we created
#     try:
#         num_faces = process_face(file_location, username)
#         print(f"[REGISTER] {num_faces} face(s) processed successfully.", flush=True)
#     except Exception as e:
#         # optional: remove saved file if processing failed
#         if os.path.exists(file_location):
#             os.remove(file_location)
#         raise HTTPException(status_code=400, detail=f"Face processing failed: {str(e)}")
#     # 3️⃣ Find a room with availability > 0
#     c.execute("SELECT id, availability FROM Rooms WHERE availability > 0 ORDER BY availability ASC LIMIT 1")
#     room = c.fetchone()

#     if room:
#         room_id = room[0]
#         new_availability = room[1] - 1
#         c.execute("UPDATE Rooms SET availability = ? WHERE id = ?", (new_availability, room_id))
#     else:
#         room_id = 0

#     # 4️⃣ Insert new student
#     c.execute(
#         """
#         INSERT INTO Student (username, password, email, phone, semester, program, face_path, room_id)
#         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         """,
#         (username, password, email, phone, semester, program, file_location, room_id),
#     )

#     db.commit()
#     student_id = c.lastrowid
#     db.close()

#     return {
#         "msg": "Student registered successfully",
#         "assigned_room_id": room_id,
#         "room_status": "Assigned" if room_id != 0 else "No rooms available",
#         "id": student_id,
#     }

    # find an available room, insert student, etc.
    # ... (your existing DB logic here)




@app.post("/student/register")
async def register_student(
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    semester: int = Form(...),
    program: str = Form(...),
    image: UploadFile = File(...),
    db = Depends(get_db),
):
    c = db.cursor()

    # 1️⃣ Check for existing username or email
    c.execute("SELECT * FROM Student WHERE username=? OR email=?", (username, email))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # 2️⃣ Save uploaded image
    file_location = os.path.join(UPLOAD_FOLDER, image.filename)
    with open(file_location, "wb") as f:
        f.write(await image.read())
    print(f"[REGISTER] Saved image at {file_location}", flush=True)
    # process face using the module we created
    try:
        num_faces = process_face(file_location, username)
        print(f"[REGISTER] {num_faces} face(s) processed successfully.", flush=True)
    except Exception as e:
        # optional: remove saved file if processing failed
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Face processing failed: {str(e)}")


    # 3️⃣ Find a room with availability > 0
    c.execute("SELECT id,rc_id, availability FROM Rooms WHERE availability > 0 ORDER BY availability ASC LIMIT 1")
    room = c.fetchone()

    if room:
        room_id = room[0]
        new_availability = room[1] - 1
        c.execute("UPDATE Rooms SET availability = ? WHERE id = ?", (new_availability, room_id))
    else:
        room_id = 0

    # 4️⃣ Insert new student
    c.execute(
        """
        INSERT INTO Student (username, password, email, phone, semester, program, face_path, room_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (username, password, email, phone, semester, program, file_location, room_id),
    )

    db.commit()
    student_id = c.lastrowid
    db.close()

    return {
        "msg": "Student registered successfully",
        "assigned_room_id": room_id,
        "room_status": "Assigned" if room_id != 0 else "No rooms available",
        "id": student_id,
    }

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
    id = c.lastrowid
    return {"msg": "RC registered successfully","id":id}



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
    c.execute("SELECT * FROM Fee WHERE student_id=? ORDER BY id DESC", (student_id,))
    fees = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Attendance WHERE stu_id=? ORDER BY id DESC", (student_id,))
    attendance = [dict(row) for row in c.fetchall()]
    c.execute("SELECT * FROM Approval WHERE stu_id=? ORDER BY id DESC", (student_id,))
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
@app.get("/api/gatepasses/{rc_id}")
def list_gatepasses(rc_id:int,db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM Approval where rc_id=?",(rc_id,))
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


@app.get("/api/gatepasses")
async def create_gatepass( db=Depends(get_db)):
    try:
        c = db.cursor()
        c.execute("SELECT * FROM Approval")
        rows = c.fetchall()
        print(rows)
        gatepasses = [dict(row) for row in rows]
        return gatepasses
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create gate pass: {e}")
    
# @app.post("/api/gatepasses")
# async def create_gatepass(req: GatepassCreateRequest, db=Depends(get_db)):
#     try:
#         from_date = datetime.strptime(req.from_date, "%Y-%m-%d")
#         to_date = datetime.strptime(req.to_date, "%Y-%m-%d")
#         days = (to_date - from_date).days + 1
#         c = db.cursor()

#         c.execute(
#             "INSERT INTO Approval (stu_id, rc_id, status, parent_ack, days, reason, from_date, to_date) "
#             "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
#             (req.student_id, None, "Pending", "Pending", days, req.reason, req.from_date, req.to_date)
#         )
#         db.commit()
#         return {"msg": "Gate pass created"}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Could not create gate pass: {e}")


@app.post("/api/gatepasses")
async def create_gatepass(req: GatepassCreateRequest, db=Depends(get_db)):
    try:
        from_date = datetime.strptime(req.from_date, "%Y-%m-%d")
        to_date = datetime.strptime(req.to_date, "%Y-%m-%d")
        days = (to_date - from_date).days + 1
        c = db.cursor()

        # Step 1: Get the student's room_id
        c.execute("SELECT room_id FROM Student WHERE id = ?", (req.student_id,))
        student_room = c.fetchone()
        if not student_room:
            raise HTTPException(status_code=404, detail="Student not found")
        room_id = student_room[0]

        # Step 2: Get rc_id from Rooms table using room_id
        c.execute("SELECT rc_id FROM Rooms WHERE id = ?", (room_id,))
        room_data = c.fetchone()
        if not room_data:
            raise HTTPException(status_code=404, detail="Room not found")
        rc_id = room_data[0]

        # Step 3: Insert into Approval table
        c.execute(
            """
            INSERT INTO Approval (stu_id, rc_id, status, parent_ack, days, reason, from_date, to_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (req.student_id, rc_id, "Pending", "Pending", days, req.reason, req.from_date, req.to_date)
        )
        db.commit()

        return {"msg": "Gate pass created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not create gate pass: {e}")
