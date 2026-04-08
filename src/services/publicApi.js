import { apiJson } from './apiClient.js'

export async function fetchPincode(code) {
  if (!code) return null
  const data = await apiJson(`/api/public/pincode/${encodeURIComponent(code)}`)
  return data?.pincode ?? null
}
