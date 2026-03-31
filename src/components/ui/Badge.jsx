import React from 'react'
import styles from './Badge.module.css'
import { cn } from '../../utils/cn.js'

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span className={cn(styles.badge, styles[tone], className)} {...props}>
      {children}
    </span>
  )
}

