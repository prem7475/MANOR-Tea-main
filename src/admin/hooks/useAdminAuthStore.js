import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { adminLogin, adminLogout, adminMe } from '../services/adminApi.js'

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      status: 'unknown', // unknown | authenticated | guest
      isAuthenticated: false,
      admin: null,
      token: null,

      login: async ({ email, password }) => {
        const nextEmail = normalizeEmail(email)
        const nextPassword = String(password ?? '')

        set({ status: 'unknown' })

        try {
          const data = await adminLogin({ email: nextEmail, password: nextPassword })
          const token = data?.token
          const admin = data?.admin
          if (!token) return { ok: false, error: 'Missing token from server' }

          set({
            status: 'authenticated',
            isAuthenticated: true,
            token,
            admin: admin ?? { email: nextEmail, name: 'Admin' },
          })

          return { ok: true }
        } catch (err) {
          set({ status: 'guest', isAuthenticated: false, token: null, admin: null })
          return { ok: false, error: err?.message || 'Unable to sign in' }
        }
      },

      logout: async () => {
        try {
          await adminLogout()
        } catch {
          // ignore
        } finally {
          set({ status: 'guest', isAuthenticated: false, token: null, admin: null })
        }
      },

      checkSession: async () => {
        const token = get().token
        if (!token) {
          set({ status: 'guest', isAuthenticated: false, admin: null })
          return { ok: false }
        }

        try {
          const data = await adminMe(token)
          set({
            status: 'authenticated',
            isAuthenticated: true,
            admin: data?.admin ?? get().admin ?? { email: '', name: 'Admin' },
          })
          return { ok: true }
        } catch {
          set({ status: 'guest', isAuthenticated: false, token: null, admin: null })
          return { ok: false }
        }
      },
    }),
    {
      name: 'manor:admin:auth:v2',
      version: 2,
      partialize: (state) => ({ token: state.token }),
    },
  ),
)
