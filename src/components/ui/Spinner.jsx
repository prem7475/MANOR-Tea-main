import React from 'react'
import styles from './Spinner.module.css'
import { cn } from '../../utils/cn.js'

export default function Spinner({ size = 18, className, label = 'Loading' }) {
  return <span className={cn(styles.spinner, className)} style={{ width: size, height: size }} role="status" aria-label={label} />
}
