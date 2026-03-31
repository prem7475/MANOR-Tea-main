import { create } from 'zustand'
import { createId } from '../utils/id.js'

// Lightweight UI store for transient toasts.
export const useUiStore = create((set, get) => ({
  toasts: [],
  notify: ({ title, message, intent = 'info', durationMs = 3200 }) => {
    const id = createId('toast')
    const toast = { id, title, message, intent, createdAt: Date.now() }
    set((state) => ({ toasts: [toast, ...state.toasts].slice(0, 3) }))

    window.setTimeout(() => {
      get().dismissToast(id)
    }, durationMs)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}))
