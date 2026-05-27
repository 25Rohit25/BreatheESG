# Enterprise Data Model Architecture

The database architecture for the Breathe ESG platform was designed with strict auditability, multi-tenancy, and data integrity as its core principles.

> **"The architecture intentionally separates raw ingestion from normalized records to preserve source-of-truth integrity and support future schema evolution."**

## Core Entities

### 1. `Company` (Multi-Tenancy)
Provides logical separation of data across different corporate clients. Every upload and emission record is strictly tied to a `Company`.

### 2. `RawUpload` & `ProcessingJob`
ESG data ingestion is often a slow, batch-oriented process.
- **`RawUpload`**: Immutably stores the original file export from the client's enterprise system (SAP, Utility Provider, Concur).
- **`ProcessingJob`**: Tracks the asynchronous processing pipeline (`VALIDATION`, `NORMALIZATION`, `ANOMALY_DETECTION`) allowing the system to scale horizontally and providing observability into ingestion failures.

### 3. `ColumnMapping`
Enterprise systems rarely have consistent schemas. This table allows the system to map arbitrary raw columns (e.g., `Fuel Qty`, `Fuel_L`, `Menge`) to standard system fields dynamically without altering code.

### 4. `EmissionRecord`
The unified, normalized ESG ledger. Data from disparate sources is converted into standard units (e.g., liters, kWh) and categorized into GHGP Scopes. 
- Implements a strict status lifecycle: `PENDING` -> `FLAGGED` -> `VALIDATED` -> `APPROVED` -> `LOCKED`.

### 5. `AuditLog`
Once an `EmissionRecord` reaches `APPROVED` or `LOCKED`, it cannot be mutated. Any required edits trigger a cloned record, with the delta (`old_value` -> `new_value`) captured immutably in the `AuditLog`.
