import sqlite3

conn = sqlite3.connect("hostel.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS Student (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER,
    phone TEXT,
    semester INTEGER,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT
);
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS Parent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    username TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS RC (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS Admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    password TEXT
);
""")
conn.commit()
conn.close()

print("Student table created successfully")
