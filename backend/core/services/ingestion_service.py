import pandas as pd
import json
from django.utils import timezone
from core.models import RawUpload, ProcessingJob, EmissionRecord
from core.parsers.sap_parser import SAPParser
# Note: UtilityParser and TravelParser would go here

class IngestionService:
    @staticmethod
    def process_upload(upload_id):
        upload = RawUpload.objects.get(id=upload_id)
        job = ProcessingJob.objects.create(
            upload=upload,
            processing_stage='VALIDATION',
            status='IN_PROGRESS'
        )
        
        try:
            df = pd.read_csv(upload.uploaded_file)
            if df.empty:
                raise ValueError("Uploaded file is empty.")
                
            # Replace NaN with None
            df = df.where(pd.notnull(df), None)
            
            # Select correct parser
            if upload.data_source.source_type == 'SAP':
                parser = SAPParser()
            else:
                # Fallback to SAP for prototype simplification if others aren't wired up
                parser = SAPParser()
                
            # 1. Validate
            validation_errors = parser.validator.validate(df)
            if validation_errors:
                job.status = 'ERROR'
                job.error_summary = str(validation_errors)
                job.completed_at = timezone.now()
                job.save()
                upload.processing_status = 'FAILED'
                upload.save()
                return

            job.processing_stage = 'NORMALIZATION'
            job.save()

            records_data = json.loads(df.to_json(orient='records'))
            normalized_records = []
            
            # 2. Normalize and Detect Anomalies
            for row in records_data:
                norm_dict = parser.normalizer.normalize(row)
                suspicious_flags = parser.detect_suspicious(norm_dict)
                
                status = 'FLAGGED' if suspicious_flags else 'PENDING'
                
                record = EmissionRecord(
                    company=upload.company,
                    source=upload.data_source,
                    raw_upload=upload,
                    category=norm_dict['category'],
                    scope=norm_dict['scope'],
                    activity_type=norm_dict['activity_type'],
                    activity_date=norm_dict.get('activity_date'),
                    raw_value=norm_dict['quantity'],
                    normalized_value=norm_dict['normalized_quantity'],
                    unit=norm_dict['unit'],
                    emission_factor=norm_dict['emission_factor'],
                    calculated_emission=norm_dict['calculated_emissions_kgco2e'],
                    review_status=status,
                    suspicious_flag=suspicious_flags
                )
                normalized_records.append(record)

            # Bulk save
            EmissionRecord.objects.bulk_create(normalized_records)

            job.processing_stage = 'COMPLETED'
            job.status = 'SUCCESS'
            job.completed_at = timezone.now()
            job.save()
            
            upload.processing_status = 'COMPLETED'
            upload.save()

        except Exception as e:
            job.status = 'ERROR'
            job.error_summary = str(e)
            job.completed_at = timezone.now()
            job.save()
            upload.processing_status = 'FAILED'
            upload.save()
