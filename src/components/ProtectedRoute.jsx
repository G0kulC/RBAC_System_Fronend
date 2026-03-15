/**
 * components/ProtectedRoute.jsx
 * ------------------------------
 * Guards a route by checking:
 *  1. A JWT token exists in localStorage
 *  2. The stored role matches the allowedRole prop
 *
 * If either check fails the user is redirected to /login.
 */

import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRole }) {
  const token    = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to the correct dashboard based on the stored role
    const redirectMap = {
      admin:   '/admin',
      teacher: '/teacher',
      student: '/student',
    }
    return <Navigate to={redirectMap[userRole] || '/login'} replace />
  }

  return children
}
