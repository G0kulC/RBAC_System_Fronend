/**
 * components/Navbar.jsx
 * ----------------------
 * Top navigation bar shown on all dashboard pages.
 * Shows the current user's name, role badge, dark-mode toggle, and logout button.
 */

import { useNavigate } from 'react-router-dom'

const ROLE_COLORS = {
  admin:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  student: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'User'
  const role     = localStorage.getItem('role')     || 'unknown'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          RB
        </div>
        <span className="font-semibold text-gray-800 dark:text-white hidden sm:block">
          RBAC Student System
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Username + role badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {username}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${ROLE_COLORS[role]}`}>
            {role}
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
