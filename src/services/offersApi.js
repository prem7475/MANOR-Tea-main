import { apiJson } from './apiClient.js'

export async function fetchOffers() {
  const data = await apiJson('/api/offers')
  return data?.offers ?? []
}

