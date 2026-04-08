import React, { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import styles from './AdminCustomTeaOrdersPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Badge from '../../components/ui/Badge.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import AdminTable from '../components/AdminTable.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { fetchAdminOrders } from '../services/adminApi.js'
import { formatINR } from '../../utils/currency.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Skeleton from '../../components/ui/Skeleton.jsx'

function formatDateShort(value) {
  const d = value ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function joinLabels(list) {
  if (!Array.isArray(list) || !list.length) return '—'
  return list.map((f) => String(f.label ?? '').split(' (')[0]).join(', ')
}

export default function AdminCustomTeaOrdersPage() {
  useDocumentTitle('Admin custom tea orders')

  const notify = useUiStore((s) => s.notify)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const next = await fetchAdminOrders()
        if (cancelled) return
        setOrders(Array.isArray(next) ? next : [])
      } catch (err) {
        if (cancelled) return
        notify({ title: 'Load failed', message: err?.message || 'Unable to load orders', intent: 'error' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = window.setInterval(load, 20_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [notify])

  const rows = useMemo(() => {
    const out = []
    for (const o of orders) {
      for (const i of o.items ?? []) {
        if (i.kind !== 'custom') continue
        out.push({
          key: `${o.id}:${i.lineId}`,
          order: o,
          item: i,
        })
      }
    }
    return out
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(({ order, item }) => {
      const hay = `${order.id} ${order.customer?.fullName ?? ''} ${item.title ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, rows])

  const selected = useMemo(() => rows.find((r) => r.key === selectedKey) ?? null, [rows, selectedKey])

  const columns = useMemo(
    () => [
      {
        key: 'order',
        header: 'Order',
        width: '150px',
        render: (r) => <span className={styles.mono}>{r.order.id}</span>,
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (r) => (
          <div>
            <div className={styles.customerName}>{r.order.customer?.fullName ?? '—'}</div>
            <div className={styles.customerMeta}>{r.order.customer?.phone || r.order.customer?.email || ''}</div>
          </div>
        ),
      },
      {
        key: 'blend',
        header: 'Blend',
        render: (r) => (
          <div className={styles.blend}>
            <div className={styles.blendTitle}>{r.item.meta?.teaType?.label ?? 'Custom tea'}</div>
            <div className={styles.blendMeta}>
              {r.item.meta?.strength?.label ?? '—'} • {joinLabels(r.item.meta?.flavours)}
            </div>
          </div>
        ),
      },
      {
        key: 'packaging',
        header: 'Packaging',
        width: '160px',
        render: (r) => r.item.meta?.packaging?.label ?? '—',
      },
      {
        key: 'total',
        header: 'Line total',
        width: '140px',
        align: 'right',
        render: (r) => formatINR((r.item.unitPrice ?? 0) * (r.item.quantity ?? 0)),
      },
      {
        key: 'view',
        header: 'View',
        width: '90px',
        align: 'right',
        render: (r) => (
          <IconButton label="View request" variant="soft" onClick={() => setSelectedKey(r.key)}>
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
          <div className={styles.title}>Custom tea orders</div>
          <div className={styles.subtitle}>Review tea type, strength, flavours, and packaging selections.</div>
        </div>
        <Button to="/admin/orders" variant="secondary" size="sm">
          View all orders
        </Button>
      </div>

      <Card className={styles.controls}>
        <Input
          label="Search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID or customer name..."
        />
        <div className={styles.hint}>This list shows custom blend lines from orders in MongoDB.</div>
      </Card>

      {loading && filtered.length === 0 ? (
        <div className={styles.skeletonTable} aria-label="Loading custom tea orders">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={`custom-skel-${idx}`} className={styles.skeletonRow}>
              <Skeleton className={styles.skeletonCellWide} />
              <Skeleton className={styles.skeletonCell} />
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
          rows={filtered}
          getRowKey={(r) => r.key}
          emptyLabel={loading ? 'Loading...' : 'No custom tea orders yet.'}
          emptyText={!loading ? 'Custom blends appear when customers use the builder.' : undefined}
          emptyAction={
            !loading ? (
              <Button to="/custom-tea-builder" variant="secondary">
                Try builder
              </Button>
            ) : null
          }
        />
      )}

      <AdminModal
        open={Boolean(selected)}
        title={selected ? `Custom blend · ${selected.order.id}` : 'Custom blend'}
        onClose={() => setSelectedKey('')}
        footer={
          <Button variant="ghost" onClick={() => setSelectedKey('')}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div className={styles.details}>
            <div className={styles.detailGrid}>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Placed</div>
                <div className={styles.detailValue}>{formatDateShort(selected.order.createdAt)}</div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Status</div>
                <div className={styles.detailValue}>
                  <Badge tone="neutral">{selected.order.status ?? 'Pending'}</Badge>
                </div>
              </div>
              <div className={styles.detailBlock}>
                <div className={styles.detailLabel}>Line total</div>
                <div className={styles.detailValue}>
                  {formatINR((selected.item.unitPrice ?? 0) * (selected.item.quantity ?? 0))}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Blend details</div>
              <div className={styles.sectionBody}>
                <div className={styles.kv}>
                  <div className={styles.k}>Tea type</div>
                  <div className={styles.v}>{selected.item.meta?.teaType?.label ?? '—'}</div>
                </div>
                <div className={styles.kv}>
                  <div className={styles.k}>Strength</div>
                  <div className={styles.v}>{selected.item.meta?.strength?.label ?? '—'}</div>
                </div>
                <div className={styles.kv}>
                  <div className={styles.k}>Flavours</div>
                  <div className={styles.v}>{joinLabels(selected.item.meta?.flavours)}</div>
                </div>
                <div className={styles.kv}>
                  <div className={styles.k}>Packaging</div>
                  <div className={styles.v}>{selected.item.meta?.packaging?.label ?? '—'}</div>
                </div>
                {selected.item.meta?.note ? (
                  <div className={styles.note}>
                    <div className={styles.k}>Note</div>
                    <div className={styles.v}>{selected.item.meta.note}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  )
}
