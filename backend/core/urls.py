from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SAPUploadView, EmissionRecordViewSet, DashboardStatsView, ProcessingJobViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'activities', EmissionRecordViewSet, basename='activity')
router.register(r'jobs', ProcessingJobViewSet, basename='job')
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    path('upload/sap/', SAPUploadView.as_view(), name='sap_upload'),
    # path('upload/utility/', UtilityUploadView.as_view(), name='utility_upload'),
    # path('upload/travel/', TravelUploadView.as_view(), name='travel_upload'),
    path('stats/', DashboardStatsView.as_view(), name='stats'),
    path('', include(router.urls)),
]
