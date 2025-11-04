import React, { useEffect, useState } from 'react'

export default function AdminDashboard({ apiBase, auth, onLogout }) {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [studentIds, setStudentIds] = useState('')
  const [error, setError] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createName, setCreateName] = useState('')
  const [createRole, setCreateRole] = useState('teacher')
  const [createPassword, setCreatePassword] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }

  useEffect(() => {
    ;(async () => {
      const [s, u] = await Promise.all([
        fetch(`${apiBase}/admin/stats`, { headers }).then(r => r.json()),
        fetch(`${apiBase}/admin/users`, { headers }).then(r => r.json()),
      ])
      setStats(s)
      setUsers(u)
    })()
  }, [])

  async function handleAssign() {
    setError('')
    try {
      const list = studentIds.split(',').map(s => s.trim()).filter(Boolean)
      const res = await fetch(`${apiBase}/admin/assign/batch`, { method: 'POST', headers, body: JSON.stringify({ teacherId, studentIds: list }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      alert(`Assigned ${data.count} links`)
    } catch (e) {
      setError(e.message)
    }
  }

  async function removeUser(id) {
    if (!confirm('Delete user?')) return
    await fetch(`${apiBase}/admin/users/${id}`, { method: 'DELETE', headers })
    setUsers(users.filter(u => u._id !== id))
  }

  async function createUser(e) {
    e.preventDefault()
    setError('')
    try {
      const body = { email: createEmail, password: createPassword, role: createRole, name: createName }
      const res = await fetch(`${apiBase}/auth/register`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      // refresh users list
      const u = await fetch(`${apiBase}/admin/users`, { headers }).then(r => r.json())
      setUsers(u)
      setCreateEmail(''); setCreateName(''); setCreatePassword(''); setCreateRole('teacher')
      alert('User created')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div>Teachers: <strong>{stats.teachers}</strong></div>
          <div>Students: <strong>{stats.students}</strong></div>
          <div>Notes: <strong>{stats.notes}</strong></div>
        </div>
      )}
      <section style={{ marginBottom: 24 }}>
        <h3>Create User</h3>
        <form onSubmit={createUser} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <label>Name</label>
          <input value={createName} onChange={e => setCreateName(e.target.value)} required />
          <label>Email</label>
          <input value={createEmail} onChange={e => setCreateEmail(e.target.value)} type="email" required />
          <label>Role</label>
          <select value={createRole} onChange={e => setCreateRole(e.target.value)}>
            <option value="teacher">teacher</option>
            <option value="student">student</option>
            <option value="admin">admin</option>
          </select>
          <label>Password</label>
          <input value={createPassword} onChange={e => setCreatePassword(e.target.value)} type="password" required />
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          <button type="submit">Create</button>
        </form>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>User Management</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th align="left">ID</th>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontFamily: 'monospace' }}>{u._id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><button onClick={() => removeUser(u._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Assign Students to Teacher</h3>
        <div style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
          <label>Teacher ID</label>
          <input value={teacherId} onChange={e => setTeacherId(e.target.value)} />
          <label>Student IDs (comma-separated)</label>
          <input value={studentIds} onChange={e => setStudentIds(e.target.value)} />
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          <button onClick={handleAssign}>Assign</button>
        </div>
      </section>
    </div>
  )
}


