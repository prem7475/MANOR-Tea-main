import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'

import styles from './ProductCard.module.css'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import IconButton from '../ui/IconButton.jsx'
import { formatINR } from '../../utils/currency.js'
import { useCartStore } from '../../hooks/useCartStore.js'
import { useWishlistStore } from '../../hooks/useWishlistStore.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import { trackEvent } from '../../utils/analytics.js'

export default function ProductCard({ product }) {
  const addProduct = useCartStore((s) => s.addProduct)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const notify = useUiStore((s) => s.notify)

  const productPath = `/products/${product.slug ?? product.id}`
  const isWished = wishlistIds.includes(product.id)
  const discountPct = useMemo(() => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null
    return Math.round((1 - product.price / product.compareAtPrice) * 100)
  }, [product.compareAtPrice, product.price])

  function onAdd() {
    addProduct(product, 1)
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      currency: 'INR',
    })
    notify({ title: 'Added to cart', message: product.name, intent: 'success' })
  }

  function onToggleWish() {
    toggleWishlist(product.id)
    notify({
      title: isWished ? 'Removed from favourites' : 'Saved to favourites',
      message: product.name,
      intent: 'info',
    })
  }

  return (
    <Card as="article" className={styles.card}>
      <div className={styles.media}>
        <Link to={productPath} className={styles.mediaLink}>
          <img className={styles.image} src={product.image} alt={product.name} loading="lazy" />
        </Link>

        <div className={styles.badges}>
          {product.tags?.includes('bestSeller') && <Badge tone="accent">Best Seller</Badge>}
          {!product.inStock && <Badge tone="danger">Sold Out</Badge>}
          {discountPct ? <Badge tone="neutral">{discountPct}% off</Badge> : null}
        </div>

        <div className={styles.wish}>
          <IconButton
            label={isWished ? 'Remove from favourites' : 'Add to favourites'}
            variant="soft"
            onClick={onToggleWish}
          >
            <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
          </IconButton>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <Link to={productPath} className={styles.title}>
            {product.name}
          </Link>
          {product.subtitle && <div className={styles.subtitle}>{product.subtitle}</div>}
        </div>

        <p className={styles.desc}>{product.description}</p>

        <div className={styles.priceRow}>
          <div className={styles.price}>
            <span className={styles.current}>{formatINR(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className={styles.compare}>{formatINR(product.compareAtPrice)}</span>
            )}
          </div>
          <div className={styles.rating} aria-label={`Rating ${product.rating ?? 0} out of 5`}>
            <span aria-hidden="true">★</span>
            <span className={styles.ratingValue}>{product.rating?.toFixed?.(1) ?? product.rating}</span>
            <span className={styles.reviews}>({product.reviewCount ?? 0})</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={productPath} variant="secondary" fullWidth className={styles.viewAction}>
            View
          </Button>
          <Button
            onClick={onAdd}
            disabled={!product.inStock}
            variant="primary"
            fullWidth
            className={styles.addAction}
            title={!product.inStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingBag size={18} />
            Add
          </Button>
        </div>
      </div>
    </Card>
  )
}
