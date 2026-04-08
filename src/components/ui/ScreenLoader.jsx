import React from 'react'
import styles from './ScreenLoader.module.css'

export default function ScreenLoader({ label = 'Loading...' }) {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.pill}>
        <span className={styles.dot} />
        <span>{label}</span>
      </div>
    </div>
  )
}

