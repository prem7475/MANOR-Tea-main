import React, { useMemo } from 'react'

import styles from './GiftsPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { getProductsByCategory } from '../services/catalogService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function GiftsPage() {
  useDocumentTitle('Gifts')

  const gifts = useMemo(() => getProductsByCategory('gift'), [])

  return (
    <PageShell
      title="Gifts"
      subtitle="Premium hampers designed to feel effortless — curated blends, elegant packaging, and a handwritten note."
      actions={
        <>
          <Button to="/customize-tea" variant="secondary">
            Customize your tea
          </Button>
          <Button to="/offers" variant="ghost">
            View offers
          </Button>
        </>
      }
    >
      <Card className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.kicker}>Gifting made premium</div>
          <div className={styles.heroTitle}>Ready in minutes</div>
          <div className={styles.heroDesc}>
            Pick a hamper, checkout, and track. This rebuild uses a mock payment UI — swap it for a real gateway
            later.
          </div>
        </div>
        <img className={styles.heroImg} src="/gift hamper 4.jpg" alt="" loading="lazy" />
      </Card>

      <div className={styles.grid}>
        {gifts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </PageShell>
  )
}
