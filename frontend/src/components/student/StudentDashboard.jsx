import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import { Button } from '../ui/button'
import { BookOpen, Clock, CheckCircle, Search } from 'lucide-react'
import SubjectsPage from './SubjectsPage'
import SubjectDetailPage from './SubjectDetailPage'
import RecentPage from './RecentPage'
import ProgressPage from './ProgressPage'
import SearchPage from './SearchPage'
import DashboardHome from './DashboardHome'

export default function StudentDashboard() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <MainLayout
      sidebar={
        <nav className="space-y-1">
          <Link to="/student">
            <Button variant={location.pathname === '/student' ? 'default' : 'ghost'} className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/student/subjects">
            <Button variant={isActive('/student/subjects') ? 'default' : 'ghost'} className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              My Subjects
            </Button>
          </Link>
          <Link to="/student/recent">
            <Button variant={isActive('/student/recent') ? 'default' : 'ghost'} className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Recent Notes
            </Button>
          </Link>
          <Link to="/student/progress">
            <Button variant={isActive('/student/progress') ? 'default' : 'ghost'} className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Progress
            </Button>
          </Link>
          <Link to="/student/search">
            <Button variant={isActive('/student/search') ? 'default' : 'ghost'} className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </Link>
        </nav>
      }
    >
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
        <Route path="recent" element={<RecentPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="search" element={<SearchPage />} />
      </Routes>
    </MainLayout>
  )
}
