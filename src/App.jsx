/**
 * App.jsx
 * -------
 * Root component. Sets up React Router with all application routes.
 * Protected routes are wrapped in <ProtectedRoute> which checks the
 * JWT token and role before rendering the target page.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Login            from './pages/Login.jsx'
import Register         from './pages/Register.jsx'
import AdminDashboard   from './pages/AdminDashboard.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import ProtectedRoute   from './components/ProtectedRoute.jsx'

export default function App() {
  // Dark-mode toggle stored in localStorage
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <BrowserRouter>
      {/* Pass darkMode toggle down via context or just as a prop to layouts */}
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login    darkMode={dark} setDarkMode={setDark} />} />
        <Route path="/register" element={<Register darkMode={dark} setDarkMode={setDark} />} />

        {/* Protected: Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard darkMode={dark} setDarkMode={setDark} />
            </ProtectedRoute>
          }
        />

        {/* Protected: Teacher */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard darkMode={dark} setDarkMode={setDark} />
            </ProtectedRoute>
          }
        />

        {/* Protected: Student */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard darkMode={dark} setDarkMode={setDark} />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
