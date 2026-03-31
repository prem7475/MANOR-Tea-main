import React, { useEffect, useMemo, useState } from 'react'

import styles from './OrderSummary.module.css'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import { formatINR } from '../../utils/currency.js'
import { useCartStore } from '../../hooks/useCartStore.js'
import { useUiStore } from '../../hooks/useUiStore.js'

export default function OrderSummary({ cta, onCta, compact = false }) {
  const items = useCartStore((s) => s.items)
  const offerCode = useCartStore((s) => s.offerCode)
  const setOfferCode = useCartStore((s) => s.setOfferCode)
  const clearOffer = useCartStore((s) => s.clearOffer)
  const getSummary = useCartStore((s) => s.getSummary)
  const notify = useUiStore((s) => s.notify)

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
    [items],
  )

  const summary = getSummary()
  const [draftCode, setDraftCode] = useState(offerCode ?? '')

  useEffect(() => {
    setDraftCode(offerCode ?? '')
  }, [offerCode])

  const offerHint = useMemo(() => {
    if (!draftCode) return 'Try MANOR10 or WELCOME100'
    if (!summary.offer) return 'Invalid code'
    if (summary.subtotal < summary.offer.minOrder)
      return `Add ${formatINR(summary.offer.minOrder - summary.subtotal)} more to apply`
    return summary.offer.title
  }, [draftCode, summary.offer, summary.subtotal])

  function apply() {
    setOfferCode(draftCode)
    const s = getSummary()
    if (!s.offer) {
      notify({ title: 'Offer not found', message: 'Please check the code.', intent: 'warning' })
      return
    }
    if (s.subtotal < s.offer.minOrder) {
      notify({
        title: 'Almost there',
        message: `Add ${formatINR(s.offer.minOrder - s.subtotal)} more to use ${s.offer.code}.`,
        intent: 'info',
      })
      return
    }
    notify({ title: 'Offer applied', message: s.offer.title, intent: 'success' })
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Order summary</div>
        <div className={styles.note}>
          {itemCount} item{itemCount === 1 ? '' : 's'} · Free delivery above ₹499
        </div>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Subtotal</span>
          <span>{formatINR(summary.subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>Discount</span>
          <span className={summary.discount ? styles.negative : ''}>
            {summary.discount ? `- ${formatINR(summary.discount)}` : '—'}
          </span>
        </div>
        <div className={styles.row}>
          <span>Shipping</span>
          <span>{summary.shipping ? formatINR(summary.shipping) : 'Free'}</span>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <span>Total</span>
          <span>{formatINR(summary.total)}</span>
        </div>
      </div>

      {!compact && (
        <div className={styles.offer}>
          <Input
            label="Offer code"
            name="offer"
            value={draftCode}
            onChange={(e) => setDraftCode(e.target.value)}
            placeholder="Enter code"
            hint={offerHint}
          />
          <div className={styles.offerActions}>
            <Button variant="secondary" onClick={apply}>
              Apply
            </Button>
            {offerCode && (
              <Button
                variant="ghost"
                onClick={() => {
                  clearOffer()
                  setDraftCode('')
                  notify({ title: 'Offer removed', message: 'Discount cleared.', intent: 'info' })
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      )}

      {cta && (
        <Button fullWidth variant="primary" disabled={summary.total === 0} onClick={onCta}>
          {cta}
        </Button>
      )}
    </Card>
  )
}
