import React, { useEffect, useState } from 'react'
import { KeyRound, LogOut, Shield, Wallet } from 'lucide-react'

import styles from './AdminSettingsPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'
import { useAdminSettingsStore } from '../hooks/useAdminSettingsStore.js'
import { adminUpdatePassword, fetchAdminSettings, updateAdminSettings } from '../services/adminApi.js'
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
  const contact = useAdminSettingsStore((s) => s.contact)
  const shipping = useAdminSettingsStore((s) => s.shipping)
  const setSettings = useAdminSettingsStore((s) => s.setSettings)

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const pwdError = getPasswordError(pwd)
  const [saving, setSaving] = useState(false)
  const [contactDraft, setContactDraft] = useState(contact)
  const [shippingDraft, setShippingDraft] = useState(shipping)

  useEffect(() => {
    setContactDraft(contact)
  }, [contact])

  useEffect(() => {
    setShippingDraft(shipping)
  }, [shipping])

  useEffect(() => {
    fetchAdminSettings()
      .then((next) => {
        if (next) setSettings(next)
      })
      .catch(() => {})
  }, [setSettings])

  async function savePassword() {
    if (pwdError) {
      notify({ title: 'Check password', message: pwdError, intent: 'warning' })
      return
    }
    try {
      await adminUpdatePassword({ currentPassword: pwd.current, nextPassword: pwd.next })
      setPwd({ current: '', next: '', confirm: '' })
      notify({ title: 'Password updated', message: 'Your admin password has been updated.', intent: 'success' })
    } catch (err) {
      notify({ title: 'Update failed', message: err?.message || 'Could not update password', intent: 'error' })
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const next = await updateAdminSettings({
        payments,
        notifications,
        contact: contactDraft,
        shipping: {
          freeAbove: Number(shippingDraft.freeAbove) || 0,
          fee: Number(shippingDraft.fee) || 0,
        },
      })
      if (next) setSettings(next)
      notify({ title: 'Settings saved', message: 'Changes are live on the storefront.', intent: 'success' })
    } catch (err) {
      notify({ title: 'Save failed', message: err?.message || 'Unable to save settings', intent: 'error' })
    } finally {
      setSaving(false)
    }
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
                notify({ title: 'Signed out', message: 'Admin session cleared.', intent: 'info' })
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
          <div className={styles.panelSub}>Update your admin password securely.</div>
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
            <Wallet size={18} /> Payment settings
          </div>
          <div className={styles.panelSub}>Toggle methods shown in checkout.</div>

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

          <div className={styles.panelActions}>
            <Button variant="secondary" onClick={saveSettings} disabled={saving}>
              Save settings
            </Button>
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTitle}>Contact & shipping</div>
          <div className={styles.panelSub}>Details shown on Contact and Checkout pages.</div>
          <div className={styles.form}>
            <Input
              label="Support email"
              value={contactDraft?.email ?? ''}
              onChange={(e) => setContactDraft((s) => ({ ...s, email: e.target.value }))}
              placeholder="support@manor-tea.com"
            />
            <Input
              label="Support phone"
              value={contactDraft?.phone ?? ''}
              onChange={(e) => setContactDraft((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Location"
              value={contactDraft?.location ?? ''}
              onChange={(e) => setContactDraft((s) => ({ ...s, location: e.target.value }))}
              placeholder="Nagpur, India"
            />
            <div className={styles.row}>
              <Input
                label="Free delivery above (₹)"
                value={String(shippingDraft?.freeAbove ?? '')}
                onChange={(e) => setShippingDraft((s) => ({ ...s, freeAbove: e.target.value }))}
                inputMode="numeric"
                placeholder="499"
              />
              <Input
                label="Standard shipping fee (₹)"
                value={String(shippingDraft?.fee ?? '')}
                onChange={(e) => setShippingDraft((s) => ({ ...s, fee: e.target.value }))}
                inputMode="numeric"
                placeholder="49"
              />
            </div>
            <Button variant="secondary" onClick={saveSettings} disabled={saving}>
              Save contact & shipping
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
