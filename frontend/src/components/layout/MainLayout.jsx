import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { LogOut, BookOpen } from 'lucide-react'

export default function MainLayout({ children, sidebar }) {
  const { auth, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-nie-blue" />
              <span className="text-xl font-bold text-nie-blue">NIE Mysore</span>
            </div>
            <span className="text-sm text-muted-foreground">Secure Notes Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {auth?.user?.name} <span className="text-muted-foreground">({auth?.user?.role})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)] p-4">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

