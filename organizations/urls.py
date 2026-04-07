from django.urls import path
from .views import OrganizationListCreateView, OrganizationDetailView, InviteUserView, MemberListView

urlpatterns = [
    path('', OrganizationListCreateView.as_view(), name='org-list-create'),
    path('<int:pk>/', OrganizationDetailView.as_view(), name='org-detail'),
    path('<int:org_id>/invite/', InviteUserView.as_view(), name='org-invite'),
    path('<int:org_id>/members/', MemberListView.as_view(), name='org-members'),
]