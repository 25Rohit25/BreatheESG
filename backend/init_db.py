import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from core.models import Company, DataSource, User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')

Company.objects.get_or_create(company_name='Acme Enterprise')

DataSource.objects.get_or_create(source_type='SAP', ingestion_method='CSV')
DataSource.objects.get_or_create(source_type='UTILITY', ingestion_method='CSV')
DataSource.objects.get_or_create(source_type='TRAVEL', ingestion_method='CSV')
