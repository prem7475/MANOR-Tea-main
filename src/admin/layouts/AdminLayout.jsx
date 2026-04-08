import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'

import styles from './AdminLayout.module.css'
import AdminSidebar from '../components/AdminSidebar.jsx'
import AdminTopbar from '../components/AdminTopbar.jsx'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'
import ToastHost from '../../components/ui/ToastHost.jsx'

function titleFromPath(pathname) {
  const seg = pathname.split('/').filter(Boolean).slice(1)[0] ?? ''
  const map = {
    '': 'Dashboard',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    users: 'Users',
    'custom-tea-orders': 'Custom Tea Orders',
    'custom-orders': 'Custom Tea Orders',
    offers: 'Offers',
    analytics: 'Analytics',
    settings: 'Settings',
  }
  return map[seg] ?? 'Admin'
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAdminAuthStore((s) => s.logout)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname])
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  function onLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className={styles.main}>
        <AdminTopbar title={title} onMenu={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={location.pathname}
              className={styles.page}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={transition}
            >
              <Outlet />
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ToastHost />
    </div>
  )
}
