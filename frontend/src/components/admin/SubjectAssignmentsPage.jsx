import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { admin, academic } from '../../lib/api'
import { toast } from 'sonner'

export default function SubjectAssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ teacher_id: '', subject_id: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [assignmentsData, usersData, subjectsData] = await Promise.all([
        admin.assignSubject.list(),
        admin.users.list({ role: 'teacher' }),
        academic.subjects.list()
      ])
      setAssignments(assignmentsData)
      setTeachers(usersData)
      setSubjects(subjectsData)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await admin.assignSubject.create(formData)
      toast.success('Subject assigned to teacher')
      setFormData({ teacher_id: '', subject_id: '' })
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to assign subject')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this assignment?')) return
    try {
      await admin.assignSubject.delete(id)
      toast.success('Assignment removed')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to remove assignment')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subject Assignments</h1>
        <p className="text-muted-foreground">Assign subjects to teachers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Subject to Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code}) - {s.branch_id?.name} Sem {s.semester_id?.number}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">Assign</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>{assignments.length} assignment(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground">No assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{assignment.teacher_id?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {assignment.subject_id?.name} ({assignment.subject_id?.code})
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

