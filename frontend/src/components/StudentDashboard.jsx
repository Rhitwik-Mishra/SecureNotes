import React, { useEffect, useMemo, useState } from 'react'
import SecurePDFViewer from './SecurePDFViewer.jsx'

export default function StudentDashboard({ apiBase, auth, onLogout }) {
  const [notes, setNotes] = useState([])
  const [query, setQuery] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const headers = { Authorization: `Bearer ${auth.token}` }

  async function fetchNotes(q = '') {
    const url = new URL(`${apiBase}/student/notes`)
    if (q) url.searchParams.set('q', q)
    const res = await fetch(url.toString(), { headers })
    setNotes(await res.json())
  }

  useEffect(() => { fetchNotes() }, [])

  const ts = useMemo(() => new Date().toLocaleString(), [activeNote])
  const teacherLabel = activeNote?.teacher?.email || activeNote?.teacher?.name || 'Unknown'
  const wm = `${auth.user.name} (${auth.user.email})\nShared by: ${teacherLabel}\n${ts}`

  return (
    <div style={{ padding: 16 }}>
      <h2>Student Dashboard</h2>
      <section style={{ marginBottom: 16 }}>
        <input placeholder="Search by title or subject" value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={() => fetchNotes(query)}>Search</button>
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div>
          <h3>Available Notes</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notes.map(n => {
              const isActive = activeNote?._id === n._id
              return (
                <li key={n._id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{n.title}</strong></div>
                  <div style={{ fontSize: 12, color: '#666' }}>{n.subject}</div>
                  <button style={{ marginTop: 6 }} onClick={() => setActiveNote(isActive ? null : n)}>
                    {isActive ? 'Close' : 'View'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          {activeNote ? (
            <SecurePDFViewer
              srcUrl={`${apiBase}/student/notes/${activeNote._id}/view`}
              token={auth.token}
              watermarkText={wm}
            />
          ) : (
            <div style={{ padding: 16, color: '#666' }}>Select a note to view</div>
          )}
        </div>
      </div>
    </div>
  )
}


