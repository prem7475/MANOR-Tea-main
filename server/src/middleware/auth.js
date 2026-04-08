import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { sendError } from '../utils/http.js'

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const [type, value] = header.split(' ')
  if (type !== 'Bearer' || !value) return ''
  return value.trim()
}

export function requireAdmin(req, res, next) {
  const token = getBearerToken(req)
  if (!token) return sendError(res, 401, 'Unauthorized')

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (payload?.role !== 'admin') return sendError(res, 403, 'Forbidden')
    req.admin = { id: payload.sub, email: payload.email, name: payload.name }
    return next()
  } catch {
    return sendError(res, 401, 'Unauthorized')
  }
}

