import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Edit2, Folder, FolderOpen } from 'lucide-react'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function ModulesPage() {
  const [modules, setModules] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [formData, setFormData] = useState({ title: '', description: '', subject_id: '', parent_id: '', order: 0 })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadModules()
    }
  }, [selectedSubject])

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
    } catch (err) {
      toast.error('Failed to load modules')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await teacher.modules.update(editing._id, formData)
        toast.success('Module updated')
      } else {
        await teacher.modules.create({ ...formData, subject_id: selectedSubject })
        toast.success('Module created')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ title: '', description: '', subject_id: '', parent_id: '', order: 0 })
      loadModules()
    } catch (err) {
      toast.error(err.message || 'Failed to save module')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this module/folder?')) return
    try {
      await teacher.modules.delete(id)
      toast.success('Module deleted')
      loadModules()
    } catch (err) {
      toast.error(err.message || 'Failed to delete module')
    }
  }

  function startEdit(module) {
    setEditing(module)
    setFormData({
      title: module.title,
      description: module.description || '',
      parent_id: module.parent_id?._id || module.parent_id || '',
      order: module.order || 0
    })
    setShowForm(true)
  }

  const rootModules = modules.filter(m => !m.parent_id)
  const getChildModules = (parentId) => modules.filter(m => m.parent_id?._id === parentId || m.parent_id === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modules & Folders</h1>
          <p className="text-muted-foreground">Create and manage modules/folders for your subjects</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setFormData({ title: '', description: '', parent_id: '', order: 0 }) }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </div>

      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Module' : 'Create Module/Folder'}</CardTitle>
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
                <Label>Parent Folder (Optional - for nested folders)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">None (Root level)</option>
                  {rootModules.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
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
          <CardTitle>Modules & Folders</CardTitle>
          <CardDescription>{modules.length} module(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : modules.length === 0 ? (
            <p className="text-muted-foreground">No modules yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {rootModules.map((module) => (
                <div key={module._id}>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{module.title}</div>
                        {module.description && (
                          <div className="text-sm text-muted-foreground">{module.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(module)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(module._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {getChildModules(module._id).map((child) => (
                    <div key={child._id} className="ml-8 mt-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{child.title}</div>
                            {child.description && (
                              <div className="text-sm text-muted-foreground">{child.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(child)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(child._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

