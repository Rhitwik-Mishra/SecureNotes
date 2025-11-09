import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { academic } from '../../lib/api'
import { toast } from 'sonner'

export default function SectionsPage() {
  const [sections, setSections] = useState([])
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', branch_id: '', semester_id: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [sectionsData, branchesData, semestersData] = await Promise.all([
        academic.sections.list(),
        academic.branches.list(),
        academic.semesters.list()
      ])
      setSections(sectionsData)
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
      await academic.sections.create(formData)
      toast.success('Section created')
      setShowForm(false)
      setFormData({ name: '', branch_id: '', semester_id: '' })
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to create section')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this section?')) return
    try {
      await academic.sections.delete(id)
      toast.success('Section deleted')
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete section')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sections</h1>
          <p className="text-muted-foreground">Manage sections (A, B, C, etc.) for branches and semesters</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Section</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="A, B, C, etc."
                  required
                />
              </div>
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
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormData({ name: '', branch_id: '', semester_id: '' }) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
          <CardDescription>{sections.length} section(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : sections.length === 0 ? (
            <p className="text-muted-foreground">No sections yet.</p>
          ) : (
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Section {section.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {section.branch_id?.name} ({section.branch_id?.code}) - Semester {section.semester_id?.number}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(section._id)}>
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

