import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Folder, FolderOpen, FileText, ArrowLeft } from 'lucide-react'
import { student } from '../../lib/api'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import SecurePDFViewer from '../SecurePDFViewer'

export default function SubjectDetailPage() {
  const { auth } = useAuth()
  const { subjectId } = useParams()
  const [modules, setModules] = useState([])
  const [notes, setNotes] = useState({})
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subjectId) {
      loadModules()
    }
  }, [subjectId])

  async function loadModules() {
    try {
      const modulesData = await student.modules(subjectId)
      setModules(modulesData)
      
      // Load notes for each module
      const notesPromises = modulesData.map(async (module) => {
        try {
          const notesData = await student.notes(module._id)
          return { moduleId: module._id, notes: notesData }
        } catch {
          return { moduleId: module._id, notes: [] }
        }
      })
      const notesResults = await Promise.all(notesPromises)
      const notesMap = {}
      notesResults.forEach(({ moduleId, notes }) => {
        notesMap[moduleId] = notes
      })
      setNotes(notesMap)
    } catch (err) {
      toast.error('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(noteId, completed) {
    try {
      await student.completeNote(noteId, completed)
      toast.success(completed ? 'Marked as complete' : 'Marked as incomplete')
      loadModules()
    } catch (err) {
      toast.error('Failed to update progress')
    }
  }

  const rootModules = modules.filter(m => !m.parent_id)
  const getChildModules = (parentId) => modules.filter(m => m.parent_id?._id === parentId || m.parent_id === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/student/subjects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Subject Modules</h1>
          <p className="text-muted-foreground">Browse modules and notes</p>
        </div>
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
              <div className="mt-4">
                <Button
                  onClick={() => handleComplete(selectedNote._id, !selectedNote.progress?.completed)}
                  variant={selectedNote.progress?.completed ? 'default' : 'outline'}
                >
                  {selectedNote.progress?.completed ? '✓ Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p>Loading...</p>
              </CardContent>
            </Card>
          ) : modules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No modules available yet.</p>
              </CardContent>
            </Card>
          ) : (
            rootModules.map((module) => (
              <Card key={module._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-nie-blue" />
                    {module.title}
                  </CardTitle>
                  {module.description && (
                    <CardDescription>{module.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {getChildModules(module._id).length > 0 && (
                    <div className="ml-6 space-y-2">
                      {getChildModules(module._id).map((child) => (
                        <div key={child._id} className="p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{child.title}</span>
                          </div>
                          {notes[child._id] && notes[child._id].length > 0 && (
                            <div className="ml-6 space-y-1">
                              {notes[child._id].map((note) => (
                                <Button
                                  key={note._id}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => setSelectedNote(note)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  {note.title}
                                  {note.progress?.completed && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {notes[module._id] && notes[module._id].length > 0 && (
                    <div className="space-y-1">
                      {notes[module._id].map((note) => (
                        <Button
                          key={note._id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setSelectedNote(note)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {note.title}
                          {note.progress?.completed && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                  {(!notes[module._id] || notes[module._id].length === 0) && getChildModules(module._id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No notes available in this module.</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

