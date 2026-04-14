import axiosInstance from './axiosInstance'

export const getProjects = (orgId) => axiosInstance.get(`orgs/${orgId}/projects/`)
export const createProject = (orgId, data) => axiosInstance.post(`orgs/${orgId}/projects/`, data)
export const getProject = (orgId, projectId) => axiosInstance.get(`orgs/${orgId}/projects/${projectId}/`)
export const deleteProject = (orgId, projectId) => axiosInstance.delete(`orgs/${orgId}/projects/${projectId}/`)