const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

function getAuthHeaders() {
  try {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  } catch {
    return {
      'Content-Type': 'application/json'
    }
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = { ...getAuthHeaders(), ...options.headers }
  
  try {
    const res = await fetch(url, { ...options, headers })
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text()
      throw new Error(text || `Server returned ${res.status}`)
    }
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid response from server')
    }
    throw err
  }
}

// Auth
export const auth = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (data) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
}

// Admin - Academic Structure
export const academic = {
  branches: {
    list: () => apiRequest('/academic/branches'),
    create: (data) => apiRequest('/academic/branches', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/academic/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/academic/branches/${id}`, {
      method: 'DELETE'
    }),
  },
  semesters: {
    list: () => apiRequest('/academic/semesters'),
    create: (data) => apiRequest('/academic/semesters', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/academic/semesters/${id}`, {
      method: 'DELETE'
    }),
  },
  sections: {
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/academic/sections${query ? `?${query}` : ''}`)
    },
    create: (data) => apiRequest('/academic/sections', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/academic/sections/${id}`, {
      method: 'DELETE'
    }),
  },
  subjects: {
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/academic/subjects${query ? `?${query}` : ''}`)
    },
    create: (data) => apiRequest('/academic/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/academic/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/academic/subjects/${id}`, {
      method: 'DELETE'
    }),
  },
}

// Admin - Users
export const admin = {
  stats: () => apiRequest('/admin/stats'),
  users: {
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/admin/users${query ? `?${query}` : ''}`)
    },
    update: (id, data) => apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    }),
  },
  assignSubject: {
    create: (data) => apiRequest('/admin/assign-subject', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/admin/assign-subject${query ? `?${query}` : ''}`)
    },
    delete: (id) => apiRequest(`/admin/assign-subject/${id}`, {
      method: 'DELETE'
    }),
  },
}

// Teacher
export const teacher = {
  subjects: () => apiRequest('/teacher/subjects'),
  students: () => apiRequest('/teacher/students'),
  modules: {
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/teacher/modules${query ? `?${query}` : ''}`)
    },
    create: (data) => apiRequest('/teacher/modules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/teacher/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/teacher/modules/${id}`, {
      method: 'DELETE'
    }),
  },
  notes: {
    list: (params) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/teacher/notes${query ? `?${query}` : ''}`)
    },
    upload: (formData) => {
      try {
        const token = localStorage.getItem('token')
        return fetch(`${API_BASE}/teacher/notes`, {
          method: 'POST',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          body: formData
        }).then(async (res) => {
          const contentType = res.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text()
            throw new Error(text || 'Upload failed')
          }
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Upload failed')
          return data
        })
      } catch (err) {
        throw err
      }
    },
    update: (id, data) => apiRequest(`/teacher/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/teacher/notes/${id}`, {
      method: 'DELETE'
    }),
  },
  search: (q) => apiRequest(`/teacher/search?q=${encodeURIComponent(q)}`),
}

// Student
export const student = {
  subjects: () => apiRequest('/student/subjects'),
  modules: (subjectId) => apiRequest(`/student/subjects/${subjectId}/modules`),
  notes: (moduleId) => apiRequest(`/student/modules/${moduleId}/notes`),
  viewNote: (noteId) => {
    return `${API_BASE}/student/notes/${noteId}/view`
  },
  completeNote: (noteId, completed) => apiRequest(`/student/notes/${noteId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ completed })
  }),
  progress: () => apiRequest('/student/progress'),
  recent: (limit = 10) => apiRequest(`/student/notes/recent?limit=${limit}`),
  search: (q) => apiRequest(`/student/search?q=${encodeURIComponent(q)}`),
}

