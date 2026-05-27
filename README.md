# Breathe ESG - Enterprise Data Ingestion Prototype

This repository contains an enterprise-grade prototype for an ESG (Environmental, Social, and Governance) data ingestion pipeline. It is designed to handle messy corporate data (like SAP exports or utility bills), normalize it, and track it through a strictly auditable, immutable ledger.

## 🏗️ System Architecture
* **Backend:** Python / Django / Django REST Framework
* **Frontend:** React / TypeScript / Vite / Tailwind CSS
* **Database:** SQLite (local)
* **Design Pattern:** ELT (Extract, Load, Transform) with asynchronous-ready staging.

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have installed on your machine:
* Python 3.10+
* Node.js 18+

### 1. Backend Setup (Django)
Open a terminal and run the following commands from the root project folder:

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (Windows)
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# (Optional) If you need to reset the database and create dummy data:
python manage.py shell < init_db.py

# Start the Django server
python manage.py runserver 8000
```
*The backend API is now running at `http://localhost:8000/`*

### 2. Frontend Setup (React)
Open a **second, separate terminal** and run the following commands:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The frontend application is now running at `http://localhost:5173/`*

---

## 🔐 Credentials & Default Data
If you ran the `init_db.py` script, the system generated a default company ("Acme Enterprise") and a superuser account for you to use in the Django Admin panel or dashboard (if authentication is enforced).

**Admin Credentials:**
* **Username:** `admin`
* **Password:** `admin`

*(You can log in to the Django admin panel at `http://localhost:8000/admin/`)*

---

## 📚 Essential Documentation Included
This project was built with strict architectural standards. Please review the included Markdown files in this directory to understand the design decisions:

1. **`DEVELOPER_GUIDE.md`**: The ultimate cheat sheet explaining the codebase, the data flow, and how the heuristic anomaly detection works.
2. **`INTERVIEW_DEFENSE_Q_AND_A.md`**: A list of 20 highly-technical questions and answers defending the architecture of this system.
3. **`CHALLENGES_FACED.md`**: A breakdown of the engineering problems encountered during this build (e.g., API routing, immutable audit trails) and how they were solved.
4. **`TRADEOFFS.md`**: An honest assessment of the tradeoffs made (like skipping machine learning in favor of heuristics) and how the system would evolve for production.
5. **`MODEL.md`**: Detailed ERD and database schema breakdown.

---
*Developed for the Breathe ESG evaluation.*
