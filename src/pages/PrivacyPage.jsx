import React from 'react'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './LegalPage.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy')

  return (
    <PageShell
      title="Privacy Policy"
      subtitle="We respect your privacy. Update this policy with real practices before launch."
    >
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Information we collect</div>
          <div className={styles.list}>
            <div>Contact details (name, email, phone) for orders and support.</div>
            <div>Order information for fulfillment and tracking.</div>
            <div>Site analytics to improve experience.</div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>How we use data</div>
          <p className={styles.text}>
            We use your data to process orders, provide support, and improve MANOR. We do not sell personal data.
          </p>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Your rights</div>
          <p className={styles.text}>
            You can request access, correction, or deletion of your data by contacting support.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

