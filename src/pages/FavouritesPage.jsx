import React, { useMemo } from 'react'

import styles from './FavouritesPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import { useWishlistStore } from '../hooks/useWishlistStore.js'
import { getProductById } from '../services/catalogService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function FavouritesPage() {
  useDocumentTitle('Favourites')

  const ids = useWishlistStore((s) => s.ids)
  const clear = useWishlistStore((s) => s.clear)

  const products = useMemo(() => ids.map((id) => getProductById(id)).filter(Boolean), [ids])

  if (!products.length) {
    return (
      <PageShell
        title="Favourites"
        subtitle="Save teas you love — then add to cart in one click."
        actions={<Button to="/products" variant="secondary">Browse products</Button>}
      >
        <Card className={styles.empty}>
          <div className={styles.emptyTitle}>Nothing saved yet</div>
          <div className={styles.emptyText}>Tap the heart icon on any product to save it here.</div>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Favourites"
      subtitle="Your saved products — calm choices, always ready."
      actions={
        <>
          <Button to="/products" variant="secondary">
            Shop more
          </Button>
          <Button variant="ghost" onClick={clear}>
            Clear favourites
          </Button>
        </>
      }
    >
      <div className={styles.grid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </PageShell>
  )
}

