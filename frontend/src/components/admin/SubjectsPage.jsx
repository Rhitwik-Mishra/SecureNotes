import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { academic } from '../../lib/api'
import { toast } from 'sonner'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '', branch_id: '', semester_id: '', description: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [subjectsData, branchesData, semestersData] = await Promise.all([
        academic.subjects.list(),
        academic.branches.list(),
        academic.semesters.list()
      ])
      setSubjects(subjectsData)
      setBranches(branchesData)
      setSemesters(semestersData)
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
        await academic.subjects.update(editing._id, formData)
        toast.success('Subject updated')
      } else {
        await academic.subjects.create(formData)
        toast.success('Subject created')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', code: '', branch_id: '', semester_id: '', description: '' })
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save subject')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this subject?')) return
    try {
      await academic.subjects.delete(id)
      toast.success('Subject deleted')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject')
    }
  }

  function startEdit(subject) {
    setEditing(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      branch_id: subject.branch_id._id || subject.branch_id,
      semester_id: subject.semester_id._id || subject.semester_id,
      description: subject.description || ''
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">Manage subjects for branches and semesters</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', code: '', branch_id: '', semester_id: '', description: '' }) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Subject' : 'Create Subject'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Subject Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.semester_id}
                    onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })}
                    required
                  >
                    <option value="">Select semester</option>
                    {semesters.map(s => (
                      <option key={s._id} value={s._id}>Semester {s.number}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
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
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>{subjects.length} subject(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-muted-foreground">No subjects yet.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{subject.name} ({subject.code})</div>
                    <div className="text-sm text-muted-foreground">
                      {subject.branch_id?.name} - Semester {subject.semester_id?.number}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(subject)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(subject._id)}>
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

