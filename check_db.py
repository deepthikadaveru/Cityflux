import sqlite3
import os

db_path = os.path.join("backend", "sih_anpr.db")
print("DB Path:", os.path.abspath(db_path))
print("DB Exists:", os.path.exists(db_path))

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM detections")
    count = cursor.fetchone()[0]
    print("Detections Count:", count)
    cursor.execute("SELECT * FROM detections LIMIT 5")
    print("Sample Detections:", cursor.fetchall())
    conn.close()
