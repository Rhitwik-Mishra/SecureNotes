// Utility to safely handle localStorage

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function safeParseJSON(str) {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export function clearAuthData() {
  safeRemoveItem('token')
  safeRemoveItem('user')
}

