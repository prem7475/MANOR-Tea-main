import React, { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'

import styles from './AdminLoginPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function AdminLoginPage() {
  useDocumentTitle('Admin login')

  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const login = useAdminAuthStore((s) => s.login)
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const next = params.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={next} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const res = await login({ email, password })
    setIsSubmitting(false)
    if (!res.ok) setError(res.error || 'Unable to sign in')
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <img className={styles.logo} src="/ManorLogo.png" alt="MANOR" />
          <div>
            <div className={styles.wordmark}>MANOR</div>
            <div className={styles.caption}>Luxury Control Panel</div>
          </div>
        </div>

        <div className={styles.header}>
          <div className={styles.titleRow}>
            <ShieldCheck size={18} />
            <div className={styles.title}>Admin login</div>
          </div>
          <div className={styles.subtitle}>
            Secure routes are protected by your API server. Use the admin credentials configured in the backend seed.
          </div>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <Input label="Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <div className={styles.error}>{error}</div> : null}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            <Lock size={18} />
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className={styles.foot}>
          <Link to="/" className={styles.back}>
            Back to storefront
          </Link>
        </div>
      </Card>
    </div>
  )
}
