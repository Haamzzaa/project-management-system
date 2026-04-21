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
    
class IsTaskOwnerOrElevated(BasePermission):
    """
    Object-level permission for tasks.
    SAFE_METHODS (GET) pass for any org member — handled by IsOrgMember upstream.
    Writes (PATCH, PUT, DELETE) pass only if:
      - the requesting user created the task, OR
      - the requesting user is admin or manager in the task's org
    """
    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        if obj.created_by == request.user:
            return True

        org = obj.project.organization
        return Membership.objects.filter(
            user=request.user,
            organization=org,
            role__in=['admin', 'manager']
        ).exists()    