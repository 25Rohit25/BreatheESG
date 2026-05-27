from rest_framework import serializers
from .models import Company, DataSource, RawUpload, ProcessingJob, EmissionRecord, AuditLog

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'

class ProcessingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingJob
        fields = '__all__'

class RawUploadSerializer(serializers.ModelSerializer):
    jobs = ProcessingJobSerializer(source='processing_jobs', many=True, read_only=True)
    
    class Meta:
        model = RawUpload
        fields = '__all__'

class EmissionRecordSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    source_name = serializers.CharField(source='source.get_source_type_display', read_only=True)
    
    class Meta:
        model = EmissionRecord
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
