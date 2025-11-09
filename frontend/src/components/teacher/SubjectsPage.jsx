import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    try {
      const data = await teacher.subjects()
      setSubjects(data)
    } catch (err) {
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Subjects</h1>
        <p className="text-muted-foreground">Subjects assigned to you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Subjects</CardTitle>
          <CardDescription>{subjects.length} subject(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-muted-foreground">No subjects assigned yet. Contact admin to assign subjects.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card key={subject._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {subject.branch_id?.name} - Semester {subject.semester_id?.number}
                    </div>
                    {subject.description && (
                      <p className="text-sm mt-2">{subject.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

