import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from simple_history.models import HistoricalRecords

class User(AbstractUser):
    # Enterprise-ready custom user model
    pass

class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255, unique=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

class DataSource(models.Model):
    SOURCE_TYPES = [
        ('SAP', 'SAP Fuel Export'),
        ('UTILITY', 'Utility Portal'),
        ('TRAVEL', 'Corporate Travel API/CSV'),
    ]
    INGESTION_METHODS = [
        ('CSV', 'CSV Upload'),
        ('API', 'API Integration'),
        ('JSON', 'JSON Upload')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    ingestion_method = models.CharField(max_length=50, choices=INGESTION_METHODS)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_source_type_display()} ({self.get_ingestion_method_display()})"

class ColumnMapping(models.Model):
    """
    Allows flexible source mapping for inconsistent raw columns.
    E.g., mapping 'Fuel Qty', 'Fuel_L', and 'Menge' all to 'quantity'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_type = models.CharField(max_length=50, choices=DataSource.SOURCE_TYPES)
    raw_column = models.CharField(max_length=255)
    mapped_field = models.CharField(max_length=255)

    class Meta:
        unique_together = ('source_type', 'raw_column')

    def __str__(self):
        return f"{self.source_type}: {self.raw_column} -> {self.mapped_field}"

class RawUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='raw_uploads')
    data_source = models.ForeignKey(DataSource, on_delete=models.SET_NULL, null=True)
    uploaded_file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_time = models.DateTimeField(auto_now_add=True)
    
    # High-level status
    STATUS_CHOICES = [
        ('RECEIVED', 'Received'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ]
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RECEIVED')

    def __str__(self):
        return f"Upload {self.id} - {self.processing_status}"

class ProcessingJob(models.Model):
    """
    Tracks the async processing pipeline stages.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    upload = models.ForeignKey(RawUpload, on_delete=models.CASCADE, related_name='processing_jobs')
    processing_stage = models.CharField(max_length=50) # e.g., 'VALIDATION', 'NORMALIZATION', 'ANOMALY_DETECTION'
    status = models.CharField(max_length=20) # e.g., 'IN_PROGRESS', 'SUCCESS', 'ERROR'
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_summary = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Job {self.id} ({self.processing_stage}) - {self.status}"

class EmissionRecord(models.Model):
    """
    The main normalized, auditable ESG table.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('VALIDATED', 'Validated (System)'),
        ('FLAGGED', 'Flagged for Suspicion'),
        ('APPROVED', 'Approved'),
        ('LOCKED', 'Locked (Immutable)'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='emission_records')
    source = models.ForeignKey(DataSource, on_delete=models.SET_NULL, null=True)
    raw_upload = models.ForeignKey(RawUpload, on_delete=models.CASCADE, related_name='emission_records')
    
    # ESG Dimensions
    category = models.CharField(max_length=100) # e.g. 'Stationary Combustion'
    scope = models.CharField(max_length=10) # e.g. '1', '2', '3'
    activity_type = models.CharField(max_length=100) # e.g. 'Diesel Fuel'
    activity_date = models.DateField(null=True, blank=True)
    
    # Metrics
    raw_value = models.DecimalField(max_digits=19, decimal_places=4, null=True, blank=True)
    normalized_value = models.DecimalField(max_digits=19, decimal_places=4)
    unit = models.CharField(max_length=20) # 'L', 'kWh', 'km'
    
    # Calculations
    emission_factor = models.DecimalField(max_digits=10, decimal_places=6)
    calculated_emission = models.DecimalField(max_digits=19, decimal_places=4) # kgCO2e
    
    # Workflow
    review_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    suspicious_flag = models.TextField(null=True, blank=True) # E.g., 'unusually high fuel spikes'

    # Simple history for basic row tracking, but we also use a custom AuditLog for explicit UI presentation
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.activity_type} - {self.normalized_value} {self.unit} ({self.review_status})"

class AuditLog(models.Model):
    """
    Custom audit trail. Especially important for immutable lock cloning.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.ForeignKey(EmissionRecord, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    action_type = models.CharField(max_length=50) # 'CREATED', 'EDITED', 'APPROVED', 'LOCKED'

    def __str__(self):
        return f"Audit {self.action_type} for Record {self.record_id} at {self.timestamp}"
