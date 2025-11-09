import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { BookOpen, Users, FileText } from 'lucide-react'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function DashboardHome() {
  const [stats, setStats] = useState({ subjects: 0, students: 0, notes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [subjects, students, notes] = await Promise.all([
        teacher.subjects().catch(() => []),
        teacher.students().catch(() => []),
        teacher.notes.list().catch(() => [])
      ])
      setStats({
        subjects: subjects.length || 0,
        students: students.length || 0,
        notes: notes.length || 0
      })
    } catch (err) {
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage your subjects, modules, and notes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.subjects}</div>
            <p className="text-xs text-muted-foreground">Assigned subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.students}</div>
            <p className="text-xs text-muted-foreground">Students in my B-S-S</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.notes}</div>
            <p className="text-xs text-muted-foreground">Uploaded notes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to your subjects, students, modules, and notes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
