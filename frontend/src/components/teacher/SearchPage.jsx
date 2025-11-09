import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search as SearchIcon, BookOpen, FileText, Folder } from 'lucide-react'
import { teacher } from '../../lib/api'
import { toast } from 'sonner'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ subjects: [], modules: [], notes: [] })
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!query.trim()) {
      toast.error('Please enter a search term')
      return
    }
    setLoading(true)
    try {
      const data = await teacher.search(query)
      setResults(data)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Search subjects, modules, and notes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search subjects, modules, notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {(results.subjects.length > 0 || results.modules.length > 0 || results.notes.length > 0) && (
        <div className="space-y-4">
          {results.subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Subjects ({results.subjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.subjects.map((subject) => (
                    <div key={subject._id} className="p-3 border rounded-lg">
                      <div className="font-medium">{subject.name} ({subject.code})</div>
                      <div className="text-sm text-muted-foreground">
                        {subject.branch_id?.name} - Semester {subject.semester_id?.number}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.modules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Modules ({results.modules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.modules.map((module) => (
                    <div key={module._id} className="p-3 border rounded-lg">
                      <div className="font-medium">{module.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Subject: {module.subject_id?.name} ({module.subject_id?.code})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes ({results.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.notes.map((note) => (
                    <div key={note._id} className="p-3 border rounded-lg">
                      <div className="font-medium">{note.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Module: {note.module_id?.title}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && query && results.subjects.length === 0 && results.modules.length === 0 && results.notes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No results found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

