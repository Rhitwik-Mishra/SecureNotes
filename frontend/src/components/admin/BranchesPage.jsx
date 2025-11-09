import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { academic } from '../../lib/api'
import { toast } from 'sonner'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '' })

  useEffect(() => {
    loadBranches()
  }, [])

  async function loadBranches() {
    try {
      const data = await academic.branches.list()
      setBranches(data)
    } catch (err) {
      toast.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editing) {
        await academic.branches.update(editing._id, formData)
        toast.success('Branch updated')
      } else {
        await academic.branches.create(formData)
        toast.success('Branch created')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', code: '' })
      loadBranches()
    } catch (err) {
      toast.error(err.message || 'Failed to save branch')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this branch?')) return
    try {
      await academic.branches.delete(id)
      toast.success('Branch deleted')
      loadBranches()
    } catch (err) {
      toast.error(err.message || 'Failed to delete branch')
    }
  }

  function startEdit(branch) {
    setEditing(branch)
    setFormData({ name: branch.name, code: branch.code })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-muted-foreground">Manage academic branches (CSE, ISE, ECE, etc.)</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', code: '' }) }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Branch' : 'Create Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="CSE"
                  required
                />
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
          <CardTitle>All Branches</CardTitle>
          <CardDescription>{branches.length} branch(es)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : branches.length === 0 ? (
            <p className="text-muted-foreground">No branches yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <div key={branch._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-sm text-muted-foreground">Code: {branch.code}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(branch)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(branch._id)}>
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

