import axiosInstance from './axiosInstance'

export const getComments = (orgId, projectId, taskId) => axiosInstance.get(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/comments/`)
export const createComment = (orgId, projectId, taskId, data) => axiosInstance.post(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/comments/`, data)
export const deleteComment = (orgId, projectId, taskId, commentId) => axiosInstance.delete(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/`)