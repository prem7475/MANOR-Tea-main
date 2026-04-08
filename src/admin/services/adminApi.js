import { apiJson } from '../../services/apiClient.js'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'

function getToken() {
  return useAdminAuthStore.getState().token
}

function authTokenOrThrow() {
  const token = getToken()
  if (!token) throw new Error('Missing admin token')
  return token
}

export async function adminLogin({ email, password }) {
  return apiJson('/api/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function adminMe(token) {
  const authToken = token || authTokenOrThrow()
  return apiJson('/api/admin/auth/me', { authToken })
}

export async function adminLogout() {
  const token = getToken()
  if (!token) return null
  return apiJson('/api/admin/auth/logout', { method: 'POST', authToken: token })
}

export async function fetchAdminProducts() {
  const token = authTokenOrThrow()
  const data = await apiJson('/api/admin/products', { authToken: token })
  return data?.products ?? []
}

export async function createAdminProduct(payload) {
  const token = authTokenOrThrow()
  const data = await apiJson('/api/admin/products', { method: 'POST', authToken: token, body: payload })
  return data?.product ?? null
}

export async function updateAdminProduct(productId, payload) {
  const token = authTokenOrThrow()
  const data = await apiJson(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    authToken: token,
    body: payload,
  })
  return data?.product ?? null
}

export async function deleteAdminProduct(productId) {
  const token = authTokenOrThrow()
  await apiJson(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE', authToken: token })
  return true
}

export async function fetchAdminOffers() {
  const token = authTokenOrThrow()
  const data = await apiJson('/api/admin/offers', { authToken: token })
  return data?.offers ?? []
}

export async function createAdminOffer(payload) {
  const token = authTokenOrThrow()
  const data = await apiJson('/api/admin/offers', { method: 'POST', authToken: token, body: payload })
  return data?.offer ?? null
}

export async function updateAdminOffer(offerId, payload) {
  const token = authTokenOrThrow()
  const data = await apiJson(`/api/admin/offers/${encodeURIComponent(offerId)}`, {
    method: 'PATCH',
    authToken: token,
    body: payload,
  })
  return data?.offer ?? null
}

export async function deleteAdminOffer(offerId) {
  const token = authTokenOrThrow()
  await apiJson(`/api/admin/offers/${encodeURIComponent(offerId)}`, { method: 'DELETE', authToken: token })
  return true
}

export async function fetchAdminOrders({ q, status } = {}) {
  const token = authTokenOrThrow()
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status && status !== 'all') params.set('status', status)
  const qs = params.toString()
  const data = await apiJson(`/api/admin/orders${qs ? `?${qs}` : ''}`, { authToken: token })
  return data?.orders ?? []
}

export async function updateAdminOrderStatus(orderId, status) {
  const token = authTokenOrThrow()
  const data = await apiJson(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    authToken: token,
    body: { status },
  })
  return data?.order ?? null
}

export async function fetchAdminUsers({ q } = {}) {
  const token = authTokenOrThrow()
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  const qs = params.toString()
  const data = await apiJson(`/api/admin/users${qs ? `?${qs}` : ''}`, { authToken: token })
  return data?.users ?? []
}

export async function fetchAdminAnalytics() {
  const token = authTokenOrThrow()
  return apiJson('/api/admin/analytics', { authToken: token })
}
