import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { academic } from '../../lib/api'
import { toast } from 'sonner'

export default function SemestersPage() {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [number, setNumber] = useState('')

  useEffect(() => {
    loadSemesters()
  }, [])

  async function loadSemesters() {
    try {
      const data = await academic.semesters.list()
      setSemesters(data)
    } catch (err) {
      toast.error('Failed to load semesters')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await academic.semesters.create({ number: parseInt(number) })
      toast.success('Semester created')
      setShowForm(false)
      setNumber('')
      loadSemesters()
    } catch (err) {
      toast.error(err.message || 'Failed to create semester')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this semester?')) return
    try {
      await academic.semesters.delete(id)
      toast.success('Semester deleted')
      loadSemesters()
    } catch (err) {
      toast.error(err.message || 'Failed to delete semester')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Semesters</h1>
          <p className="text-muted-foreground">Manage semesters (1-8)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Semester
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Semester Number (1-8)</Label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setNumber('') }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Semesters</CardTitle>
          <CardDescription>{semesters.length} semester(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : semesters.length === 0 ? (
            <p className="text-muted-foreground">No semesters yet.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-4">
              {semesters.map((sem) => (
                <div key={sem._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Semester {sem.number}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(sem._id)}>
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

