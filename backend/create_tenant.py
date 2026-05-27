
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from core.models import Tenant
Tenant.objects.get_or_create(name='Acme Corp')

