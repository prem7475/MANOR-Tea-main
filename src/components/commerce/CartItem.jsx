import React, { useMemo } from 'react'
import { Trash2 } from 'lucide-react'

import styles from './CartItem.module.css'
import { formatINR } from '../../utils/currency.js'
import { useCartStore } from '../../hooks/useCartStore.js'
import QuantityStepper from '../ui/QuantityStepper.jsx'
import IconButton from '../ui/IconButton.jsx'

export default function CartItem({ item }) {
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeLine = useCartStore((s) => s.removeLine)

  const lineTotal = useMemo(() => item.unitPrice * item.quantity, [item.quantity, item.unitPrice])
  const metaText = useMemo(() => {
    if (item.kind !== 'custom' || !item.meta) return null
    if (Array.isArray(item.meta.items) && item.meta.items.length) {
      return item.meta.items.map((i) => i.name).join(' · ')
    }

    const parts = []
    if (item.meta.teaType?.label) parts.push(item.meta.teaType.label)
    if (item.meta.strength?.label) parts.push(`${item.meta.strength.label} strength`)
    if (Array.isArray(item.meta.flavours) && item.meta.flavours.length) {
      parts.push(item.meta.flavours.map((f) => String(f.label ?? '').split(' (')[0]).join(', '))
    }
    if (item.meta.packaging?.label) parts.push(item.meta.packaging.label)
    if (item.meta.note) parts.push('Gift note included')
    return parts.length ? parts.join(' · ') : null
  }, [item.kind, item.meta])

  return (
    <div className={styles.row}>
      <img className={styles.image} src={item.image} alt="" />

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div>
            <div className={styles.title}>{item.title}</div>
            {item.subtitle && <div className={styles.subtitle}>{item.subtitle}</div>}
            {metaText ? <div className={styles.meta}>{metaText}</div> : null}
          </div>

          <IconButton label="Remove item" variant="ghost" onClick={() => removeLine(item.lineId)}>
            <Trash2 size={18} />
          </IconButton>
        </div>

        <div className={styles.bottom}>
          <QuantityStepper value={item.quantity} onChange={(qty) => setQuantity(item.lineId, qty)} />
          <div className={styles.total}>
            <div className={styles.unit}>{formatINR(item.unitPrice)} each</div>
            <div className={styles.sum}>{formatINR(lineTotal)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
