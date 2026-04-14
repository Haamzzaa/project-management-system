import axiosInstance from './axiosInstance'

export const getOrganizations = () => axiosInstance.get('orgs/')
export const createOrganization = (data) => axiosInstance.post('orgs/', data)
export const getOrganization = (orgId) => axiosInstance.get(`orgs/${orgId}/`)
export const inviteUser = (orgId, data) => axiosInstance.post(`orgs/${orgId}/invite/`, data)
export const getMembers = (orgId) => axiosInstance.get(`orgs/${orgId}/members/`)