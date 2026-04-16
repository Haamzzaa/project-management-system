import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// If access token expires, try to refresh it automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
          refresh: refreshToken,
        })
        const newAccess = res.data.access
        localStorage.setItem('access_token', newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return axiosInstance(originalRequest)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance