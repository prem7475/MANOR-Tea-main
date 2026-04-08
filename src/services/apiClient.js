export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function normalizeBaseUrl(value) {
  return String(value ?? '').trim().replace(/\/+$/, '')
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_URL)

function buildUrl(path) {
  if (!path) return API_BASE || ''
  if (/^https?:\/\//i.test(path)) return path
  if (!API_BASE) return path
  if (path.startsWith('/')) return `${API_BASE}${path}`
  return `${API_BASE}/${path}`
}

async function readErrorBody(res) {
  const type = res.headers.get('content-type') || ''
  if (type.includes('application/json')) {
    try {
      const json = await res.json()
      const message = json?.error?.message || json?.message
      return { message: message ? String(message) : '', details: json?.error?.details }
    } catch {
      return { message: '', details: undefined }
    }
  }
  try {
    const text = await res.text()
    return { message: text.slice(0, 200), details: undefined }
  } catch {
    return { message: '', details: undefined }
  }
}

export async function apiJson(path, { method = 'GET', headers, body, authToken, signal } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : null),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : null),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  if (!res.ok) {
    const payload = await readErrorBody(res)
    throw new ApiError(payload.message || `Request failed (${res.status})`, {
      status: res.status,
      details: payload.details,
    })
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null
  return res.json()
}

