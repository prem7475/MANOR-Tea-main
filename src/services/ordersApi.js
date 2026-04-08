import { apiJson } from './apiClient.js'

export async function createOrder(payload) {
  const data = await apiJson('/api/orders', { method: 'POST', body: payload })
  return data?.orderId ?? null
}

export async function fetchOrder(orderId) {
  const id = String(orderId ?? '').trim()
  if (!id) return null
  const data = await apiJson(`/api/orders/${encodeURIComponent(id)}`)
  return data?.order ?? null
}

