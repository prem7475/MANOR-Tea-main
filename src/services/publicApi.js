import { apiJson } from './apiClient.js'

export async function fetchPincode(code) {
  if (!code) return null
  const data = await apiJson(`/api/public/pincode/${encodeURIComponent(code)}`)
  return data?.pincode ?? null
}

export async function fetchSiteSettings() {
  const data = await apiJson('/api/public/settings')
  return data?.settings ?? null
}

export async function sendContactMessage(payload) {
  await apiJson('/api/public/contact', { method: 'POST', body: payload })
  return true
}
