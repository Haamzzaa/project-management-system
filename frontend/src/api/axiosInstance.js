  import axios from 'axios'

  const BASE_URL = import.meta.env.VITE_API_BASE_URL

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
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
          // ✅ uses env variable, not hardcoded localhost
          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
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