export function sendJson(res, status, data) {
  res.status(status).json(data)
}

export function sendError(res, status, message, details) {
  const payload = { error: { message } }
  if (details) payload.error.details = details
  res.status(status).json(payload)
}

