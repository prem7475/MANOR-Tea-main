import React from 'react'
import styles from './QuantityStepper.module.css'
import { Minus, Plus } from 'lucide-react'
import IconButton from './IconButton.jsx'

export default function QuantityStepper({ value, min = 1, max = 99, onChange, size = 'md' }) {
  const canDec = value > min
  const canInc = value < max

  return (
    <div className={`${styles.stepper} ${styles[size]}`}>
      <IconButton
        label="Decrease quantity"
        variant="soft"
        className={styles.step}
        disabled={!canDec}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} />
      </IconButton>

      <div className={styles.value} aria-label={`Quantity ${value}`}>
        {value}
      </div>

      <IconButton
        label="Increase quantity"
        variant="soft"
        className={styles.step}
        disabled={!canInc}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} />
      </IconButton>
    </div>
  )
}

