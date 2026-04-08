import React from 'react'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import styles from './LegalPage.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function TermsPage() {
  useDocumentTitle('Terms & Conditions')

  return (
    <PageShell
      title="Terms & Conditions"
      subtitle="Clear terms for using MANOR. Replace placeholders with legal counsel before launch."
    >
      <div className={styles.page}>
        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Use of website</div>
          <p className={styles.text}>
            By using this site you agree to follow all applicable laws, provide accurate information, and avoid
            misuse of our services or content.
          </p>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Orders and payments</div>
          <div className={styles.list}>
            <div>All prices are shown in INR unless stated otherwise.</div>
            <div>Payment methods and availability are displayed at checkout.</div>
            <div>We may cancel or refund orders in cases of stock or payment issues.</div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.sectionTitle}>Liability</div>
          <p className={styles.text}>
            MANOR is not liable for indirect or incidental damages. Our total liability is limited to the value of the
            order placed.
          </p>
        </Card>
      </div>
    </PageShell>
  )
}

