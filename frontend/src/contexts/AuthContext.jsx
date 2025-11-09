import React, { createContext, useContext, useState, useEffect } from 'react'
import { safeGetItem, safeSetItem, safeRemoveItem, safeParseJSON } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const token = safeGetItem('token')
      const userStr = safeGetItem('user')
      if (token && userStr) {
        const parsedUser = safeParseJSON(userStr)
        if (parsedUser) {
          return { token, user: parsedUser }
        }
      }
      return null
    } catch (err) {
      // Clear corrupted data
      safeRemoveItem('token')
      safeRemoveItem('user')
      return null
    }
  })

  const login = (data) => {
    safeSetItem('token', data.token)
    safeSetItem('user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }

  const logout = () => {
    safeRemoveItem('token')
    safeRemoveItem('user')
    setAuth(null)
  }

  const updateUser = (userData) => {
    if (auth) {
      const updatedUser = { ...auth.user, ...userData }
      safeSetItem('user', JSON.stringify(updatedUser))
      setAuth({ ...auth, user: updatedUser })
    }
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

