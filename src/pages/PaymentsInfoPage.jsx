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
      subtitle="Secure payment options and delivery details for your order."
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
            <li>UPI</li>
            <li>Card</li>
            <li>Cash on delivery</li>
          </ul>
        </Card>

        <Card className={styles.card}>
          <div className={styles.title}>Security</div>
          <div className={styles.text}>
            Payments are processed securely. For card/UPI, confirmation is reflected in your order status.
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.title}>Shipping</div>
          <div className={styles.text}>
            Free delivery applies above the threshold shown at checkout. Standard delivery timelines appear in your order.
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
