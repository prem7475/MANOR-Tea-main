import React from 'react'
import { Link } from 'react-router-dom'

import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './AdminPlaceholderPage.module.css'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function AdminNotFoundPage() {
  useDocumentTitle('Admin not found')

  return (
    <Card className={styles.card}>
      <div className={styles.title}>Page not found</div>
      <div className={styles.text}>This admin route does not exist.</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button to="/admin" variant="secondary">
          Go to dashboard
        </Button>
        <Link to="/" style={{ alignSelf: 'center' }}>
          Back to storefront
        </Link>
      </div>
    </Card>
  )
}

