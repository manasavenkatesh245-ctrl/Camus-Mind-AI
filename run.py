"""
CampusMind AI Launcher
Runs the complete full-stack application (FastAPI backend + React frontend) on port 8000.
"""
import sys
import uvicorn
from pathlib import Path
from backend.database import init_db
from backend.sample_generator import generate_sample_handbook_pdf
from backend.config import SAMPLES_DIR

def main():
    print("=" * 65)
    print("  CAMPUSMIND AI - Intelligent College Knowledge Assistant")
    print("  Technology Expo Production MVP")
    print("=" * 65)

    # 1. Initialize SQLite Database
    print("[1/3] Initializing persistent database...")
    init_db()

    # 2. Ensure Sample Demo PDF is ready
    print("[2/3] Preparing official Apex College demo handbook...")
    sample_pdf = SAMPLES_DIR / "apex_student_handbook_2024.pdf"
    if not sample_pdf.exists():
        generate_sample_handbook_pdf(sample_pdf)
    print(f"      Verified: {sample_pdf.name}")

    # 3. Start web server
    print("[3/3] Starting web server on http://127.0.0.1:8000 ...")
    print("      -> Open your browser to: http://127.0.0.1:8000")
    print("      -> API documentation at: http://127.0.0.1:8000/docs")
    print("      -> Press CTRL+C to stop.")
    print("=" * 65)

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
