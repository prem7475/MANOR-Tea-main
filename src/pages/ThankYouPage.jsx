import React, { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Truck } from 'lucide-react'

import styles from './ThankYouPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useOrdersStore } from '../hooks/useOrdersStore.js'
import { formatINR } from '../utils/currency.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function ThankYouPage() {
  useDocumentTitle('Thank you')

  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const lastOrderId = useOrdersStore((s) => s.lastOrderId)
  const getOrderById = useOrdersStore((s) => s.getOrderById)

  const order = useMemo(() => getOrderById(orderId || lastOrderId), [getOrderById, lastOrderId, orderId])

  return (
    <PageShell
      title="Thank you"
      subtitle="Your order is confirmed. You can track it any time — this demo updates status quickly so you can see the flow."
      actions={
        <Button to="/products" variant="secondary">
          Continue shopping
        </Button>
      }
    >
      <Card className={styles.card}>
        <div className={styles.header}>
          <CheckCircle2 size={22} />
          <div>
            <div className={styles.title}>Order placed</div>
            <div className={styles.subtitle}>Mock payment successful</div>
          </div>
        </div>

        {order ? (
          <div className={styles.body}>
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
                <span className={styles.label}>Delivery</span>
                <span className={styles.value}>2–4 days (demo)</span>
              </div>
            </div>

            <div className={styles.items}>
              {order.items?.slice(0, 4).map((i) => (
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
              {order.items?.length > 4 ? <div className={styles.more}>+{order.items.length - 4} more</div> : null}
            </div>

            <div className={styles.cta}>
              <Link className={styles.track} to={`/track-order?orderId=${encodeURIComponent(order.id)}`}>
                <Truck size={18} /> Track your order
              </Link>
              <Button to="/helpdesk" variant="ghost">
                Need help?
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.body}>
            <div className={styles.note}>Could not find an order. Try the Track Order page.</div>
            <Button to="/track-order" variant="secondary">
              Track an order
            </Button>
          </div>
        )}
      </Card>
    </PageShell>
  )
}

