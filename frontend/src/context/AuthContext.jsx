import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // restore user session on page load
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/user/')
        setUser(res.data)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    fetchUser()
  }, [])

  const login = async (email, password) => {
  setLoading(true)
  setError(null)
  try {
    const res = await axiosInstance.post('/api/auth/login/', { email, password })
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    // fetch real user data instead of just storing email
    const userRes = await axiosInstance.get('/api/auth/user/')
    setUser(userRes.data)
    return true
  } catch (err) {
    setError('Invalid credentials. Please try again.')
    return false
  } finally {
    setLoading(false)
  }
}

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)