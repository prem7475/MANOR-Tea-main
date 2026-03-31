import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, ShoppingBag, Zap } from 'lucide-react'

import styles from './ProductDetailPage.module.css'
import Container from '../components/ui/Container.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import { formatINR } from '../utils/currency.js'
import { getAllProducts, getProductById } from '../services/catalogService.js'
import { useCartStore } from '../hooks/useCartStore.js'
import { useWishlistStore } from '../hooks/useWishlistStore.js'
import { useUiStore } from '../hooks/useUiStore.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = getProductById(productId)

  useDocumentTitle(product?.name ?? 'Product')

  const addProduct = useCartStore((s) => s.addProduct)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const notify = useUiStore((s) => s.notify)

  const isWished = product ? wishlistIds.includes(product.id) : false
  const [activeImage, setActiveImage] = useState(product?.images?.[0] ?? product?.image)

  const related = useMemo(() => {
    if (!product) return []
    return getAllProducts()
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4)
  }, [product])

  const variants = useMemo(() => {
    if (!product?.groupId) return []
    return getAllProducts()
      .filter((p) => p.groupId && p.groupId === product.groupId)
      .sort((a, b) => (a.attributes?.weightGrams ?? 0) - (b.attributes?.weightGrams ?? 0))
  }, [product])

  const reviews = useMemo(() => getMockReviews(product), [product])

  if (!product) {
    return (
      <Container className={styles.notFound}>
        <Card className={styles.notFoundCard}>
          <h1 className={styles.notFoundTitle}>Product not found</h1>
          <p className={styles.notFoundText}>The item may have been removed or the link is incorrect.</p>
          <Button to="/products" variant="secondary">
            Back to products
          </Button>
        </Card>
      </Container>
    )
  }

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null

  function onAdd() {
    addProduct(product.id, 1)
    notify({ title: 'Added to cart', message: product.name, intent: 'success' })
  }

  function onBuyNow() {
    addProduct(product.id, 1)
    notify({ title: 'Ready to checkout', message: 'Proceeding to checkout.', intent: 'info' })
    navigate('/checkout')
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
    <Container className={styles.page}>
      <div className={styles.top}>
        <div className={styles.gallery}>
          <Card className={styles.media}>
            <img className={styles.heroImage} src={activeImage} alt={product.name} />
          </Card>

          {product.images?.length ? (
            <div className={styles.thumbs} aria-label="Product images">
              {product.images.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`${styles.thumb} ${src === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(src)}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.info}>
          <div className={styles.badges}>
            {product.tags?.includes('bestSeller') && <Badge tone="accent">Best seller</Badge>}
            {!product.inStock && <Badge tone="danger">Sold out</Badge>}
            {discountPct ? <Badge tone="neutral">{discountPct}% off</Badge> : null}
          </div>

          <h1 className={styles.title}>{product.name}</h1>
          {product.subtitle && <div className={styles.subtitle}>{product.subtitle}</div>}

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

          <p className={styles.desc}>{product.description}</p>

          {variants.length > 1 ? (
            <Card className={styles.variants}>
              <div className={styles.variantsTitle}>Choose size</div>
              <div className={styles.variantRow} role="list" aria-label="Variants">
                {variants.map((v) => (
                  <Link
                    key={v.id}
                    to={`/products/${v.id}`}
                    className={`${styles.variant} ${v.id === product.id ? styles.variantActive : ''}`}
                    role="listitem"
                    aria-current={v.id === product.id ? 'true' : undefined}
                  >
                    {v.variantLabel ?? v.subtitle ?? `${v.attributes?.weightGrams ?? ''}g`}
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          <div className={styles.actions}>
            <Button
              fullWidth
              onClick={onAdd}
              disabled={!product.inStock}
              title={!product.inStock ? 'Out of stock' : 'Add to cart'}
            >
              <ShoppingBag size={18} />
              Add to cart
            </Button>
            <Button fullWidth variant="secondary" onClick={onBuyNow} disabled={!product.inStock}>
              <Zap size={18} />
              Buy now
            </Button>
            <Button fullWidth variant="outline" onClick={onToggleWish}>
              <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
              {isWished ? 'Saved' : 'Save'}
            </Button>
          </div>

          <Card className={styles.details}>
            <div className={styles.detailGrid}>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>Weight</div>
                <div className={styles.detailValue}>{product.attributes?.weightGrams ?? '—'}g</div>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>Caffeine</div>
                <div className={styles.detailValue}>{product.attributes?.caffeine ?? '—'}</div>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>Brew</div>
                <div className={styles.detailValue}>{product.attributes?.brew?.time ?? '—'}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.block}>
          <div className={styles.blockTitle}>Story & notes</div>
          <p className={styles.blockText}>{product.longDescription}</p>
          {product.attributes?.tastingNotes?.length ? (
            <div className={styles.notes}>
              {product.attributes.tastingNotes.map((n) => (
                <Badge key={n} tone="neutral">
                  {n}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        {related.length ? (
          <div className={styles.related}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>You may also like</h2>
              <p className={styles.relatedDesc}>More premium choices with a similar feel.</p>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : null}

        <Card className={styles.reviewsCard}>
          <div className={styles.blockTitle}>Reviews (mock)</div>
          <div className={styles.reviewList}>
            {reviews.map((r) => (
              <div key={r.name} className={styles.review}>
                <div className={styles.reviewTop}>
                  <div className={styles.reviewName}>{r.name}</div>
                  <div className={styles.reviewStars} aria-label={`${r.rating} out of 5`}>
                    {'★'.repeat(r.rating)}
                    <span className={styles.reviewStarsMuted}>{'★'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
                <div className={styles.reviewText}>“{r.text}”</div>
                <div className={styles.reviewMeta}>{r.meta}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  )
}

function getMockReviews(product) {
  const name = product?.name ?? 'MANOR Tea'
  return [
    { name: 'Anita', rating: 5, text: `Smooth flavour and aroma. ${name} feels premium and consistent.`, meta: 'Verified buyer · 2 weeks ago' },
    { name: 'Rahul', rating: 4, text: 'Strong enough for milk, not harsh. Packaging feels clean and premium.', meta: 'Verified buyer · 1 month ago' },
    { name: 'Meera', rating: 5, text: 'Easy to buy, quick delivery (demo). Will reorder for daily mornings.', meta: 'Verified buyer · 2 months ago' },
  ]
}
