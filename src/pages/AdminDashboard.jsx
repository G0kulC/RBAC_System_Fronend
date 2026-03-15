/**
 * pages/AdminDashboard.jsx
 * -------------------------
 * Full admin control panel with tabs:
 *  - Students : list, search, add, edit, delete
 *  - Users    : list and delete user accounts
 *
 * All API calls go to admin-only endpoints and require the JWT Bearer token.
 */

import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import api    from '../api/axios.js'

// ─── Small reusable components ─────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminDashboard({ darkMode, setDarkMode }) {
  const [tab, setTab]             = useState('students')
  const [students, setStudents]   = useState([])
  const [users, setUsers]         = useState([])
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(0)
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [newStudent, setNewStudent]   = useState({ name: '', roll_number: '', department: '', year: 1, email: '', password: '' })
  const LIMIT = 8

  // ── Fetch students ──────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/students', {
        params: { search: search || undefined, skip: page * LIMIT, limit: LIMIT },
      })
      setStudents(data)
      if (data.length === LIMIT) setTotal((page + 1) * LIMIT + 1)
      else setTotal(page * LIMIT + data.length)
    } catch {
      setError('Failed to load students.')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // ── Fetch users ─────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (tab !== 'users') return
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch {
      setError('Failed to load users.')
    }
  }, [tab])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Add student ─────────────────────────────────────────────────────────
  const handleAddStudent = async () => {
    try {
      await api.post('/students', {
        name: newStudent.name,
        roll_number: newStudent.roll_number,
        department: newStudent.department,
        year: parseInt(newStudent.year),
        email: newStudent.email,
        password: newStudent.password,
      })
      setShowAdd(false)
      setNewStudent({ name: '', roll_number: '', department: '', year: 1, email: '', password: '' })
      fetchStudents()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add student')
    }
  }

  // ── Update student ──────────────────────────────────────────────────────
  const handleUpdateStudent = async () => {
    try {
      await api.put(`/students/${editStudent.id}`, {
        name:       editStudent.name,
        department: editStudent.department,
        year:       parseInt(editStudent.year),
      })
      setEditStudent(null)
      fetchStudents()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update student')
    }
  }

  // ── Delete student ──────────────────────────────────────────────────────
  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student and all their marks?')) return
    try {
      await api.delete(`/students/${id}`)
      fetchStudents()
    } catch {
      alert('Delete failed.')
    }
  }

  // ── Delete user ─────────────────────────────────────────────────────────
  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user account?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed.')
    }
  }

  // ── Compute stats ────────────────────────────────────────────────────────
  const adminCount   = users.filter(u => u.role === 'admin').length
  const teacherCount = users.filter(u => u.role === 'teacher').length
  const studentCount = users.filter(u => u.role === 'student').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage students, marks, and user accounts</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={students.length} icon="🎓" color="border-indigo-500" />
          <StatCard label="Admins"          value={adminCount}     icon="👑" color="border-red-500" />
          <StatCard label="Teachers"        value={teacherCount}   icon="📚" color="border-blue-500" />
          <StatCard label="Student Users"   value={studentCount}   icon="👤" color="border-green-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
          {['students', 'users'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'students' ? '🎓 Students' : '👥 Users'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

        {/* ── Students Tab ─────────────────────────────────── */}
        {tab === 'students' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <input
                type="text"
                placeholder="🔍 Search by name or roll number…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                + Add Student
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <tr>
                    {['#', 'Name', 'Roll No.', 'Department', 'Year', 'Marks', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No students found</td></tr>
                  ) : students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{page * LIMIT + i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">{s.roll_number}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.department}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">Year {s.year}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                          {s.marks?.length || 0} subject{s.marks?.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditStudent({ ...s })}
                            className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={students.length < LIMIT}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab ────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white">All Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <tr>
                    {['ID', 'Username', 'Email', 'Role', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-500">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.username}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                          u.role === 'admin'   ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                          u.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                                 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Student Modal ──────────────────────────────── */}
      {showAdd && (
        <Modal title="Add New Student" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Arjun Kumar' },
              { label: 'Roll Number', key: 'roll_number', type: 'text', placeholder: 'e.g. CS2021001' },
              { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. Computer Science' },
              { label: 'Year', key: 'year', type: 'number', placeholder: '1–4' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'e.g. arjun@college.edu' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Login password for student' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input
                  type={f.type} value={newStudent[f.key]} placeholder={f.placeholder}
                  onChange={e => setNewStudent({ ...newStudent, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleAddStudent} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Add Student</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Student Modal ─────────────────────────────── */}
      {editStudent && (
        <Modal title="Edit Student" onClose={() => setEditStudent(null)}>
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Department', key: 'department', type: 'text' },
              { label: 'Year', key: 'year', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input
                  type={f.type} value={editStudent[f.key]}
                  onChange={e => setEditStudent({ ...editStudent, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditStudent(null)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleUpdateStudent} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Save Changes</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
