import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure current directory is on python path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    print("==================================================================")
    print("  SIH CITY-WIDE ANPR TRAJECTORY ENGINE BACKEND (HYDERABAD SECTOR)")
    print("==================================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
