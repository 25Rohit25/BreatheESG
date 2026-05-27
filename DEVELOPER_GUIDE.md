# Breathe ESG - Developer & Codebase Guide

This document is your ultimate cheat sheet for understanding exactly how the code works, from the moment a user clicks "Upload" to the moment the data is locked in the database. Read this carefully to prepare for your defense or interview!

---

## 1. The High-Level Flow
Think of this application in three main layers:
1. **Frontend (React/Vite)**: The user interface where analysts upload files and review data.
2. **Backend API (Django REST Framework)**: The "bouncers" at the door. They receive the data from React and route it.
3. **Core Services (Python Classes)**: The actual "brain" of the app. This is where parsing, normalizing, and anomaly detection happens.

> [!TIP]
> **Interview Talking Point:** "I deliberately separated the API views from the business logic. My Django views only handle HTTP requests, while my `IngestionService` and `Parsers` handle the actual data science. This makes the code highly testable."

---

## 2. Directory Structure Explained
Here is what every folder actually does:

### Backend (`backend/core/`)
- `models.py`: Defines the database tables (Schema).
- `views.py`: The HTTP endpoints (e.g., `POST /api/upload/sap/`).
- `serializers.py`: Translates Python database objects into JSON for React.
- `services/ingestion_service.py`: The orchestrator. It takes a raw file, creates a job, and passes data to the parser.
- `parsers/sap_parser.py`: Reads the raw SAP file line by line.
- `validators/sap.py`: Checks if the data is completely broken (e.g., missing required columns like 'Quantity').
- `normalizers/sap.py`: Converts raw data into clean data (e.g., changing 'GAL' to 'Liters', multiplying by emission factors).

### Frontend (`frontend/src/`)
- `api.ts`: Our central Axios client that talks to the Django backend.
- `App.tsx`: The main router. It determines which page to show based on the URL.
- `pages/UploadPage.tsx`: Handles the CSV file upload.
- `pages/AnalystDashboard.tsx`: The main data table, metrics dashboard, and side-panel trace.

---

## 3. The "Small Details" (How Things Actually Work)

### Detail A: How does the "Upload" actually work?
1. In `UploadPage.tsx`, you attach a `.csv` file. React uses `FormData` to package it.
2. `api.post('/upload/sap/', formData)` sends it to Django.
3. In `views.py` (`SAPUploadView`), Django receives it and saves it directly to the `RawUpload` table so we never lose the original file.
4. Django then calls `IngestionService.process_upload()`.

### Detail B: How does Anomaly Detection work?
In `parsers/sap_parser.py`, we have a function called `detect_suspicious(row, normalized_data)`.
It looks at the data using **Heuristics (Rules)**:
- *Rule 1*: Is the quantity negative? If yes, append "Negative quantity detected."
- *Rule 2*: Is the quantity massively huge (e.g., > 50,000)? If yes, append "Unusually large quantity."
If any rules are broken, it forces the `review_status` to `'FLAGGED'` instead of `'PENDING'`.

### Detail C: How does the Side Panel "Traceability" work?
In `AnalystDashboard.tsx`, when you click a row, we set `selectedRecord`.
The frontend simply displays `selectedRecord.raw_value` (the original messy data) next to `selectedRecord.normalized_value` (the clean data). Because we saved both the messy and clean data in the `EmissionRecord` database row, we can easily display them side-by-side to prove to auditors exactly what our system changed.

### Detail D: How does the Bulk Approve work?
1. You select checkboxes on the React table. React stores the IDs in an array `[12, 15, 19]`.
2. You click "Bulk Approve". React calls `api.post('/activities/bulk_approve/', { ids: [12, 15, 19] })`.
3. In `views.py`, Django uses `EmissionRecord.objects.filter(id__in=ids).update(review_status='APPROVED')`.
> [!IMPORTANT]
> This is highly optimized! Instead of running 3 separate SQL UPDATE queries, Django runs a single bulk SQL query (`UPDATE emissionrecord SET status = 'APPROVED' WHERE id IN (12, 15, 19)`), which is how real enterprise systems handle scale!

---

## 4. The Database Schema (The Crown Jewel)
If they ask you about the database, focus on these three tables:
1. **`ProcessingJob`**: Tracks the status of the file ingestion (`STARTED`, `VALIDATING`, `SUCCESS`).
2. **`EmissionRecord`**: The central ledger. It holds `raw_value` AND `calculated_emission`.
3. **`AuditLog`**: An immutable table. Every time someone edits an `EmissionRecord`, a trigger/signal creates a new row here showing `old_value` and `new_value`.

## 5. Potential Interview Questions & Answers

**Q: Why didn't you use Machine Learning for Anomaly Detection?**
*A: "For a prototype, domain-based heuristics (like checking for negative numbers or physical limits) are much more deterministic and easier to audit. In a phase 2, I would replace the heuristics in the parser with an Isolation Forest algorithm trained on historical tenant data."*

**Q: Why did you separate normalizers and validators?**
*A: "Separation of concerns. Validators only ask 'Is this data safe to read?' Normalizers ask 'How do I convert this data into standard business units?' Separating them means if an SAP format changes, I only rewrite the validator, not the entire math logic."*

**Q: How does this handle scale if 10 million rows are uploaded?**
*A: "Currently, it runs synchronously. To make it production-ready, I built the `ProcessingJob` table precisely so we could offload the `process_upload` function to a background Celery worker using Redis. The user would just see the job 'Running' on the UI."*
