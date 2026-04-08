import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'

export default function RequireAdminAuth({ children }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const status = useAdminAuthStore((s) => s.status)
  const checkSession = useAdminAuthStore((s) => s.checkSession)
  const location = useLocation()

  useEffect(() => {
    if (status !== 'unknown') return
    checkSession()
  }, [checkSession, status])

  if (status === 'unknown') {
    return (
      <div style={{ padding: 24, color: 'rgba(var(--ink-rgb), 0.72)' }} aria-busy="true">
        Checking admin session...
      </div>
    )
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/admin/login?next=${next}`} replace />
  }

  return children
}
