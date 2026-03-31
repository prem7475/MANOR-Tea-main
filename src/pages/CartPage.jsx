import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './CartPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import CartItem from '../components/commerce/CartItem.jsx'
import OrderSummary from '../components/commerce/OrderSummary.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import { useCartStore } from '../hooks/useCartStore.js'
import { getAllProducts } from '../services/catalogService.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function CartPage() {
  useDocumentTitle('Cart')

  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)

  const upsell = useMemo(() => {
    const all = getAllProducts()
    return all.filter((p) => p.inStock && p.category === 'tea').slice(0, 2)
  }, [])

  if (!items.length) {
    return (
      <PageShell
        title="Your cart"
        subtitle="Your cart is empty — let’s find a tea that fits your routine."
        actions={<Button to="/products" variant="secondary">Browse products</Button>}
      >
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>Start with a best seller</div>
          <div className={styles.upsellGrid}>
            {upsell.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Your cart"
      subtitle="Review items, apply offers, and continue to checkout."
      actions={
        <Button to="/products" variant="ghost">
          Continue shopping
        </Button>
      }
    >
      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map((i) => (
            <CartItem key={i.lineId} item={i} />
          ))}
        </div>
        <div className={styles.summary}>
          <OrderSummary cta="Proceed to checkout" onCta={() => navigate('/checkout')} />
        </div>
      </div>

      <div className={styles.upsell}>
        <div className={styles.upsellHeader}>
          <h2 className={styles.upsellTitle}>Add something comforting</h2>
          <p className={styles.upsellDesc}>A couple of favourites that pair well with any order.</p>
        </div>
        <div className={styles.upsellGrid}>
          {upsell.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </PageShell>
  )
}

