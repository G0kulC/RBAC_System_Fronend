/**
 * api/axios.js
 * ------------
 * Configures a shared Axios instance used by every page.
 *
 * Features:
 *  - Base URL points to the FastAPI backend
 *  - Request interceptor automatically attaches the JWT Bearer token
 *    from localStorage so every authenticated request is authorised
 *  - Response interceptor catches 401 responses and redirects to /login
 */

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',   // FastAPI backend URL
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Request interceptor ─────────────────────────────────────────────────────
// Attaches the stored JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ────────────────────────────────────────────────────
// On 401, clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
