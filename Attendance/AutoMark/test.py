from sklearn.neighbors import KNeighborsClassifier
import cv2
import pickle
import numpy as np
import os
import sqlite3
import time
from datetime import datetime
from win32com.client import Dispatch


# === Function to speak text ===
def speak(text):
    speaker = Dispatch(("SAPI.SpVoice"))
    speaker.Speak(text)


# === Initialize Camera ===
video = cv2.VideoCapture(0)
if not video.isOpened():
    raise RuntimeError("[ERROR] Could not open webcam.")


# === Load Face Detection Model ===
cascade_path = os.path.join("Data", "haarcascade_frontalface_default.xml")
if not os.path.exists(cascade_path):
    raise FileNotFoundError(f"[ERROR] Haar cascade not found at {cascade_path}")

facedetect = cv2.CascadeClassifier(cascade_path)


# === Load Pre-trained Data ===
with open('Data/names.pkl', 'rb') as w:
    LABELS = pickle.load(w)
with open('Data/faces_data.pkl', 'rb') as f:
    FACES = pickle.load(f)

print(f"Shape of Faces matrix --> {FACES.shape}")

# === Train KNN Classifier ===
knn = KNeighborsClassifier(n_neighbors=1)  # only one image
knn.fit(FACES, LABELS)
print("[INFO] KNN trained with 1 neighbor and loaded face data.\n")

print("Press 'Enter' to take attendance, and 'Shift' or 'Ctrl' to stop.\n")


DB_PATH = r"C:\Users\user\OneDrive\Desktop\New folder\Hostel-Management-System\hms.db"
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS Attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stu_id INTEGER,
    attendance VARCHAR(50),
    date TIMESTAMP
)
""")
conn.commit()


# === Main Loop ===
while True:
    ret, frame = video.read()
    if not ret:
        print("[WARNING] Frame not captured.")
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = facedetect.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        crop_img = frame[y:y + h, x:x + w, :]
        resized_img = cv2.resize(crop_img, (50, 50)).flatten().reshape(1, -1)

        # Predict using KNN
        output = knn.predict(resized_img)
        print("out[]",output)
        student_id = output[0]  # student username or ID

        # Time and Date
        ts = time.time()
        date_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

        # Draw Rectangle and Label
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(frame, str(student_id), (x, y - 15),
                    cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 1)

    cv2.imshow("Frame", frame)
    k = cv2.waitKey(1)

    # 🟢 Press Enter to take attendance
    if k == 13:  # Enter key
        speak("Attendance Taken.")
        cursor.execute(
            "INSERT INTO Attendance (stu_id, attendance, date) VALUES (?, ?, ?)",
            (student_id, "Present", date_str)
        )
        conn.commit()
        print(f"✅ Attendance recorded for {student_id} at {date_str}")

    if k == ord('q'):  # 'q' key
        print("🛑 Attendance recording stopped.")
        speak("Recording stopped.")
        break
# === Cleanup ===
video.release()
cv2.destroyAllWindows()
print("[INFO] SQLite connection closed.")
