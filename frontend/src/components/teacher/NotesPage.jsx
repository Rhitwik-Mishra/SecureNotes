import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Edit2, FileText } from 'lucide-react'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [formData, setFormData] = useState({ title: '', description: '', module_id: '', order: 0 })
  const [file, setFile] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadModules()
      loadNotes()
    }
  }, [selectedSubject, selectedModule])

  async function loadData() {
    try {
      const subjectsData = await teacher.subjects()
      setSubjects(subjectsData)
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0]._id)
      }
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function loadModules() {
    if (!selectedSubject) return
    try {
      const data = await teacher.modules.list({ subject_id: selectedSubject })
      setModules(data)
      if (data.length > 0 && !selectedModule) {
        setSelectedModule(data[0]._id)
      }
    } catch (err) {
      toast.error('Failed to load modules')
    }
  }

  async function loadNotes() {
    try {
      const params = {}
      if (selectedSubject) params.subject_id = selectedSubject
      if (selectedModule) params.module_id = selectedModule
      const data = await teacher.notes.list(params)
      setNotes(data)
    } catch (err) {
      toast.error('Failed to load notes')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file && !editing) {
      toast.error('Please select a PDF file')
      return
    }
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('module_id', formData.module_id || selectedModule)
      formDataToSend.append('order', formData.order || 0)
      if (file) formDataToSend.append('file', file)

      if (editing) {
        await teacher.notes.update(editing._id, { title: formData.title, description: formData.description, order: formData.order })
        toast.success('Note updated')
      } else {
        await teacher.notes.upload(formDataToSend)
        toast.success('Note uploaded')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ title: '', description: '', module_id: '', order: 0 })
      setFile(null)
      loadNotes()
    } catch (err) {
      toast.error(err.message || 'Failed to save note')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    try {
      await teacher.notes.delete(id)
      toast.success('Note deleted')
      loadNotes()
    } catch (err) {
      toast.error(err.message || 'Failed to delete note')
    }
  }

  function startEdit(note) {
    setEditing(note)
    setFormData({
      title: note.title,
      description: note.description || '',
      module_id: note.module_id?._id || note.module_id,
      order: note.order || 0
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">Upload and manage PDF notes</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setFormData({ title: '', description: '', module_id: selectedModule, order: 0 }); setFile(null) }}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Note
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Students can only see notes if the note's subject matches their Branch & Semester. 
            Make sure the subject of the module you upload to matches the student's academic details.
          </p>
        </CardContent>
      </Card>

      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setSelectedModule('') }}
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            {selectedSubject && modules.length > 0 && (
              <div className="space-y-2">
                <Label>Module</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <option value="">All Modules</option>
                  {modules.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Note' : 'Upload Note'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.module_id || selectedModule}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  required
                >
                  <option value="">Select module</option>
                  {modules.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
              {!editing && (
                <div className="space-y-2">
                  <Label>PDF File</Label>
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editing} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? 'Update' : 'Upload'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setFile(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>{notes.length} note(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet. Upload one to get started.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{note.title}</div>
                      {note.description && (
                        <div className="text-sm text-muted-foreground">{note.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Module: {note.module_id?.title} | Subject: {note.module_id?.subject_id?.name || note.module_id?.subject_id || 'Unknown'} ({note.module_id?.subject_id?.code || 'N/A'}) | Uploaded: {new Date(note.uploaded_at).toLocaleDateString()}
                      </div>
                      {note.module_id?.subject_id && (
                        <div className="text-xs text-blue-600 mt-1">
                          ✓ Visible to students in {note.module_id.subject_id.branch_id?.name || 'this branch'} - Semester {note.module_id.subject_id.semester_id?.number || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(note)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(note._id)}>
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

