from django.contrib import admin
from django.urls import path, include
from projects.views import ActivityLogListView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/orgs/', include('organizations.urls')),
    path('api/orgs/<int:org_id>/projects/', include('projects.urls')),
    path('api/orgs/<int:org_id>/activity/', ActivityLogListView.as_view(), name='activity-log'),
]