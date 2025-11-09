import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { admin, academic, auth } from '../../lib/api'
import { toast } from 'sonner'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student',
    branch_id: '', semester_id: '', section_id: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [usersData, branchesData, semestersData, sectionsData] = await Promise.all([
        admin.users.list(),
        academic.branches.list(),
        academic.semesters.list(),
        academic.sections.list()
      ])
      setUsers(usersData)
      setBranches(branchesData)
      setSemesters(semestersData)
      setSections(sectionsData)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await admin.users.update(editing._id, formData)
        toast.success('User updated')
      } else {
        await auth.register(formData)
        toast.success('User created')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', email: '', password: '', role: 'student', branch_id: '', semester_id: '', section_id: '' })
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save user')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return
    try {
      await admin.users.delete(id)
      toast.success('User deleted')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    }
  }

  function startEdit(user) {
    setEditing(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branch_id: user.branch_id?._id || user.branch_id || '',
      semester_id: user.semester_id?._id || user.semester_id || '',
      section_id: user.section_id?._id || user.section_id || ''
    })
    setShowForm(true)
  }

  const filteredSections = sections.filter(s => 
    (!formData.branch_id || s.branch_id?._id === formData.branch_id || s.branch_id === formData.branch_id) &&
    (!formData.semester_id || s.semester_id?._id === formData.semester_id || s.semester_id === formData.semester_id)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage teachers and students</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', email: '', password: '', role: 'student', branch_id: '', semester_id: '', section_id: '' }) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit User' : 'Create User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {(formData.role === 'student' || formData.role === 'teacher') && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.branch_id}
                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value, section_id: '' })}
                      >
                        <option value="">Select branch</option>
                        {branches.map(b => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.semester_id}
                        onChange={(e) => setFormData({ ...formData, semester_id: e.target.value, section_id: '' })}
                      >
                        <option value="">Select semester</option>
                        {semesters.map(s => (
                          <option key={s._id} value={s._id}>{`Sem ${s.number}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.section_id}
                        onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                        disabled={!formData.branch_id || !formData.semester_id}
                      >
                        <option value="">Select section</option>
                        {filteredSections.map(s => (
                          <option key={s._id} value={s._id}>Section {s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} user(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.name} <span className="text-sm text-muted-foreground">({user.role})</span></div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    {(user.branch_id || user.semester_id || user.section_id) && (
                      <div className="text-xs text-muted-foreground">
                        {user.branch_id?.name} - {user.semester_id ? `Sem ${user.semester_id.number}` : ''} - {user.section_id?.name}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(user)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

