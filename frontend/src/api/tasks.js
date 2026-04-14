import axiosInstance from './axiosInstance'

export const getTasks = (orgId, projectId) => axiosInstance.get(`orgs/${orgId}/projects/${projectId}/tasks/`)
export const createTask = (orgId, projectId, data) => axiosInstance.post(`orgs/${orgId}/projects/${projectId}/tasks/`, data)
export const updateTask = (orgId, projectId, taskId, data) => axiosInstance.patch(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/`, data)
export const deleteTask = (orgId, projectId, taskId) => axiosInstance.delete(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/`)
export const updateTaskStatus = (orgId, projectId, taskId, data) => axiosInstance.patch(`orgs/${orgId}/projects/${projectId}/tasks/${taskId}/status/`, data)