import React from 'react'
import { Bell, Menu, UserCircle2 } from 'lucide-react'

import styles from './AdminTopbar.module.css'
import IconButton from '../../components/ui/IconButton.jsx'
import { useAdminAuthStore } from '../hooks/useAdminAuthStore.js'

export default function AdminTopbar({ title, onMenu }) {
  const admin = useAdminAuthStore((s) => s.admin)

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.mobileMenu}>
          <IconButton label="Open menu" variant="soft" onClick={onMenu}>
            <Menu size={18} />
          </IconButton>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <IconButton label="Notifications" variant="soft">
          <Bell size={18} />
        </IconButton>

        <div className={styles.profile} aria-label="Admin profile">
          <UserCircle2 size={18} />
          <div className={styles.profileText}>
            <div className={styles.profileName}>{admin?.name ?? 'Admin'}</div>
            <div className={styles.profileEmail}>{admin?.email ?? ''}</div>
          </div>
        </div>
      </div>
    </header>
  )
}

