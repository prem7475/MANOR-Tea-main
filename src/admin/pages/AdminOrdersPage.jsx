import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import styles from './AdminOrdersPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Badge from '../../components/ui/Badge.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import AdminTable from '../components/AdminTable.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { fetchAdminOrders, updateAdminOrderStatus } from '../services/adminApi.js'
import { formatINR } from '../../utils/currency.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

function formatDateTime(value) {
  const d = value ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusTone(status) {
  const s = String(status ?? 'Pending').toLowerCase()
  if (s === 'delivered') return 'accent'
  if (s === 'shipped') return 'accent'
  if (s === 'processing') return 'neutral'
  return 'neutral'
}

function customMetaText(item) {
  if (!item?.meta) return null
  const parts = []
  if (item.meta.teaType?.label) parts.push(item.meta.teaType.label)
  if (item.meta.strength?.label) parts.push(`${item.meta.strength.label} strength`)
  if (Array.isArray(item.meta.flavours) && item.meta.flavours.length) {
    parts.push(item.meta.flavours.map((f) => String(f.label ?? '').split(' (')[0]).join(', '))
  }
  if (item.meta.packaging?.label) parts.push(item.meta.packaging.label)
  if (item.meta.note) parts.push('Gift note included')
  return parts.length ? parts.join(' · ') : null
}

export default function AdminOrdersPage() {
  useDocumentTitle('Admin orders')

  const notify = useUiStore((s) => s.notify)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const next = await fetchAdminOrders({ q: query, status: statusFilter })
        if (cancelled) return
        setOrders(Array.isArray(next) ? next : [])
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unable to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query, statusFilter])

  useEffect(() => {
    const id = window.setInterval(() => {
      fetchAdminOrders({ q: query, status: statusFilter })
        .then((next) => setOrders(Array.isArray(next) ? next : []))
        .catch(() => {})
    }, 10_000)
    return () => window.clearInterval(id)
  }, [query, statusFilter])

  const selected = useMemo(() => {
    if (!selectedId) return null
    const id = selectedId.trim().toUpperCase()
    return orders.find((o) => o.id.toUpperCase() === id) ?? null
  }, [orders, selectedId])

  const onUpdateStatus = useCallback(async (orderId, status) => {
    const id = String(orderId ?? '').trim().toUpperCase()
    if (!id) return

    setOrders((prev) =>
      (Array.isArray(prev) ? prev : []).map((o) => (o.id.toUpperCase() === id ? { ...o, status } : o)),
    )

    try {
      const updated = await updateAdminOrderStatus(id, status)
      if (updated?.status) {
        setOrders((prev) =>
          (Array.isArray(prev) ? prev : []).map((o) => (o.id.toUpperCase() === id ? { ...o, ...updated } : o)),
        )
      }
      notify({ title: 'Status updated', message: `${id} → ${status}`, intent: 'success' })
    } catch (err) {
      notify({ title: 'Update failed', message: err?.message || 'Unable to update status', intent: 'error' })
    }
  }, [notify])

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Order',
        width: '150px',
        render: (o) => <span className={styles.mono}>{o.id}</span>,
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (o) => (
          <div>
            <div className={styles.customerName}>{o.customer?.fullName ?? '—'}</div>
            <div className={styles.customerMeta}>{o.customer?.phone || o.customer?.email || ''}</div>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Placed',
        width: '190px',
        render: (o) => formatDateTime(o.createdAt),
      },
      {
        key: 'status',
        header: 'Status',
        width: '170px',
        render: (o) => (
          <select
            className={styles.statusSelect}
            value={o.status ?? 'Pending'}
            onChange={(e) => onUpdateStatus(o.id, e.target.value)}
            aria-label={`Update status for ${o.id}`}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        ),
      },
      {
        key: 'total',
        header: 'Total',
        width: '140px',
        align: 'right',
        render: (o) => formatINR(o.summary?.total ?? 0),
      },
      {
        key: 'actions',
        header: 'View',
        width: '90px',
        align: 'right',
        render: (o) => (
          <IconButton label="View order" variant="soft" onClick={() => setSelectedId(o.id)}>
            <Eye size={18} />
          </IconButton>
        ),
      },
    ],
    [onUpdateStatus],
  )

      return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Orders</div>
          <div className={styles.subtitle}>
            Update status, review items, and check payment notes. Orders are stored in MongoDB for this rebuild.
          </div>
        </div>
        <Button to="/products" variant="ghost" size="sm">
          Place a test order
        </Button>
      </div>

      <Card className={styles.controls}>
        <Input
          label="Search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID, name, phone, email..."
        />
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </label>
      </Card>

      {error ? <div className={styles.customerMeta}>{error}</div> : null}

      {loading && orders.length === 0 ? (
        <div className={styles.skeletonTable} aria-label="Loading orders">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`order-skel-${idx}`} className={styles.skeletonRow}>
              <Skeleton className={styles.skeletonCellWide} />
              <Skeleton className={styles.skeletonCell} />
              <Skeleton className={styles.skeletonCell} />
              <Skeleton className={styles.skeletonCell} />
            </div>
          ))}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          rows={orders}
          getRowKey={(o) => o.id}
          emptyLabel={loading ? 'Loading orders...' : 'No orders yet.'}
          emptyText={!loading ? 'Place a test order to see the flow in action.' : undefined}
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
        title={selected ? `Order ${selected.id}` : 'Order'}
        onClose={() => setSelectedId('')}
        footer={
          selected ? (
            <>
              <Button variant="ghost" onClick={() => setSelectedId('')}>
                Close
              </Button>
              <Badge tone={statusTone(selected.status)}>{selected.status ?? 'Pending'}</Badge>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className={styles.details}>
            <div className={styles.detailGrid}>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Placed</div>
                <div className={styles.detailValue}>{formatDateTime(selected.createdAt)}</div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Payment</div>
                <div className={styles.detailValue}>{selected.payment?.status ?? '—'}</div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Total</div>
                <div className={styles.detailValue}>{formatINR(selected.summary?.total ?? 0)}</div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Customer</div>
              <div className={styles.sectionBody}>
                <div className={styles.customerRow}>
                  <div>
                    <div className={styles.customerName}>{selected.customer?.fullName ?? '—'}</div>
                    <div className={styles.customerMeta}>{selected.customer?.phone || selected.customer?.email || ''}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Delivery address</div>
              <div className={styles.sectionBody}>
                <div className={styles.address}>
                  {[selected.address?.line1, selected.address?.line2, selected.address?.city, selected.address?.state, selected.address?.pincode]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Items</div>
              <div className={styles.items}>
                {(selected.items ?? []).map((i) => (
                  <div key={i.lineId} className={styles.item}>
                    <img className={styles.itemImg} src={i.image} alt="" loading="lazy" />
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>
                        {i.title} <span className={styles.itemQty}>× {i.quantity}</span>
                      </div>
                      <div className={styles.itemMeta}>
                        {formatINR(i.unitPrice)} each • {formatINR((i.unitPrice ?? 0) * (i.quantity ?? 0))}
                      </div>
                      {i.kind === 'custom' ? <div className={styles.itemCustom}>{customMetaText(i)}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  )
}
