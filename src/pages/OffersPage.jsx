import React from 'react'

import styles from './OffersPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { offers } from '../assets/data/offers.js'
import { useCartStore } from '../hooks/useCartStore.js'
import { useUiStore } from '../hooks/useUiStore.js'
import { formatINR } from '../utils/currency.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function OffersPage() {
  useDocumentTitle('Offers')

  const setOfferCode = useCartStore((s) => s.setOfferCode)
  const notify = useUiStore((s) => s.notify)
  const getSummary = useCartStore((s) => s.getSummary)

  function apply(code) {
    setOfferCode(code)
    const summary = getSummary()
    notify({
      title: 'Offer selected',
      message:
        summary.subtotal >= (offers.find((o) => o.code === code)?.minOrder ?? 0)
          ? `Applied ${code}`
          : `Add more items to apply ${code}`,
      intent: 'info',
    })
  }

  return (
    <PageShell
      title="Offers"
      subtitle="Premium savings — simple rules, clear benefits. Apply an offer at cart or checkout."
      actions={
        <>
          <Button to="/products" variant="secondary">
            Shop now
          </Button>
          <Button to="/cart" variant="ghost">
            Go to cart
          </Button>
        </>
      }
    >
      <div className={styles.grid}>
        {offers.map((o) => (
          <Card key={o.id} className={styles.card}>
            <div className={styles.top}>
              <Badge tone="accent">{o.code}</Badge>
              <div className={styles.title}>{o.title}</div>
              <div className={styles.desc}>{o.description}</div>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.label}>Minimum order</span>
                <span className={styles.value}>{formatINR(o.minOrder)}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.label}>Benefit</span>
                <span className={styles.value}>
                  {o.type === 'percent' ? `${o.value}% off` : `${formatINR(o.value)} off`}
                </span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => apply(o.code)} fullWidth>
              Use this offer
            </Button>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

