import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Clock, FileText } from 'lucide-react'
import { student } from '../../lib/api'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import SecurePDFViewer from '../SecurePDFViewer'

export default function RecentPage() {
  const { auth } = useAuth()
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecent()
  }, [])

  async function loadRecent() {
    try {
      const data = await student.recent(20)
      setNotes(data)
    } catch (err) {
      toast.error('Failed to load recent notes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recently Viewed Notes</h1>
        <p className="text-muted-foreground">Your recently accessed notes</p>
      </div>

      {selectedNote ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedNote.title}</CardTitle>
                  <CardDescription>
                    Module: {selectedNote.module_id?.title}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedNote(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SecurePDFViewer
                srcUrl={student.viewNote(selectedNote._id)}
                token={auth?.token || ''}
                watermarkText={`${auth?.user?.name || 'Student'} (${auth?.user?.email || ''})\nShared by: ${selectedNote.teacher_id?.email || 'Teacher'}\n${new Date().toLocaleString()}`}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Notes
            </CardTitle>
            <CardDescription>{notes.length} note(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : notes.length === 0 ? (
              <p className="text-muted-foreground">No recently viewed notes.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <Button
                    key={note._id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setSelectedNote(note)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {note.title}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

