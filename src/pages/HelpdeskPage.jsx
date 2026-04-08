import React from 'react'
import styles from './HelpdeskPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'After checkout you’ll get an Order ID. Use it on the Track Order page to see the latest status.',
  },
  {
    q: 'Do you offer returns?',
    a: 'Yes — if something is wrong, contact us and we’ll help. Refunds follow the policy on our Refund page.',
  },
  {
    q: 'What payments are supported?',
    a: 'We support UPI, card, and cash on delivery where available.',
  },
  {
    q: 'Is there free delivery?',
    a: 'Free delivery applies above the threshold shown at checkout.',
  },
]

export default function HelpdeskPage() {
  useDocumentTitle('Helpdesk')

  return (
    <PageShell
      title="Helpdesk"
      subtitle="Clear answers, minimal steps. If you still need help, contact us — we respond like humans."
      actions={
        <>
          <Button to="/contact" variant="secondary">
            Contact support
          </Button>
          <Button to="/payments" variant="ghost">
            Payments info
          </Button>
        </>
      }
    >
      <Card className={styles.card}>
        <div className={styles.title}>Frequently asked questions</div>
        <div className={styles.list}>
          {faqs.map((f) => (
            <details key={f.q} className={styles.item}>
              <summary className={styles.q}>{f.q}</summary>
              <div className={styles.a}>{f.a}</div>
            </details>
          ))}
        </div>
      </Card>

      <Card className={styles.card}>
        <div className={styles.title}>Quick links</div>
        <div className={styles.links}>
          <Button to="/track-order" variant="secondary">
            Track order
          </Button>
          <Button to="/offers" variant="outline">
            View offers
          </Button>
          <Button to="/customize-tea" variant="ghost">
            Customize tea
          </Button>
        </div>
      </Card>
    </PageShell>
  )
}
