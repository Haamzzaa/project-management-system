import axiosInstance from './axiosInstance'

export const getOrganizations = () => axiosInstance.get('api/orgs/')
export const createOrganization = (data) => axiosInstance.post('api/orgs/', data)
export const getOrganization = (orgId) => axiosInstance.get(`api/orgs/${orgId}/`)
export const inviteUser = (orgId, data) => axiosInstance.post(`api/orgs/${orgId}/invite/`, data)
export const getMembers = (orgId) => axiosInstance.get(`api/orgs/${orgId}/members/`)