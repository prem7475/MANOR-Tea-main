import { apiJson } from './apiClient.js'

export async function fetchProducts({ q, cat } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (cat) params.set('cat', cat)
  const qs = params.toString()
  const data = await apiJson(`/api/products${qs ? `?${qs}` : ''}`)
  return data?.products ?? []
}

export async function fetchProductBySlugOrId(slugOrId) {
  const key = String(slugOrId ?? '').trim()
  if (!key) return null
  const data = await apiJson(`/api/products/${encodeURIComponent(key)}`)
  return data?.product ?? null
}

