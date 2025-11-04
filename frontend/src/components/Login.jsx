import React, { useState } from 'react'

export default function Login({ onLogin, apiBase }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh', padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ width: 360, maxWidth: '90vw', border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
        <h2>Login</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}



