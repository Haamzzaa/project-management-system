from rest_framework import serializers
from .models import Project, Task, TaskAssignment, Comment, ActivityLog
from accounts.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'organization', 'created_by', 'created_at']
        read_only_fields = ['organization', 'created_by']


class TaskAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskAssignment
        fields = ['id', 'user', 'assigned_at']


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assignments = TaskAssignmentSerializer(source='taskassignment_set', many=True, read_only=True)
    assigned_to_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project',
            'status', 'priority', 'deadline',
            'created_by', 'created_at',
            'assignments', 'assigned_to_ids'
        ]
        read_only_fields = ['project', 'created_by']

    def create(self, validated_data):
        assigned_to_ids = validated_data.pop('assigned_to_ids', [])
        task = Task.objects.create(**validated_data)

        for user_id in assigned_to_ids:
            TaskAssignment.objects.create(task=task, user_id=user_id)

        return task


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'user', 'task', 'timestamp']