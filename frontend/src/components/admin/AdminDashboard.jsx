import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import { Button } from '../ui/button'
import { BookOpen, Users, Settings, GraduationCap, Calendar, FolderTree, BookMarked } from 'lucide-react'
import BranchesPage from './BranchesPage'
import SemestersPage from './SemestersPage'
import SectionsPage from './SectionsPage'
import SubjectsPage from './SubjectsPage'
import UsersPage from './UsersPage'
import SubjectAssignmentsPage from './SubjectAssignmentsPage'
import DashboardHome from './DashboardHome'

export default function AdminDashboard() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <MainLayout
      sidebar={
        <nav className="space-y-1">
          <Link to="/admin">
            <Button variant={location.pathname === '/admin' ? 'default' : 'ghost'} className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant={isActive('/admin/users') ? 'default' : 'ghost'} className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link to="/admin/branches">
            <Button variant={isActive('/admin/branches') ? 'default' : 'ghost'} className="w-full justify-start">
              <GraduationCap className="mr-2 h-4 w-4" />
              Branches
            </Button>
          </Link>
          <Link to="/admin/semesters">
            <Button variant={isActive('/admin/semesters') ? 'default' : 'ghost'} className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Semesters
            </Button>
          </Link>
          <Link to="/admin/sections">
            <Button variant={isActive('/admin/sections') ? 'default' : 'ghost'} className="w-full justify-start">
              <FolderTree className="mr-2 h-4 w-4" />
              Sections
            </Button>
          </Link>
          <Link to="/admin/subjects">
            <Button variant={isActive('/admin/subjects') ? 'default' : 'ghost'} className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Subjects
            </Button>
          </Link>
          <Link to="/admin/assignments">
            <Button variant={isActive('/admin/assignments') ? 'default' : 'ghost'} className="w-full justify-start">
              <BookMarked className="mr-2 h-4 w-4" />
              Assign Subjects
            </Button>
          </Link>
        </nav>
      }
    >
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="users/*" element={<UsersPage />} />
        <Route path="branches/*" element={<BranchesPage />} />
        <Route path="semesters/*" element={<SemestersPage />} />
        <Route path="sections/*" element={<SectionsPage />} />
        <Route path="subjects/*" element={<SubjectsPage />} />
        <Route path="assignments/*" element={<SubjectAssignmentsPage />} />
      </Routes>
    </MainLayout>
  )
}
