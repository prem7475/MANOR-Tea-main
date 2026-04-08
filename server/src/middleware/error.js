import { sendError } from '../utils/http.js'

export function notFound(req, res) {
  sendError(res, 404, 'Not found')
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = Number(err?.status) || 500
  const message = status >= 500 ? 'Server error' : String(err?.message || 'Request failed')
  const details = err?.details

  // Avoid leaking stack traces in responses.
  sendError(res, status, message, details)
}

