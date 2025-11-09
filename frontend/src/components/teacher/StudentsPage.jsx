import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Users } from 'lucide-react'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const data = await teacher.students()
      setStudents(data)
    } catch (err) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  // Group students by section
  const groupedBySection = students.reduce((acc, student) => {
    const sectionKey = student.section_id?._id || student.section_id || 'no-section'
    const sectionName = student.section_id?.name || 'No Section'
    if (!acc[sectionKey]) {
      acc[sectionKey] = {
        name: sectionName,
        branch: student.branch_id?.name || 'Unknown',
        semester: student.semester_id?.number || 'Unknown',
        students: []
      }
    }
    acc[sectionKey].students.push(student)
    return acc
  }, {})

  const sections = Object.values(groupedBySection)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">Students in your branch, semester, and section</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No students found. Make sure you're assigned to a branch, semester, and section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-nie-blue" />
                  Section {section.name}
                </CardTitle>
                <CardDescription>
                  {section.branch} - Semester {section.semester} • {section.students.length} student(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.students.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

