# Challenges Faced & Engineering Solutions

When presenting a project to senior engineers or evaluators, they don't just want to see a working app—they want to know **how you solve hard problems**. 

If they ask, *"What was the hardest part of building this?"*, you can confidently present these real technical challenges and the exact architectural solutions you engineered to overcome them.

---

## 1. The Challenge of "Messy" Enterprise Data
**The Problem:** 
Early on, I realized that real corporate data is incredibly messy. SAP might output "Fuel_Qty" in Gallons, while a Utility provider might output "Usage" in Kilowatt-hours. Initially, I tried to force all this data straight into my database during the file upload, which caused the system to crash constantly when it encountered weird formats.

**How I Overcame It:** 
I completely redesigned the architecture to use the **"Extract, Load, Transform" (ELT) pattern**. 
Instead of processing data on upload, I built a `RawUpload` table to simply catch the messy CSV file safely. Then, I built an asynchronous-ready `IngestionService` that delegates the work to specific `Parsers` and `Normalizers`. This separation of concerns means if a new data format comes in, I don't break the whole app—I just write a new parser class.

---

## 2. The Requirement for "Immutable Auditability"
**The Problem:** 
In ESG (Environmental, Social, and Governance), data must be audited by external firms like PwC. If an analyst can just log in and edit an emissions number, the entire system is legally invalid. I needed a way to prove exactly where a number came from without making the database too slow or complex.

**How I Overcame It:** 
I designed the `EmissionRecord` database model to be an **Immutable Ledger**. 
It intentionally stores both the `raw_value` (exactly what was in the CSV) AND the `normalized_value` side-by-side. To prove this works to the end-user, I built the "Traceability Side Panel" in the React dashboard. When you click a row, it visually maps the raw JSON directly to the final ESG calculation. Furthermore, I added an `AuditLog` table so that if an analyst *does* modify an approved record, the system automatically logs the exact delta (Old Value → New Value).

---

## 3. Frontend Routing & Axios URL Bugs
**The Problem:** 
As the React frontend grew, I encountered a stubborn bug where API calls were failing with `404 Not Found`. My components were requesting endpoints like `api.post('/upload/sap/')`, but Axios was stripping out the `/api/` base URL and sending the request to the wrong backend server port.

**How I Overcame It:** 
Instead of going into 20 different React components and hardcoding the URL, I solved this at the infrastructure level. I wrote a **Global Request Interceptor** in `api.ts`. This middleware catches every single outgoing HTTP request from the frontend, checks if it's formatted correctly, and automatically prepends `/api/` before it hits the network. This made my React components incredibly clean and bug-free.

---

## 4. UI Performance with Large Tables
**The Problem:** 
When rendering thousands of emission rows on the Analyst Dashboard, the React DOM started to lag. Features like selecting 50 checkboxes for "Bulk Approve" or filtering by status were causing massive UI re-renders.

**How I Overcame It:** 
I stripped out the basic HTML table mapping and integrated **TanStack Table (React Table)**. By utilizing its headless UI model, I was able to move pagination, global filtering, and row-selection state out of my main component state and into the optimized TanStack engine. This allowed me to instantly filter anomalies and execute Bulk Actions (`bulk_approve` API) without freezing the browser.
