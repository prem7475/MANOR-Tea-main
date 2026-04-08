import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'

import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import SkipLink from '../components/layout/SkipLink.jsx'
import ToastHost from '../components/ui/ToastHost.jsx'
import { useScrollToTop } from '../hooks/useScrollToTop.js'
import { useProductsStore } from '../hooks/useProductsStore.js'
import { useOffersStore } from '../hooks/useOffersStore.js'
import { prefetchCriticalRoutes } from '../utils/routePrefetch.js'
import styles from './RootLayout.module.css'

export default function RootLayout() {
  useScrollToTop()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const loadProducts = useProductsStore((s) => s.load)
  const loadOffers = useOffersStore((s) => s.load)

  useEffect(() => {
    loadProducts()
    loadOffers()
  }, [loadOffers, loadProducts])

  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 600))
    const id = idle(() => prefetchCriticalRoutes())
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [])

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }

  return (
    <div className={styles.shell}>
      <SkipLink />
      <Header />

      <main id="main" className={styles.main}>
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={location.pathname}
            className={`${styles.page} manorEnter`}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={transition}
          >
            <Outlet />
          </Motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <ToastHost />
    </div>
  )
}
