import React from 'react'
import styles from './HelpdeskPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'After checkout you’ll get an Order ID. Use it on the Track Order page. In this demo, status updates quickly so you can see the full flow.',
  },
  {
    q: 'Do you offer returns?',
    a: 'Yes — we keep it simple. If something is wrong, contact us and we’ll help. This demo includes a mock flow.',
  },
  {
    q: 'What payments are supported?',
    a: 'This rebuild includes a mock payment UI (UPI/Card/COD). For production, connect a real gateway and server-side verification.',
  },
  {
    q: 'Is there free delivery?',
    a: 'Free delivery applies above ₹499 in this demo (configurable).',
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
