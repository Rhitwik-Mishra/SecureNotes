import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import { Button } from '../ui/button'
import { BookOpen, Users, Upload, FileText, Search } from 'lucide-react'
import SubjectsPage from './SubjectsPage'
import StudentsPage from './StudentsPage'
import ModulesPage from './ModulesPage'
import NotesPage from './NotesPage'
import SearchPage from './SearchPage'
import DashboardHome from './DashboardHome'

export default function TeacherDashboard() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <MainLayout
      sidebar={
        <nav className="space-y-1">
          <Link to="/teacher">
            <Button variant={location.pathname === '/teacher' ? 'default' : 'ghost'} className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/teacher/subjects">
            <Button variant={isActive('/teacher/subjects') ? 'default' : 'ghost'} className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              My Subjects
            </Button>
          </Link>
          <Link to="/teacher/students">
            <Button variant={isActive('/teacher/students') ? 'default' : 'ghost'} className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              My Students
            </Button>
          </Link>
          <Link to="/teacher/modules">
            <Button variant={isActive('/teacher/modules') ? 'default' : 'ghost'} className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Modules & Folders
            </Button>
          </Link>
          <Link to="/teacher/notes">
            <Button variant={isActive('/teacher/notes') ? 'default' : 'ghost'} className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              My Notes
            </Button>
          </Link>
          <Link to="/teacher/search">
            <Button variant={isActive('/teacher/search') ? 'default' : 'ghost'} className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </Link>
        </nav>
      }
    >
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="subjects/*" element={<SubjectsPage />} />
        <Route path="students/*" element={<StudentsPage />} />
        <Route path="modules/*" element={<ModulesPage />} />
        <Route path="notes/*" element={<NotesPage />} />
        <Route path="search/*" element={<SearchPage />} />
      </Routes>
    </MainLayout>
  )
}
