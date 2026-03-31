import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageCheck, PackageOpen, Truck } from 'lucide-react'

import styles from './TrackOrderPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useOrdersStore } from '../hooks/useOrdersStore.js'
import { formatINR } from '../utils/currency.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function getTimeline(createdAtIso) {
  const createdAt = new Date(createdAtIso).getTime()
  const now = Date.now()
  const mins = Math.max(0, (now - createdAt) / 60000)

  const checkpoints = [
    { label: 'Order placed', at: 0, icon: <PackageOpen size={18} /> },
    { label: 'Packed', at: 2, icon: <PackageCheck size={18} /> },
    { label: 'Dispatched', at: 4, icon: <Truck size={18} /> },
    { label: 'Out for delivery', at: 6, icon: <Truck size={18} /> },
    { label: 'Delivered', at: 8, icon: <PackageCheck size={18} /> },
  ]

  return checkpoints.map((c) => ({ ...c, done: mins >= c.at }))
}

export default function TrackOrderPage() {
  useDocumentTitle('Track order')

  const [params, setParams] = useSearchParams()
  const initial = params.get('orderId') ?? ''

  const [orderId, setOrderId] = useState(initial)
  const [selectedId, setSelectedId] = useState(initial)
  const [, setTick] = useState(0)

  const orders = useOrdersStore((s) => s.orders)
  const getOrderById = useOrdersStore((s) => s.getOrderById)

  const order = useMemo(() => getOrderById(selectedId), [getOrderById, selectedId])
  // `tick` triggers re-render so timeline progresses in the UI.
  const timeline = order ? getTimeline(order.createdAt) : []

  useEffect(() => {
    if (!initial) return
    setSelectedId(initial)
  }, [initial])

  useEffect(() => {
    if (!order) return
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000)
    return () => window.clearInterval(id)
  }, [order])

  function search() {
    const id = orderId.trim().toUpperCase()
    setSelectedId(id)
    const next = new URLSearchParams(params)
    if (id) next.set('orderId', id)
    else next.delete('orderId')
    setParams(next, { replace: true })
  }

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
        <Button variant="secondary" onClick={search}>
          Track
        </Button>
      </div>
    </div>
  )

  return (
    <PageShell
      title="Track order"
      subtitle="Use your Order ID to view live status. This demo updates quickly so you can see the full experience."
      actions={actions}
    >
      {order ? (
        <div className={styles.layout}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Status</div>
            <div className={styles.timeline}>
              {timeline.map((t) => (
                <div key={t.label} className={`${styles.step} ${t.done ? styles.stepDone : ''}`}>
                  <div className={styles.icon}>{t.icon}</div>
                  <div>
                    <div className={styles.stepLabel}>{t.label}</div>
                    <div className={styles.stepTime}>{t.done ? 'Completed' : 'Pending'}</div>
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
        <Card className={styles.empty}>
          <div className={styles.emptyTitle}>No order found</div>
          <div className={styles.emptyText}>
            Enter an Order ID (example: <span className={styles.mono}>MANOR-AB12CD</span>) or place a mock order
            from checkout.
          </div>
          <Button to="/products" variant="secondary">
            Shop products
          </Button>
        </Card>
      )}

      {orders.length ? (
        <Card className={styles.history}>
          <div className={styles.cardTitle}>Recent orders (this device)</div>
          <div className={styles.historyList}>
            {orders.slice(0, 6).map((o) => (
              <button
                key={o.internalId}
                type="button"
                className={styles.historyRow}
                onClick={() => {
                  setOrderId(o.id)
                  setSelectedId(o.id)
                  const next = new URLSearchParams(params)
                  next.set('orderId', o.id)
                  setParams(next, { replace: true })
                }}
              >
                <span className={styles.historyId}>{o.id}</span>
                <span className={styles.historyTotal}>{formatINR(o.summary?.total ?? 0)}</span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}
    </PageShell>
  )
}
