# config.py
import os

ENV = "PROD"   # change to "LOCAL" if testing locally

LOCAL_API = "http://localhost:8000"
PROD_API = "http://13.126.94.138:8000"

BASE_API = PROD_API if ENV == "PROD" else LOCAL_API
DB_PATH = os.path.join(os.path.dirname(__file__), "hms.db")
