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