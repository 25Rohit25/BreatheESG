from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Company, DataSource, RawUpload, EmissionRecord, AuditLog, ProcessingJob
from .serializers import (
    CompanySerializer, DataSourceSerializer, RawUploadSerializer, 
    EmissionRecordSerializer, AuditLogSerializer, ProcessingJobSerializer
)
from .services.ingestion_service import IngestionService

class SAPUploadView(APIView):
    # permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
            
        company, _ = Company.objects.get_or_create(company_name="Demo Enterprise")
        data_source, _ = DataSource.objects.get_or_create(name="SAP ERP", source_type='SAP')
        
        upload = RawUpload.objects.create(
            company=company,
            data_source=data_source,
            uploaded_file=file_obj,
            uploaded_by=request.user if request.user.is_authenticated else None
        )
        
        # In production this would be celery.delay(upload.id)
        IngestionService.process_upload(upload.id)
        
        return Response({'message': 'SAP Upload initiated', 'upload_id': upload.id}, status=status.HTTP_201_CREATED)

class EmissionRecordViewSet(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = EmissionRecord.objects.all().order_by('-activity_date')
    serializer_class = EmissionRecordSerializer

    from rest_framework.decorators import action
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        ids = request.data.get('ids', [])
        records = EmissionRecord.objects.filter(id__in=ids)
        updated = records.update(review_status='APPROVED')
        # In a real system, we would also generate AuditLogs for each here
        return Response({'message': f'Approved {updated} records'})

    @action(detail=False, methods=['post'])
    def bulk_reject(self, request):
        ids = request.data.get('ids', [])
        records = EmissionRecord.objects.filter(id__in=ids)
        updated = records.update(review_status='REJECTED')
        return Response({'message': f'Rejected {updated} records'})

class DashboardStatsView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Sum, Count
        records = EmissionRecord.objects.all()
        total_count = records.count()
        flagged_count = records.filter(review_status='FLAGGED').count()
        approved_count = records.filter(review_status__in=['APPROVED', 'LOCKED']).count()
        
        # Avoid division by zero
        flagged_percent = (flagged_count / total_count * 100) if total_count > 0 else 0
        approval_ratio = (approved_count / total_count * 100) if total_count > 0 else 0

        # Group by source type (SAP, Utility, Travel)
        source_breakdown = list(records.values('source__source_type').annotate(count=Count('id')))

        stats = {
            'total_records': total_count,
            'pending_review': records.filter(review_status='PENDING').count(),
            'flagged_suspicious': flagged_count,
            'approved_locked': approved_count,
            'total_emissions_kgco2e': sum(r.calculated_emission for r in records if r.review_status != 'REJECTED'),
            'flagged_percent': round(flagged_percent, 1),
            'approval_ratio': round(approval_ratio, 1),
            'source_breakdown': source_breakdown
        }
        return Response(stats)

class ProcessingJobViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = ProcessingJob.objects.all().order_by('-started_at')
    serializer_class = ProcessingJobSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
