import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BadgePercent,
  LayoutDashboard,
  Leaf,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'

import styles from './AdminSidebar.module.css'
import IconButton from '../../components/ui/IconButton.jsx'

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/custom-orders', label: 'Custom Tea Orders', icon: Leaf },
  { to: '/admin/offers', label: 'Offers', icon: BadgePercent },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar({ open, onClose, onLogout }) {
  const navigate = useNavigate()

  const linkClassName = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.linkActive : ''}`

  const content = (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      <div className={styles.top}>
        <button type="button" className={styles.brand} onClick={() => navigate('/admin')}>
          <img className={styles.logo} src="/ManorLogo.png" alt="" />
          <div className={styles.brandText}>
            <div className={styles.wordmark}>MANOR</div>
            <div className={styles.caption}>Admin Panel</div>
          </div>
        </button>

        <div className={styles.nav} role="list">
          {items.map((i) => {
            const Icon = i.icon
            return (
              <NavLink key={i.to} to={i.to} className={linkClassName} role="listitem">
                <span className={styles.icon}>
                  <Icon size={18} />
                </span>
                <span className={styles.label}>{i.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      <div className={styles.bottom}>
        <button type="button" className={styles.logout} onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>

        <div className={styles.hint}>
          Backend-connected admin panel. For production, add role-based access and audit logs.
        </div>
      </div>
    </aside>
  )

  if (!open) return <div className={styles.desktopOnly}>{content}</div>

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerTop}>
          <div className={styles.drawerTitle}>Menu</div>
          <IconButton label="Close menu" variant="soft" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {content}
      </div>
    </div>
  )
}
