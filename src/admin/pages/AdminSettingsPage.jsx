import React, { useState } from 'react'
import { KeyRound, LogOut, Shield, Wallet } from 'lucide-react'

import styles from './AdminSettingsPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'
import { useAdminSettingsStore } from '../hooks/useAdminSettingsStore.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function AdminSettingsPage() {
  useDocumentTitle('Admin settings')

  const admin = useAdminAuthStore((s) => s.admin)
  const logout = useAdminAuthStore((s) => s.logout)
  const notify = useUiStore((s) => s.notify)

  const payments = useAdminSettingsStore((s) => s.payments)
  const setPaymentEnabled = useAdminSettingsStore((s) => s.setPaymentEnabled)
  const notifications = useAdminSettingsStore((s) => s.notifications)
  const setNotifications = useAdminSettingsStore((s) => s.setNotifications)

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const pwdError = getPasswordError(pwd)

  function savePassword() {
    if (pwdError) {
      notify({ title: 'Check password', message: pwdError, intent: 'warning' })
      return
    }
    setPwd({ current: '', next: '', confirm: '' })
    notify({ title: 'Password updated (demo)', message: 'Connect to backend to make this real.', intent: 'info' })
  }


  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Settings</div>
          <div className={styles.subtitle}>Profile, security, and payment toggles (UI) in the MANOR design system.</div>
        </div>
      </div>

      <div className={styles.grid}>
        <Card className={styles.panel}>
          <div className={styles.panelTitle}>
            <Shield size={18} /> Admin profile
          </div>
          <div className={styles.kv}>
            <div className={styles.k}>Name</div>
            <div className={styles.v}>{admin?.name ?? 'Admin'}</div>
          </div>
          <div className={styles.kv}>
            <div className={styles.k}>Email</div>
            <div className={styles.v}>{admin?.email ?? '—'}</div>
          </div>

          <div className={styles.panelActions}>
            <Button
              variant="secondary"
              onClick={() => {
                logout()
                notify({ title: 'Signed out', message: 'Admin session cleared (demo).', intent: 'info' })
              }}
            >
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTitle}>
            <KeyRound size={18} /> Change password
          </div>
          <div className={styles.panelSub}>UI only. For production, implement backend auth + password update.</div>
          <div className={styles.form}>
            <Input
              label="Current password"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd((s) => ({ ...s, current: e.target.value }))}
              placeholder="••••••••"
            />
            <Input
              label="New password"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd((s) => ({ ...s, next: e.target.value }))}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((s) => ({ ...s, confirm: e.target.value }))}
              placeholder="Repeat password"
              error={pwdError}
            />
            <Button onClick={savePassword}>Update password</Button>
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTitle}>
            <Wallet size={18} /> Payment settings (UI)
          </div>
          <div className={styles.panelSub}>Toggle methods shown in checkout (demo setting store).</div>

          <div className={styles.checkGrid}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={payments.upi}
                onChange={(e) => setPaymentEnabled('upi', e.target.checked)}
              />
              UPI
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={payments.card}
                onChange={(e) => setPaymentEnabled('card', e.target.checked)}
              />
              Card
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={payments.cod}
                onChange={(e) => setPaymentEnabled('cod', e.target.checked)}
              />
              Cash on delivery
            </label>
          </div>

          <label className={styles.checkWide}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            Enable admin notifications
          </label>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTitle}>Backend</div>
          <div className={styles.panelSub}>
            This admin panel is now connected to backend APIs (Node.js + MongoDB). For production, add role-based
            access, audit logs, and payment verification.
          </div>
          <div className={styles.panelActions}>
            <Button
              variant="ghost"
              onClick={() => notify({ title: 'Tip', message: 'Run `cd server && npm run seed` to seed admin + demo products.', intent: 'info' })}
            >
              How to seed demo data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function getPasswordError(pwd) {
  if (!pwd.next && !pwd.confirm && !pwd.current) return ''
  if (pwd.next.length < 8) return 'New password should be at least 8 characters (demo UI).'
  if (pwd.next !== pwd.confirm) return 'New passwords do not match.'
  return ''
}
