from rest_framework import serializers
from .models import Organization, Membership
from accounts.serializers import UserSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Organization
        fields = ['id', 'name', 'description', 'created_by', 'created_at']


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'user', 'role', 'joined_at']


class InviteUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    # Reference the model choices directly — stays in sync automatically
    role = serializers.ChoiceField(
        choices=Membership.Role.choices,
        default=Membership.Role.MEMBER
    )