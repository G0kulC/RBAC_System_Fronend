/**
 * pages/TeacherDashboard.jsx
 * ---------------------------
 * Teacher dashboard:
 *  - Browse and search all students
 *  - Click a student to view/update their marks
 */

import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import api    from '../api/axios.js'

export default function TeacherDashboard({ darkMode, setDarkMode }) {
  const [students, setStudents]         = useState([])
  const [selected, setSelected]         = useState(null)   // currently selected student
  const [marks, setMarks]               = useState([])
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const [loading, setLoading]           = useState(false)
  const [marksLoading, setMarksLoading] = useState(false)
  const [markForm, setMarkForm]         = useState({ subject: '', marks: '' })
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const LIMIT = 8

  // ── Fetch students ──────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/teacher/students', {
        params: { search: search || undefined, skip: page * LIMIT, limit: LIMIT },
      })
      setStudents(data)
    } catch {
      setError('Failed to load students.')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // ── Fetch marks for selected student ────────────────────────────────────
  const fetchMarks = async (student) => {
    setSelected(student)
    setMarksLoading(true)
    setSuccess('')
    try {
      const { data } = await api.get(`/teacher/students/${student.id}/marks`)
      setMarks(data)
    } catch {
      setError('Failed to load marks.')
    } finally {
      setMarksLoading(false)
    }
  }

  // ── Submit mark update ──────────────────────────────────────────────────
  const handleMarkSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.put(`/teacher/students/${selected.id}/marks`, {
        subject: markForm.subject,
        marks:   parseFloat(markForm.marks),
      })
      setSuccess(`Marks updated for "${markForm.subject}"`)
      setMarkForm({ subject: '', marks: '' })
      fetchMarks(selected)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update marks.')
    }
  }

  // ── Average score helper ────────────────────────────────────────────────
  const avg = marks.length
    ? (marks.reduce((s, m) => s + m.marks, 0) / marks.length).toFixed(1)
    : '—'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Select a student to view and update marks</p>
        </div>

        {error   && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">✅ {success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Student list ───────────────────────────── */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="🔍 Search students…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading…</div>
              ) : students.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No students found</div>
              ) : students.map(s => (
                <button
                  key={s.id}
                  onClick={() => fetchMarks(s)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    selected?.id === s.id ? 'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{s.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {s.roll_number} · {s.department} · Yr {s.year}
                  </div>
                  <div className="text-xs text-blue-500 mt-0.5">{s.marks?.length || 0} subjects</div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                ← Prev
              </button>
              <span className="self-center">Page {page + 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={students.length < LIMIT}
                className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                Next →
              </button>
            </div>
          </div>

          {/* ── Right: Marks panel ───────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {!selected ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">📊</div>
                <p className="font-medium">Select a student to manage marks</p>
              </div>
            ) : (
              <>
                {/* Student info card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selected.roll_number} · {selected.department} · Year {selected.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avg}</div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                  </div>
                </div>

                {/* Existing marks table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Current Marks</h3>
                  </div>
                  {marksLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading marks…</div>
                  ) : marks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No marks recorded yet</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Subject</th>
                          <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Marks</th>
                          <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {marks.map(m => {
                          const grade = m.marks >= 90 ? 'A+' : m.marks >= 80 ? 'A' : m.marks >= 70 ? 'B' : m.marks >= 60 ? 'C' : 'D'
                          const color = m.marks >= 80 ? 'text-green-600 dark:text-green-400' : m.marks >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          return (
                            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.subject}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{m.marks} / 100</td>
                              <td className={`px-4 py-3 font-bold ${color}`}>{grade}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Add / Update mark form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-4">Add / Update Mark</h3>
                  <form onSubmit={handleMarkSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text" placeholder="Subject name" value={markForm.subject} required
                      onChange={e => setMarkForm({ ...markForm, subject: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number" min="0" max="100" placeholder="Score (0–100)" value={markForm.marks} required
                      onChange={e => setMarkForm({ ...markForm, marks: e.target.value })}
                      className="w-36 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Save
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
