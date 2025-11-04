import React, { useEffect, useMemo, useState } from 'react'
import Login from './components/Login.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import TeacherDashboard from './components/TeacherDashboard.jsx'
import StudentDashboard from './components/StudentDashboard.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return token && user ? { token, user: JSON.parse(user) } : null
  })

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth(null)
  }

  function handleLogin(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }

  const content = useMemo(() => {
    if (!auth) return <Login onLogin={handleLogin} apiBase={API_BASE} />
    if (auth.user.role === 'admin') return <AdminDashboard apiBase={API_BASE} auth={auth} onLogout={handleLogout} />
    if (auth.user.role === 'teacher') return <TeacherDashboard apiBase={API_BASE} auth={auth} onLogout={handleLogout} />
    if (auth.user.role === 'student') return <StudentDashboard apiBase={API_BASE} auth={auth} onLogout={handleLogout} />
    return <div style={{ padding: 16 }}>Unknown role</div>
  }, [auth])

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
        <strong>Secure Notes</strong>
        {auth && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{auth.user.name} ({auth.user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      {content}
    </div>
  )
}



