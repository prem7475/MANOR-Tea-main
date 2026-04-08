import React, { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import styles from './AdminUsersPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import Badge from '../../components/ui/Badge.jsx'
import AdminTable from '../components/AdminTable.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { fetchAdminOrders, fetchAdminUsers } from '../services/adminApi.js'
import { formatINR } from '../../utils/currency.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

function formatDateShort(value) {
  const d = value ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminUsersPage() {
  useDocumentTitle('Admin users')

  const notify = useUiStore((s) => s.notify)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const next = await fetchAdminUsers({ q: query })
        if (cancelled) return
        setUsers(Array.isArray(next) ? next : [])
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unable to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query])

  const selected = useMemo(() => {
    if (!selectedKey) return null
    return users.find((u) => u.key === selectedKey) ?? null
  }, [selectedKey, users])

  useEffect(() => {
    if (!selected) {
      setUserOrders([])
      return
    }

    let cancelled = false
    setOrdersLoading(true)
    fetchAdminOrders({ q: selected.key })
      .then((next) => {
        if (cancelled) return
        setUserOrders(Array.isArray(next) ? next : [])
      })
      .catch((err) => {
        if (cancelled) return
        notify({ title: 'Could not load orders', message: err?.message || 'Try again', intent: 'error' })
      })
      .finally(() => {
        if (cancelled) return
        setOrdersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [notify, selected])

  const columns = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        render: (u) => (
          <div>
            <div className={styles.userName}>{u.name}</div>
            <div className={styles.userMeta}>{u.email || u.phone || ''}</div>
          </div>
        ),
      },
      {
        key: 'orders',
        header: 'Orders',
        width: '120px',
        align: 'right',
        render: (u) => u.orders,
      },
      {
        key: 'spent',
        header: 'Spent',
        width: '160px',
        align: 'right',
        render: (u) => formatINR(u.spent),
      },
      {
        key: 'lastOrderAt',
        header: 'Last order',
        width: '150px',
        render: (u) => formatDateShort(u.lastOrderAt),
      },
      {
        key: 'actions',
        header: 'View',
        width: '90px',
        align: 'right',
        render: (u) => (
          <IconButton label="View user" variant="soft" onClick={() => setSelectedKey(u.key)}>
            <Eye size={18} />
          </IconButton>
        ),
      },
    ],
    [],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Users</div>
          <div className={styles.subtitle}>
            Users are derived from checkout details stored in MongoDB orders.
          </div>
        </div>
      </div>

      <Card className={styles.controls}>
        <Input
          label="Search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone..."
        />
        <div className={styles.hint}>
          Tip: place an order with an email to see users appear here.
        </div>
      </Card>

      {error ? <div className={styles.userMeta}>{error}</div> : null}

      {loading && users.length === 0 ? (
        <div className={styles.skeletonTable} aria-label="Loading users">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`user-skel-${idx}`} className={styles.skeletonRow}>
              <Skeleton className={styles.skeletonCellWide} />
              <Skeleton className={styles.skeletonCell} />
              <Skeleton className={styles.skeletonCell} />
            </div>
          ))}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          rows={users}
          getRowKey={(u) => u.key}
          emptyLabel={loading ? 'Loading users...' : 'No users yet.'}
          emptyText={!loading ? 'Users appear once an order is placed.' : undefined}
          emptyAction={
            !loading ? (
              <Button to="/products" variant="secondary">
                Place test order
              </Button>
            ) : null
          }
        />
      )}

      <AdminModal
        open={Boolean(selected)}
        title={selected ? selected.name : 'User'}
        onClose={() => setSelectedKey('')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedKey('')}>
              Close
            </Button>
          </>
        }
      >
        {selected ? (
          <div className={styles.details}>
            <div className={styles.detailGrid}>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Contact</div>
                <div className={styles.detailValue}>{selected.email || selected.phone || '—'}</div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Orders</div>
                <div className={styles.detailValue}>{selected.orders}</div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Spent (mock)</div>
                <div className={styles.detailValue}>{formatINR(selected.spent)}</div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Order history</div>
              <div className={styles.orderList}>
                {ordersLoading ? (
                  <div className={styles.empty}>Loading orders...</div>
                ) : userOrders.length ? (
                  userOrders.map((o) => (
                    <div key={o.internalId ?? o.id} className={styles.orderRow}>
                      <div className={styles.orderId}>{o.id}</div>
                      <div className={styles.orderMeta}>{formatDateShort(o.createdAt)}</div>
                      <Badge tone="neutral">{o.status ?? 'Pending'}</Badge>
                      <div className={styles.orderTotal}>{formatINR(o.summary?.total ?? 0)}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>No orders.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  )
}
