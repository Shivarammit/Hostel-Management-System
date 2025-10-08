from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session


DATABASE_URL = "d:\Hostel Management - Backend\hms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()



class Student(Base):
    __tablename__ = "student"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    room = Column(String)
    fee_status = Column(String)

class Parent(Base):
    __tablename__ = "parent"
    id = Column(Integer, primary_key=True, index=True)
    linked_student = Column(Integer, ForeignKey("student.id"))
    student = relationship("Student")

class Gatepass(Base):
    __tablename__ = "gatepass"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"))
    status = Column(String)
    approvals = Column(Text)
    student = relationship("Student")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Text)
    student_id = Column(Integer, ForeignKey("student.id"))
    status = Column(String)
    student = relationship("Student")

class RoomAllocation(Base):
    __tablename__ = "room_allocation"
    room = Column(String, primary_key=True, index=True)
    status = Column(String)

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)

Base.metadata.create_all(bind=engine)


app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/student/register")
def register_student(name: str, room: str, db: Session = Depends(get_db)):
    student = Student(name=name, room=room, fee_status="Unpaid")
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"id": student.id, "name": student.name, "room": student.room}

@app.post("/student/pay_fees")
def pay_fees(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.fee_status = "Paid"
    db.commit()
    return {"msg": "Fees paid"}

@app.post("/student/apply_gatepass")
def apply_gatepass(student_id: int, db: Session = Depends(get_db)):
    gp = Gatepass(student_id=student_id, status="Requested", approvals="")
    db.add(gp)
    db.commit()
    db.refresh(gp)
    return {"msg": "Gatepass applied", "gatepass_id": gp.id}

# PARENT APIs
@app.post("/parent/register")
def register_parent(linked_student: int, db: Session = Depends(get_db)):
    parent = Parent(linked_student=linked_student)
    db.add(parent)
    db.commit()
    db.refresh(parent)
    return {"id": parent.id, "linked_student": parent.linked_student}

@app.post("/parent/approve_gatepass")
def approve_gatepass(gatepass_id: int, db: Session = Depends(get_db)):
    gp = db.query(Gatepass).filter(Gatepass.id == gatepass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Gatepass not found")
    gp.approvals = "Parent Approved"
    db.commit()
    return {"msg": "Gatepass approved by parent"}

# RC APIs
@app.post("/rc/validate_gatepass")
def rc_validate_gatepass(gatepass_id: int, db: Session = Depends(get_db)):
    gp = db.query(Gatepass).filter(Gatepass.id == gatepass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Gatepass not found")
    gp.status = "Approved"
    gp.approvals = (gp.approvals or "") + " -> RC Approved"
    db.commit()
    return {"msg": "Gatepass validated by RC"}

@app.post("/rc/update_attendance")
def update_attendance(student_id: int, status: str, date: str, db: Session = Depends(get_db)):
    att = Attendance(student_id=student_id, status=status, date=date)
    db.add(att)
    db.commit()
    db.refresh(att)
    return {"msg": "Attendance updated"}

# ADMIN APIs
@app.post("/admin/manage_rooms")
def manage_rooms(room: str, status: str, db: Session = Depends(get_db)):
    ra = RoomAllocation(room=room, status=status)
    db.merge(ra)
    db.commit()
    return {"msg": "Room allocation updated"}

@app.get("/admin/generate_report")
def generate_report(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    rooms = db.query(RoomAllocation).all()
    return {
        "students": [{"id": s.id, "name": s.name, "room": s.room, "fee_status": s.fee_status} for s in students],
        "rooms": [{"room": r.room, "status": r.status} for r in rooms]
    }