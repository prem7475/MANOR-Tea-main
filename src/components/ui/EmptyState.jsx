import React from 'react'
import styles from './EmptyState.module.css'
import Card from './Card.jsx'
import { cn } from '../../utils/cn.js'

export default function EmptyState({ title, text, action, className }) {
  return (
    <Card className={cn(styles.empty, className)}>
      {title ? <div className={styles.title}>{title}</div> : null}
      {text ? <div className={styles.text}>{text}</div> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </Card>
  )
}
