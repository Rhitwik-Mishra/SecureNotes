import React, { useEffect, useState } from 'react'

export default function TeacherDashboard({ apiBase, auth, onLogout }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState([])
  const headers = { Authorization: `Bearer ${auth.token}` }

  async function fetchNotes() {
    const res = await fetch(`${apiBase}/teacher/notes`, { headers })
    setNotes(await res.json())
  }

  useEffect(() => { fetchNotes() }, [])

  async function uploadNote(e) {
    e.preventDefault()
    const form = new FormData()
    form.append('title', title)
    form.append('subject', subject)
    form.append('description', description)
    if (file) form.append('file', file)
    const res = await fetch(`${apiBase}/teacher/notes`, { method: 'POST', headers, body: form })
    const data = await res.json()
    if (!res.ok) return alert(data.error || 'Upload failed')
    setTitle(''); setSubject(''); setDescription(''); setFile(null)
    await fetchNotes()
  }

  async function deleteNote(id) {
    if (!confirm('Delete note?')) return
    await fetch(`${apiBase}/teacher/notes/${id}`, { method: 'DELETE', headers })
    await fetchNotes()
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Teacher Dashboard</h2>
      <section style={{ marginBottom: 24 }}>
        <h3>Upload PDF</h3>
        <form onSubmit={uploadNote} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
          <label>Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} required />
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
          <label>PDF File</label>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} required />
          <button type="submit">Upload</button>
        </form>
      </section>
      <section>
        <h3>Your Notes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr><th align="left">Title</th><th align="left">Subject</th><th align="left">Uploaded</th><th></th></tr></thead>
            <tbody>
              {notes.map(n => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td>{n.subject}</td>
                  <td>{new Date(n.uploaded_at).toLocaleString()}</td>
                  <td><button onClick={() => deleteNote(n._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}



