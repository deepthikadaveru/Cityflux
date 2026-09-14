import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sih_anpr.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Cameras Table (Drop and recreate to ensure schema alignment)
    cursor.execute("DROP TABLE IF EXISTS cameras;")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        speed_limit_kmh REAL DEFAULT 80.0,
        stream_type TEXT DEFAULT 'file',
        stream_url TEXT DEFAULT '',
        resolution TEXT DEFAULT '1080p Node',
        fps TEXT DEFAULT '30 FPS',
        status TEXT DEFAULT 'ONLINE'
    );
    """)

    # 2. Detections Table (Clear existing detection spam on startup)
    cursor.execute("DROP TABLE IF EXISTS detections;")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camera_id TEXT NOT NULL,
        plate_number TEXT NOT NULL,
        confidence REAL NOT NULL,
        timestamp TEXT NOT NULL,
        speed_estimate_kmh REAL,
        vehicle_type TEXT,
        bbox_json TEXT,
        is_blacklisted INTEGER DEFAULT 0,
        FOREIGN KEY (camera_id) REFERENCES cameras (id)
    );
    """)

    # 3. Blacklist Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blacklist (
        plate_number TEXT PRIMARY KEY,
        owner_name TEXT,
        vehicle_model TEXT,
        reason TEXT,
        flagged_date TEXT
    );
    """)

    # 4. Privacy Audit Logs Table (Responsible AI & Law Enforcement Compliance)
    cursor.execute("DROP TABLE IF EXISTS audit_logs;")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        officer_id TEXT NOT NULL,
        plate_queried TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        access_reason TEXT NOT NULL,
        warrant_no TEXT
    );
    """)

    # Seed Privacy Audit Logs
    today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    audit_seed = [
        ("OFFICER-4402 (Cyberabad PS)", "TS 07 EA 9012", today_str, "Stolen Vehicle Investigation", "WAR-2026-9012"),
        ("OFFICER-1108 (Traffic Control)", "TS 09 FL 9999", today_str, "Unpaid Fines & Violation Audit", "WAR-2026-9999")
    ]
    for a in audit_seed:
        cursor.execute("INSERT INTO audit_logs (officer_id, plate_queried, timestamp, access_reason, warrant_no) VALUES (?, ?, ?, ?, ?)", a)

    # Seed initial camera nodes (Hyderabad / Ranga Reddy)
    cameras_seed = [
        ("cam_1_mgit", "CAM-01: MGIT Main Gate", "MGIT College Rd, Gandipet", 17.3850, 78.3180, 60.0, "file", "cam1.mp4", "1080p Mobile Node", "59 FPS", "ONLINE"),
        ("cam_2_gandipet", "CAM-02: Gandipet Circle", "Gandipet Junction", 17.3910, 78.3240, 60.0, "file", "cam2.mp4", "1080p Mobile Node", "59 FPS", "ONLINE"),
        ("cam_3_kokapet", "CAM-03: Kokapet SEZ Junction", "Kokapet Financial Dist Link", 17.3980, 78.3360, 70.0, "file", "cam3.mp4", "1080p Mobile Node", "59 FPS", "ONLINE"),
        ("cam_4_narsingi", "CAM-04: Narsingi Rotary", "Narsingi ORR Service Rd", 17.3800, 78.3610, 80.0, "file", "cam4.mp4", "1080p Gantry Node", "59 FPS", "ONLINE")
    ]

    for cam in cameras_seed:
        cursor.execute("INSERT OR REPLACE INTO cameras VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", cam)

    # Seed Blacklisted Vehicles (1 Stolen Target Bike + 1 Unpaid Fines Target)
    blacklist_seed = [
        ("TS 07 EA 9012", "Rajesh Kumar", "Bajaj Discover 125 (Black Motorcycle)", "Stolen Vehicle / Cyberabad Police Warrant", "2026-09-01"),
        ("TS 09 FL 9999", "Vikram Reddy", "Black Honda City", "Traffic Violation / Unpaid Fines", "2026-08-20")
    ]

    for bl in blacklist_seed:
        cursor.execute("INSERT OR REPLACE INTO blacklist VALUES (?, ?, ?, ?, ?)", bl)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("[OK] Database initialized successfully.")
