import { create } from 'zustand'
import { fetchProducts } from '../services/productsApi.js'
import { products as seededProducts } from '../assets/data/products.js'

export const useProductsStore = create((set, get) => ({
  products: seededProducts ?? [],
  status: 'idle', // idle | loading | success | error
  error: null,
  lastLoadedAt: 0,

  load: async () => {
    const { status } = get()
    if (status === 'loading') return

    set({ status: 'loading', error: null })
    try {
      const products = await fetchProducts()
      set({
        products: Array.isArray(products) ? products : [],
        status: 'success',
        error: null,
        lastLoadedAt: Date.now(),
      })
    } catch (err) {
      set({
        status: 'error',
        error: err?.message || 'Unable to load products',
      })
    }
  },

  refresh: async () => {
    set({ status: 'idle' })
    await get().load()
  },

  getById: (id) => get().products.find((p) => p.id === id) ?? null,
  getBySlug: (slug) => get().products.find((p) => p.slug === slug) ?? null,
  getBySlugOrId: (value) => {
    const key = String(value ?? '').trim()
    if (!key) return null
    return get().getBySlug(key) ?? get().getById(key)
  },
}))

