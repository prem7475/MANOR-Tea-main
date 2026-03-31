export function isValidEmail(email) {
  if (typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

