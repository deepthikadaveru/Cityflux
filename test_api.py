import urllib.request
import json

endpoints = [
    "http://127.0.0.1:8000/api/status",
    "http://127.0.0.1:8000/api/cameras",
    "http://127.0.0.1:8000/api/detections",
    "http://127.0.0.1:8000/api/trajectory/TS%2007%20EA%209012",
    "http://127.0.0.1:8000/api/analytics",
    "http://127.0.0.1:8000/api/alerts"
]

for ep in endpoints:
    try:
        req = urllib.request.urlopen(ep)
        status = req.getcode()
        print(f"[OK] {ep} -> HTTP {status}")
    except Exception as e:
        print(f"[FAIL] {ep} -> {e}")
