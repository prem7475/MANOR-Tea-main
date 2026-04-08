import React from 'react'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './LegalPage.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function RefundPage() {
  useDocumentTitle('Refund Policy')

  return (
    <PageShell
      title="Refund Policy"
      subtitle="Simple, fair refund rules. Replace with your official policy before launch."
    >
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Eligibility</div>
          <div className={styles.list}>
            <div>Refunds are eligible for damaged or incorrect items.</div>
            <div>Requests must be raised within 48 hours of delivery.</div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Process</div>
          <p className={styles.text}>
            Contact support with your order ID and photos if applicable. Approved refunds are processed within
            7 business days.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

