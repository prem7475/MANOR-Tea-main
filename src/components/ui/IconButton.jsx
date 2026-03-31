import React from 'react'
import styles from './IconButton.module.css'
import { cn } from '../../utils/cn.js'

export default function IconButton({ label, variant = 'ghost', disabled = false, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(styles.iconButton, styles[variant], disabled && styles.disabled, className)}
      aria-label={label}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
