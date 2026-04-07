from rest_framework.permissions import BasePermission
from .models import Membership


def get_user_role(user, organization):
    try:
        membership = Membership.objects.get(user=user, organization=organization)
        return membership.role
    except Membership.DoesNotExist:
        return None


class IsOrgMember(BasePermission):
    """Allow access only to members of the organization."""
    def has_permission(self, request, view):
        org_id = view.kwargs.get('org_id')
        return Membership.objects.filter(
            user=request.user,
            organization_id=org_id
        ).exists()


class IsOrgAdmin(BasePermission):
    """Allow access only to admins of the organization."""
    def has_permission(self, request, view):
        org_id = view.kwargs.get('org_id')
        return Membership.objects.filter(
            user=request.user,
            organization_id=org_id,
            role='admin'
        ).exists()


class IsOrgAdminOrManager(BasePermission):
    """Allow access to admins and managers only."""
    def has_permission(self, request, view):
        org_id = view.kwargs.get('org_id')
        return Membership.objects.filter(
            user=request.user,
            organization_id=org_id,
            role__in=['admin', 'manager']
        ).exists()