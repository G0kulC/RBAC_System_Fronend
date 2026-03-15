/**
 * pages/StudentDashboard.jsx
 * ---------------------------
 * Student's personal dashboard showing:
 *  - Profile card (name, roll number, dept, year)
 *  - Marks table with grade calculation
 *  - Visual progress bars per subject
 */

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import api    from '../api/axios.js'

function GradeBar({ subject, marks }) {
  const pct   = Math.min(marks, 100)
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D'
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{pct}/100</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            pct >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
            pct >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
          }`}>{grade}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function StudentDashboard({ darkMode, setDarkMode }) {
  const [profile, setProfile] = useState(null)
  const [marks, setMarks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, marksRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/marks'),
        ])
        setProfile(profileRes.data)
        setMarks(marksRes.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load your data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Computed stats
  const avg = marks.length
    ? (marks.reduce((s, m) => s + m.marks, 0) / marks.length).toFixed(1)
    : null
  const highest = marks.length ? Math.max(...marks.map(m => m.marks)) : null
  const lowest  = marks.length ? Math.min(...marks.map(m => m.marks)) : null
  const passed  = marks.filter(m => m.marks >= 50).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View your academic profile and marks</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">⚠️ {error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3 animate-bounce">📚</div>
            <p>Loading your data…</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Profile card ───────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{profile.name[0]}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.department}</p>
                <div className="mt-4 space-y-2 text-sm text-left">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Roll Number</span>
                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{profile.roll_number}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Department</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{profile.department}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500 dark:text-gray-400">Year</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Year {profile.year}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {marks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Average',  value: avg,     color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Highest',  value: highest, color: 'text-green-600 dark:text-green-400' },
                      { label: 'Lowest',   value: lowest,  color: 'text-red-500 dark:text-red-400' },
                      { label: 'Passed',   value: `${passed}/${marks.length}`, color: 'text-purple-600 dark:text-purple-400' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Marks ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Progress bars */}
              {marks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-5">Subject Performance</h3>
                  {marks.map(m => <GradeBar key={m.id} subject={m.subject} marks={m.marks} />)}
                </div>
              )}

              {/* Marks table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Detailed Marks</h3>
                  <span className="text-xs text-gray-500">{marks.length} subject{marks.length !== 1 ? 's' : ''}</span>
                </div>

                {marks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No marks recorded yet. Check back after your exams.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {['#', 'Subject', 'Marks', 'Grade', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {marks.map((m, i) => {
                        const grade  = m.marks >= 90 ? 'A+' : m.marks >= 80 ? 'A' : m.marks >= 70 ? 'B' : m.marks >= 60 ? 'C' : 'D'
                        const passed = m.marks >= 50
                        return (
                          <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.subject}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{m.marks} / 100</td>
                            <td className="px-4 py-3">
                              <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                                m.marks >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                m.marks >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                              }`}>{grade}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                passed ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                       : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                              }`}>
                                {passed ? '✓ Pass' : '✗ Fail'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {/* Footer with average */}
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Average</td>
                        <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{avg} / 100</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
