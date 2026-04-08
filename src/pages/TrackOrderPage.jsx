import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageCheck, PackageOpen, Truck } from 'lucide-react'

import styles from './TrackOrderPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { fetchOrder } from '../services/ordersApi.js'
import { formatINR } from '../utils/currency.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function normalizeStatus(value) {
  const status = String(value ?? '').trim()
  if (!status) return 'Pending'

  const allowed = new Set(['Pending', 'Processing', 'Shipped', 'Delivered'])
  if (allowed.has(status)) return status

  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  if (allowed.has(normalized)) return normalized

  return 'Pending'
}

function getTimeline(statusValue) {
  const status = normalizeStatus(statusValue)
  const isDelivered = status === 'Delivered'

  const steps = [
    { key: 'Pending', label: 'Order placed', icon: <PackageOpen size={18} /> },
    { key: 'Processing', label: 'Processing', icon: <PackageCheck size={18} /> },
    { key: 'Shipped', label: 'Shipped', icon: <Truck size={18} /> },
    { key: 'Delivered', label: 'Delivered', icon: <PackageCheck size={18} /> },
  ]

  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === status))

  return steps.map((s, index) => ({
    ...s,
    done: isDelivered ? true : index < currentIndex,
    current: !isDelivered && index === currentIndex,
  }))
}

const RECENTS_KEY = 'manor:recent-orders:v1'

function readRecents() {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecents(next) {
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export default function TrackOrderPage() {
  useDocumentTitle('Track order')

  const [params, setParams] = useSearchParams()
  const initial = params.get('orderId') ?? ''

  const [orderId, setOrderId] = useState(initial)
  const [selectedId, setSelectedId] = useState(initial)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recents, setRecents] = useState(() => readRecents())

  const timeline = order ? getTimeline(order.status) : []

  useEffect(() => {
    if (!initial) return
    const next = initial.trim().toUpperCase()
    setSelectedId(next)
    setOrderId(next)
  }, [initial])

  const load = useCallback(async (id) => {
    const key = String(id ?? '').trim().toUpperCase()
    if (!key) {
      setOrder(null)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const nextOrder = await fetchOrder(key)
      setOrder(nextOrder)
      if (nextOrder?.id) {
        setRecents((prev) => {
          const nextRecents = [
            { id: nextOrder.id, total: nextOrder.summary?.total ?? 0 },
            ...(prev ?? []).filter((r) => r?.id !== nextOrder.id),
          ].slice(0, 6)
          writeRecents(nextRecents)
          return nextRecents
        })
      }
    } catch (err) {
      setOrder(null)
      setError(err?.message || 'Unable to load order')
    } finally {
      setLoading(false)
    }
  }, [])

  function search() {
    const id = orderId.trim().toUpperCase()
    setSelectedId(id)
    const next = new URLSearchParams(params)
    if (id) next.set('orderId', id)
    else next.delete('orderId')
    setParams(next, { replace: true })
    load(id)
  }

  useEffect(() => {
    if (!selectedId) return
    load(selectedId)
  }, [load, selectedId])

  useEffect(() => {
    if (!order?.id) return
    const id = window.setInterval(() => load(order.id), 10_000)
    return () => window.clearInterval(id)
  }, [load, order?.id])

  const actions = (
    <div className={styles.actions}>
      <div className={styles.searchRow}>
        <Input
          label="Order ID"
          name="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. MANOR-AB12CD"
          hint="Tip: place a mock order, then track it here."
          onKeyDown={(e) => {
            if (e.key === 'Enter') search()
          }}
        />
        <Button variant="secondary" onClick={search} loading={loading}>
          Track
        </Button>
      </div>
    </div>
  )

  return (
    <PageShell
      title="Track order"
      subtitle="Use your Order ID to view the current status. (Demo) Update status in Admin → Orders to see the timeline change."
      actions={actions}
    >
      {loading ? (
        <Card className={styles.empty}>
          <div className={styles.loadingRow}>
            <Spinner size={18} />
            <div>
              <div className={styles.emptyTitle}>Loading...</div>
              <div className={styles.emptyText}>Fetching your order status.</div>
            </div>
          </div>
        </Card>
      ) : order ? (
        <div className={styles.layout}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Status</div>
            <div className={styles.timeline}>
              {timeline.map((t) => (
                <div
                  key={t.key}
                  className={`${styles.step} ${t.done ? styles.stepDone : ''} ${t.current ? styles.stepCurrent : ''}`}
                >
                  <div className={styles.icon}>{t.icon}</div>
                  <div>
                    <div className={styles.stepLabel}>{t.label}</div>
                    <div className={styles.stepTime}>
                      {t.done ? 'Completed' : t.current ? 'In progress' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardTitle}>Order summary</div>
            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.label}>Order ID</span>
                <span className={styles.value}>{order.id}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>{normalizeStatus(order.status)}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>{formatINR(order.summary?.total ?? 0)}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.label}>Payment</span>
                <span className={styles.value}>{order.payment?.status ?? '—'}</span>
              </div>
            </div>

            <div className={styles.items}>
              {order.items?.map((i) => (
                <div key={i.lineId} className={styles.item}>
                  <img className={styles.itemImg} src={i.image} alt="" />
                  <div className={styles.itemText}>
                    <div className={styles.itemTitle}>
                      {i.title} · {i.quantity}×
                    </div>
                    <div className={styles.itemSub}>{formatINR(i.unitPrice)} each</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          className={styles.empty}
          title="No order found"
          text={
            error ? (
              error
            ) : (
              <>
                Enter an Order ID (example: <span className={styles.mono}>MANOR-AB12CD</span>) or place an order from checkout.
              </>
            )
          }
          action={
            <Button to="/products" variant="secondary">
              Shop products
            </Button>
          }
        />
      )}

      {recents.length ? (
        <Card className={styles.history}>
          <div className={styles.cardTitle}>Recent orders (this device)</div>
          <div className={styles.historyList}>
            {recents.map((o) => (
              <button
                key={o.id}
                type="button"
                className={styles.historyRow}
                onClick={() => {
                  setOrderId(o.id)
                  setSelectedId(o.id)
                  const next = new URLSearchParams(params)
                  next.set('orderId', o.id)
                  setParams(next, { replace: true })
                  load(o.id)
                }}
              >
                <span className={styles.historyId}>{o.id}</span>
                <span className={styles.historyTotal}>{formatINR(o.total ?? 0)}</span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </PageShell>
  )
}
