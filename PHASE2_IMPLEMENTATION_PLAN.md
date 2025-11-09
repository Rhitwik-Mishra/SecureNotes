# Phase 2 Implementation Plan

## ✅ Completed
- [x] Database models (Branch, Semester, Section, Subject, Module, Progress, SubjectAssignment)
- [x] Updated User and Note models
- [x] Academic structure routes (branches, semesters, sections, subjects)

## 🚧 In Progress
- [ ] Update admin routes (user management with B-S-S assignment)
- [ ] Update teacher routes (subjects, modules, notes)
- [ ] Update student routes (view subjects, modules, notes, progress)
- [ ] Frontend setup (ShadCN UI, Tailwind, React Router)

## 📋 Remaining Tasks

### Backend
1. **Update admin.js routes:**
   - User CRUD with branch/semester/section assignment
   - Subject assignment to teachers
   - System logs endpoint

2. **Update teacher.js routes:**
   - Get assigned subjects
   - Module/Folder CRUD
   - Note upload/management
   - Get students under their B-S-S
   - Search functionality

3. **Update student.js routes:**
   - Get subjects (based on B-S-S)
   - Get modules/folders for subject
   - Get notes for module
   - Mark note as complete
   - Progress tracking
   - Search functionality

4. **Security enhancements:**
   - Token expiration handling
   - Rate limiting on upload endpoints
   - Login attempt logging
   - Anti-embedding headers

### Frontend
1. **Setup:**
   - Install ShadCN UI
   - Setup Tailwind CSS
   - React Router configuration
   - Auth Context Provider
   - Toast notifications

2. **Components:**
   - Layout with sidebar navigation
   - NIE branding header
   - Breadcrumbs component
   - Loading skeletons
   - Modal dialogs
   - Dark mode toggle

3. **Admin Dashboard:**
   - Manage Branches/Semesters/Sections
   - Manage Subjects
   - User management with B-S-S assignment
   - Assign subjects to teachers
   - System logs view

4. **Teacher Dashboard:**
   - My Subjects view
   - Students list (filtered by B-S-S)
   - Module/Folder management
   - Note upload interface
   - Analytics/notifications

5. **Student Dashboard:**
   - Moodle-style subject view
   - Module/Folder navigation
   - Notes viewer with watermark
   - Progress tracker
   - Recently viewed notes

## 🎨 Design System
- **Colors:** NIE theme (blue/yellow)
- **Logo:** NIE Mysore (top-left)
- **Layout:** Sidebar navigation + main content
- **Components:** ShadCN UI components
- **Animations:** Smooth transitions, hover effects

## 🔐 Security Features
- Token expiration (8 hours, refresh mechanism)
- Rate limiting (upload: 10/min, general: 100/15min)
- Login attempt logging
- X-Frame-Options: DENY (anti-embedding)
- Tab blur detection (best-effort screenshot prevention)

## 📊 Database Structure
```
Users → branch_id, semester_id, section_id
Subjects → branch_id, semester_id
Sections → branch_id, semester_id
Modules → subject_id, parent_id (for folders)
Notes → module_id, teacher_id
Progress → student_id, note_id, completed
SubjectAssignment → teacher_id, subject_id
```

## 🚀 Next Steps
1. Complete backend routes
2. Setup frontend infrastructure
3. Build UI components
4. Integrate all features
5. Testing and refinement

