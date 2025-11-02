
import cv2
import pickle
import numpy as np
import os

# === Setup Paths ===
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "Data")
os.makedirs(DATA_DIR, exist_ok=True)

# Haar Cascade Path
CASCADE_PATH = os.path.join(DATA_DIR, "haarcascade_frontalface_default.xml")
if not os.path.exists(CASCADE_PATH):
    raise FileNotFoundError(f"[ERROR] Haar cascade not found at: {CASCADE_PATH}")

# Load face detector
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
if face_cascade.empty():
    raise RuntimeError("[ERROR] Failed to load Haar cascade. The file may be corrupted.")


def process_face(image_path: str, student_id: str, min_faces: int = 1):
    """
    Processes a single uploaded image to extract and save face embeddings.
    
    - Detects faces using OpenCV Haar cascade.
    - Resizes them to 50x50 pixels.
    - Saves faces to faces_data.pkl and names to names.pkl under /Data/.
    
    Returns number of faces processed.
    """
    print(f"\n[PROCESS_FACE] Starting for student_id={student_id}")
    print(f"[PROCESS_FACE] Reading image from {image_path}")

    # === Read Image ===
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"[ERROR] Could not read image from: {image_path}")

    # === Detect Faces ===
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    print(f"[PROCESS_FACE] Detected {len(faces)} face(s)")

    if len(faces) < min_faces:
        raise ValueError(f"[ERROR] No faces detected in image: {image_path}")

    # === Crop & Resize Faces ===
    faces_list = []
    for (x, y, w, h) in faces:
        crop_img = img[y:y + h, x:x + w, :]
        resized_img = cv2.resize(crop_img, (50, 50))
        faces_list.append(resized_img)

    faces_arr = np.asarray(faces_list).reshape(len(faces_list), -1)

    # === Save/Update names.pkl ===
    names_path = os.path.join(DATA_DIR, "names.pkl")
    if not os.path.exists(names_path):
        names = [student_id] * len(faces_arr)
        print("[PROCESS_FACE] Created new names.pkl")
    else:
        with open(names_path, "rb") as f:
            names = pickle.load(f)
        names.extend([student_id] * len(faces_arr))
        print("[PROCESS_FACE] Appended to existing names.pkl")

    with open(names_path, "wb") as f:
        pickle.dump(names, f)

    # === Save/Update faces_data.pkl ===
    faces_path = os.path.join(DATA_DIR, "faces_data.pkl")
    if not os.path.exists(faces_path):
        with open(faces_path, "wb") as f:
            pickle.dump(faces_arr, f)
        print("[PROCESS_FACE] Created new faces_data.pkl")
    else:
        with open(faces_path, "rb") as f:
            existing_faces = pickle.load(f)
        updated = np.append(existing_faces, faces_arr, axis=0)
        with open(faces_path, "wb") as f:
            pickle.dump(updated, f)
        print("[PROCESS_FACE] Appended to existing faces_data.pkl")

    print(f"[PROCESS_FACE] Completed for {student_id} — Saved {len(faces_arr)} face(s) to {DATA_DIR}\n")

    return len(faces_arr)
