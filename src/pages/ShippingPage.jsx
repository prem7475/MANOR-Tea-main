import React from 'react'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './LegalPage.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function ShippingPage() {
  useDocumentTitle('Shipping Policy')

  return (
    <PageShell
      title="Shipping Policy"
      subtitle="Delivery timelines and handling details. Update with real logistics before launch."
    >
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Delivery timelines</div>
          <div className={styles.list}>
            <div>Metro cities: 2-4 business days.</div>
            <div>Other locations: 4-7 business days.</div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Shipping charges</div>
          <p className={styles.text}>
            Shipping is free above the threshold shown at checkout. Otherwise a small handling fee applies.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

