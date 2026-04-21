from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.models import User
from .models import Organization, Membership
from .serializers import OrganizationSerializer, MembershipSerializer, InviteUserSerializer
from .permissions import IsOrgAdmin, IsOrgMember


class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return orgs the logged-in user belongs to
        return Organization.objects.filter(memberships__user=self.request.user)

    def perform_create(self, serializer):
        # Save the org and automatically make the creator an Admin
        org = serializer.save(created_by=self.request.user)
        Membership.objects.create(
            user=self.request.user,
            organization=org,
            role=Membership.Role.ADMIN
        )


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        return Organization.objects.filter(memberships__user=self.request.user)


class InviteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        serializer = InviteUserSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']

            user = get_object_or_404(User, email=email)

            # Check if already a member
            if Membership.objects.filter(user=user, organization=org).exists():
                return Response(
                    {'error': 'User is already a member of this organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Membership.objects.create(user=user, organization=org, role=role)
            return Response(
                {'message': f'{email} added as {role}.'},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MemberListView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        org_id = self.kwargs['org_id']
        return Membership.objects.filter(organization_id=org_id)
    
class RemoveMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def delete(self, request, org_id, user_id):
        org = get_object_or_404(Organization, id=org_id)

        # Guard 1: Can't remove yourself
        if request.user.id == user_id:
            return Response(
                {'error': 'You cannot remove yourself from the organization.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guard 2: Can't remove the last admin
        target_membership = get_object_or_404(Membership, organization=org, user_id=user_id)
        if target_membership.role == Membership.Role.ADMIN:
            admin_count = Membership.objects.filter(
                organization=org,
                role=Membership.Role.ADMIN
            ).count()
            if admin_count <= 1:
                return Response(
                    {'error': 'Cannot remove the last admin of the organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        target_membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── NEW: Update a member's role ───────────────────────────

class UpdateMemberRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def patch(self, request, org_id, user_id):
        org = get_object_or_404(Organization, id=org_id)

        # Guard: Can't demote yourself
        if request.user.id == user_id:
            return Response(
                {'error': 'You cannot change your own role.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_role = request.data.get('role')
        if new_role not in [choice[0] for choice in Membership.Role.choices]:
            return Response(
                {'error': f'Invalid role. Choose from: admin, manager, member.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guard: Can't demote the last admin
        target_membership = get_object_or_404(Membership, organization=org, user_id=user_id)
        if target_membership.role == Membership.Role.ADMIN and new_role != Membership.Role.ADMIN:
            admin_count = Membership.objects.filter(
                organization=org,
                role=Membership.Role.ADMIN
            ).count()
            if admin_count <= 1:
                return Response(
                    {'error': 'Cannot demote the last admin of the organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        target_membership.role = new_role
        target_membership.save()
        return Response(MembershipSerializer(target_membership).data)    