# Key Engineering Decisions

## 1. Class-Based Parser Architecture
Rather than handling ingestion in a monolithic script, we implemented a layered parser architecture (`core/parsers`, `core/validators`, `core/normalizers`). This allows each data source (SAP, Utility, Travel) to have independent, isolated logic. It strictly enforces the Single Responsibility Principle.

## 2. Status Lifecycle over Boolean Flags
We chose a comprehensive status lifecycle (`PENDING`, `VALIDATED`, `FLAGGED`, `APPROVED`, `LOCKED`, `REJECTED`) rather than simple `is_approved` booleans. This mirrors real-world enterprise workflows where data must pass through multiple hands (System -> Analyst -> Auditor).

## 3. "Raw vs Normalized" Traceability View
In the frontend UI, we intentionally built a side-by-side Traceability Panel. When an analyst reviews an anomaly, they can see the exact raw JSON output from the ERP system next to our normalized ESG calculation. This is critical for defending calculations during an external audit.

## 4. Why CSV over Direct API Integration?
While API integrations (e.g., direct Concur integration) are ideal, the reality of corporate ESG is that data often lives in legacy on-premise systems (like old SAP instances) where APIs are blocked by IT security. CSV flat-file exports are the universal denominator for enterprise data.
