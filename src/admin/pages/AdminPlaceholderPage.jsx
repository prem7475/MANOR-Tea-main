import React from 'react'

import Card from '../../components/ui/Card.jsx'
import styles from './AdminPlaceholderPage.module.css'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function AdminPlaceholderPage({ title }) {
  useDocumentTitle(`Admin ${title}`)

  return (
    <Card className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.text}>
        This section is coming next. The final version will match MANOR's premium design system with tables, modals,
        and clear workflows.
      </div>
    </Card>
  )
}
