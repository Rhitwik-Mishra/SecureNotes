import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { BookOpen, CheckCircle, FileText } from 'lucide-react'
import { student } from '../../lib/api'
import { toast } from 'sonner'

export default function DashboardHome() {
  const [stats, setStats] = useState({ subjects: 0, completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [subjects, progress] = await Promise.all([
        student.subjects().catch(() => []),
        student.progress().catch(() => ({ completed: 0, total: 0 }))
      ])
      setStats({
        subjects: subjects.length || 0,
        completed: progress.completed || 0,
        total: progress.total || 0
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
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">View your subjects, modules, and notes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.subjects}</div>
            <p className="text-xs text-muted-foreground">Available subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.completed}/${stats.total}`}
            </div>
            <p className="text-xs text-muted-foreground">Notes completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Get started by exploring your subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Navigate to "My Subjects" to view available subjects and their modules. Click on any subject to see modules and notes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

