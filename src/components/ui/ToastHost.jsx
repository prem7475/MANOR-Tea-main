import React from 'react'
import styles from './ToastHost.module.css'
import { X } from 'lucide-react'
import { useUiStore } from '../../hooks/useUiStore.js'

function toneClass(intent) {
  if (intent === 'success') return styles.success
  if (intent === 'error') return styles.error
  if (intent === 'warning') return styles.warning
  return styles.info
}

export default function ToastHost() {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismissToast)

  if (!toasts.length) return null

  return (
    <div className={styles.viewport} role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${toneClass(t.intent)}`} role="status">
          <div className={styles.body}>
            {t.title && <div className={styles.title}>{t.title}</div>}
            <div className={styles.message}>{t.message}</div>
          </div>
          <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => dismiss(t.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

