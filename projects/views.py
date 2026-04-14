from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from organizations.models import Organization
from organizations.permissions import IsOrgMember, IsOrgAdminOrManager
from .models import Project, Task, TaskAssignment, Comment, ActivityLog
from .serializers import (
    ProjectSerializer, TaskSerializer,
    CommentSerializer, ActivityLogSerializer
)


# ── Projects ──────────────────────────────────────────────

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        org_id = self.kwargs['org_id']
        return Project.objects.filter(organization_id=org_id)

    def perform_create(self, serializer):
        org_id = self.kwargs['org_id']
        org = get_object_or_404(Organization, id=org_id)
        serializer.save(organization=org, created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        org_id = self.kwargs['org_id']
        return Project.objects.filter(organization_id=org_id)


# ── Tasks ─────────────────────────────────────────────────

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Task.objects.filter(project_id=project_id).select_related('created_by', 'project')

    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        project = get_object_or_404(Project, id=project_id)
        task = serializer.save(project=project, created_by=self.request.user)

        # Log the activity
        ActivityLog.objects.create(
            organization=project.organization,
            user=self.request.user,
            action=f'created task "{task.title}"',
            task=task
        )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Task.objects.filter(project_id=project_id)


class TaskStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def patch(self, request, org_id, project_id, pk):
        task = get_object_or_404(Task, id=pk, project_id=project_id)
        new_status = request.data.get('status')

        if new_status not in ['todo', 'in_progress', 'done']:
            return Response(
                {'error': 'Invalid status. Choose todo, in_progress, or done.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = task.status
        task.status = new_status
        task.save()

        # Log the activity
        ActivityLog.objects.create(
            organization=task.project.organization,
            user=request.user,
            action=f'changed status of "{task.title}" from {old_status} to {new_status}',
            task=task
        )

        return Response(TaskSerializer(task).data)


# ── Comments ──────────────────────────────────────────────

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return Comment.objects.filter(task_id=task_id).select_related('author')

    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        task = get_object_or_404(Task, id=task_id)
        serializer.save(task=task, author=self.request.user)
        
class CommentDeleteView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return Comment.objects.filter(task_id=task_id)        


# ── Activity Log ──────────────────────────────────────────

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]

    def get_queryset(self):
        org_id = self.kwargs['org_id']
        return ActivityLog.objects.filter(organization_id=org_id).select_related('user', 'task')