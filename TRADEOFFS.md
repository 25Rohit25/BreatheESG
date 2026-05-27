# System Tradeoffs & Future Enhancements

To deliver this prototype within the required timeframe, several intentional tradeoffs were made.

## 1. Missing True Async Processing (Celery/Redis)
**Current State**: The `ProcessingJob` model tracks the pipeline stages, but the actual execution runs synchronously in the Django request-response cycle.
**Enterprise Integration**: We would offload the `IngestionService.process_upload(upload_id)` call to a Celery worker backed by Redis or RabbitMQ to prevent HTTP timeouts on massive files.

## 2. Hardcoded Emission Factors
**Current State**: Emission factors are embedded within the Normalizer classes.
**Enterprise Integration**: We would integrate a dynamic third-party calculation engine (e.g., Climatiq or EPA API) or build an internal, version-controlled `EmissionFactor` database model to handle regional grids and yearly updates (e.g., DEFRA 2023 vs 2024).

## 3. Heuristic Anomaly Detection vs Machine Learning
**Current State**: The system uses domain-aware heuristics (e.g., "flight distance > 20,000km", "negative electricity").
**Enterprise Integration**: We would train an Isolation Forest or Autoencoder model on historical tenant data to identify statistically significant outliers tailored to that specific company's baseline usage.

## 4. No PDF OCR Pipelines
**Current State**: Utility data relies on CSV exports.
**Enterprise Integration**: Many utilities only provide PDF invoices. In production, we would integrate AWS Textract or an LLM-based extraction pipeline to parse PDFs directly. We intentionally excluded this to avoid unjustified architectural complexity.
