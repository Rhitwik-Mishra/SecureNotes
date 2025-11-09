import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import { student } from '../../lib/api'
import { toast } from 'sonner'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    try {
      const data = await student.subjects()
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
        <p className="text-muted-foreground">Subjects available for your branch and semester</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No subjects available. Make sure you're assigned to a branch, semester, and section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-nie-blue" />
                  {subject.name}
                </CardTitle>
                <CardDescription>{subject.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {subject.branch_id?.name} - Semester {subject.semester_id?.number}
                </div>
                {subject.description && (
                  <p className="text-sm mb-4">{subject.description}</p>
                )}
                <Link to={`/student/subjects/${subject._id}`}>
                  <Button className="w-full">
                    View Modules
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

