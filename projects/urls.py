from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView,
    TaskListCreateView, TaskDetailView, TaskStatusUpdateView,
    CommentListCreateView, CommentDeleteView, ActivityLogListView
)

urlpatterns = [
    # Projects
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

    # Tasks
    path('<int:project_id>/tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:project_id>/tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:project_id>/tasks/<int:pk>/status/', TaskStatusUpdateView.as_view(), name='task-status'),

    # Comments
    path('<int:project_id>/tasks/<int:task_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:project_id>/tasks/<int:task_id>/comments/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
]