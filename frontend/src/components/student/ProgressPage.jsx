import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle, FileText } from 'lucide-react'
import { student } from '../../lib/api'
import { toast } from 'sonner'

export default function ProgressPage() {
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    try {
      const data = await student.progress()
      setProgress(data)
    } catch (err) {
      toast.error('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your note completion progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    {progress.completed} / {progress.total}
                  </div>
                  <p className="text-sm text-muted-foreground">Notes completed</p>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-2xl font-bold">{progress.percentage}%</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Notes:</span>
                  <span className="font-medium">{progress.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium text-green-600">{progress.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">{progress.total - progress.completed}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

