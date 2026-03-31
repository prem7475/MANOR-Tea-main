import React from 'react'

import styles from './LeadershipPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { leadership } from '../assets/data/leadership.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function LeadershipPage() {
  useDocumentTitle('Leadership')

  return (
    <PageShell
      title="Leadership"
      subtitle="A calm brand needs disciplined craft — leadership that protects quality, simplicity, and trust."
      actions={
        <>
          <Button to="/about" variant="secondary">
            About MANOR
          </Button>
          <Button to="/contact" variant="ghost">
            Contact
          </Button>
        </>
      }
    >
      <div className={styles.grid}>
        {leadership.map((p) => (
          <Card key={p.id} className={styles.card}>
            <img className={styles.photo} src={p.photo} alt={p.name} loading="lazy" />
            <div className={styles.body}>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.title}>{p.title}</div>
              <div className={styles.bio}>{p.bio}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className={styles.note}>
        <div className={styles.noteTitle}>What “premium” means to us</div>
        <div className={styles.noteText}>
          Premium is not louder design — it’s fewer decisions, clear information, and consistent delivery. This rebuild
          focuses on performance, accessibility, and a calm purchase flow.
        </div>
      </Card>
    </PageShell>
  )
}

