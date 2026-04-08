import { create } from 'zustand'
import { fetchOffers } from '../services/offersApi.js'

function normalizeCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export const useOffersStore = create((set, get) => ({
  offers: [],
  status: 'idle',
  error: null,
  lastLoadedAt: 0,

  load: async () => {
    const { status } = get()
    if (status === 'loading') return

    set({ status: 'loading', error: null })
    try {
      const offers = await fetchOffers()
      set({
        offers: Array.isArray(offers) ? offers : [],
        status: 'success',
        error: null,
        lastLoadedAt: Date.now(),
      })
    } catch (err) {
      set({
        status: 'error',
        error: err?.message || 'Unable to load offers',
      })
    }
  },

  refresh: async () => {
    set({ status: 'idle' })
    await get().load()
  },

  findByCode: (code) => {
    const normalized = normalizeCode(code)
    if (!normalized) return null
    return get().offers.find((o) => normalizeCode(o.code) === normalized) ?? null
  },
}))
