import React from 'react'

import styles from './PaymentsInfoPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function PaymentsInfoPage() {
  useDocumentTitle('Payments info')

  return (
    <PageShell
      title="Payments info"
      subtitle="This rebuild ships with a mock payment UI for demo. Replace with a real gateway + server-side verification for production."
      actions={
        <>
          <Button to="/checkout" variant="secondary">
            Go to checkout
          </Button>
          <Button to="/helpdesk" variant="ghost">
            Helpdesk
          </Button>
        </>
      }
    >
      <div className={styles.grid}>
        <Card className={styles.card}>
          <div className={styles.title}>Payment methods</div>
          <ul className={styles.list}>
            <li>UPI (mock)</li>
            <li>Card (mock)</li>
            <li>Cash on delivery (demo)</li>
          </ul>
        </Card>

        <Card className={styles.card}>
          <div className={styles.title}>Security</div>
          <div className={styles.text}>
            In production, payments must be verified server-side (webhooks / signature validation). Client-only “success”
            screens are not secure.
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.title}>Shipping</div>
          <div className={styles.text}>
            Free delivery above ₹499 (demo). Delivery timelines and service areas should be configured from your backend.
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.title}>Returns & support</div>
          <div className={styles.text}>
            Keep the policy simple: quick contact, clear resolution. Use the Helpdesk and Contact pages to guide users.
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

