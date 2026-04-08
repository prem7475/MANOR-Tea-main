import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, ShoppingBag, Zap } from 'lucide-react'

import styles from './ProductDetailPage.module.css'
import Container from '../components/ui/Container.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import Input from '../components/ui/Input.jsx'
import { formatINR } from '../utils/currency.js'
import { useProductsStore } from '../hooks/useProductsStore.js'
import { useCartStore } from '../hooks/useCartStore.js'
import { useWishlistStore } from '../hooks/useWishlistStore.js'
import { useUiStore } from '../hooks/useUiStore.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { trackEvent } from '../utils/analytics.js'

const RECENTS_KEY = 'manor:recently-viewed:v1'

function readRecents() {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecents(next) {
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export default function ProductDetailPage() {
  const { productId: slugOrId } = useParams()
  const navigate = useNavigate()
  const products = useProductsStore((s) => s.products)
  const status = useProductsStore((s) => s.status)
  const error = useProductsStore((s) => s.error)

  const product = useMemo(
    () =>
      products.find((p) => p.slug === slugOrId) ||
      products.find((p) => p.id === slugOrId) ||
      null,
    [products, slugOrId],
  )

  useDocumentTitle(product?.name ?? 'Product')

  const addProduct = useCartStore((s) => s.addProduct)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const notify = useUiStore((s) => s.notify)

  const isWished = product ? wishlistIds.includes(product.id) : false
  const initialImage = product?.images?.[0] ?? product?.image
  const [activeImage, setActiveImage] = useState(initialImage)
  const [relatedQuery, setRelatedQuery] = useState('')
  const [recentIds, setRecentIds] = useState(() => readRecents())

  useEffect(() => {
    setActiveImage(initialImage)
  }, [initialImage])

  useEffect(() => {
    setRelatedQuery('')
  }, [product?.id])

  useEffect(() => {
    if (!product?.id) return
    setRecentIds((prev) => {
      const next = [product.id, ...(prev ?? []).filter((id) => id !== product.id)].slice(0, 8)
      writeRecents(next)
      return next
    })
  }, [product?.id])

  useEffect(() => {
    if (!product?.slug) return
    if (!slugOrId) return
    if (slugOrId === product.slug) return
    navigate(`/products/${product.slug}`, { replace: true })
  }, [navigate, product?.slug, slugOrId])

  const relatedBase = useMemo(() => {
    if (!product) return []
    const tags = new Set(product.tags ?? [])
    const scored = products
      .filter((p) => p.id !== product.id)
      .map((p) => {
        let score = 0
        if (p.category === product.category) score += 3
        if (product.groupId && p.groupId === product.groupId) score += 4
        if (tags.size && Array.isArray(p.tags)) {
          const shared = p.tags.filter((t) => tags.has(t)).length
          score += shared * 2
        }
        return { product: p, score }
      })

    const primary = scored.filter((row) => row.score > 0)
    const base = primary.length ? primary : scored
    return base
      .sort(
        (a, b) =>
          b.score - a.score || (b.product.rating ?? 0) - (a.product.rating ?? 0) || b.product.price - a.product.price,
      )
      .map((row) => row.product)
  }, [product, products])

  const related = useMemo(() => {
    const q = relatedQuery.trim().toLowerCase()
    const list = relatedBase.slice(0, 10)
    if (!q) return list.slice(0, 6)
    return list.filter((p) => {
      const hay = `${p.name} ${p.subtitle ?? ''} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [relatedBase, relatedQuery])

  const variants = useMemo(() => {
    if (!product?.groupId) return []
    return products
      .filter((p) => p.groupId && p.groupId === product.groupId)
      .sort((a, b) => (a.attributes?.weightGrams ?? 0) - (b.attributes?.weightGrams ?? 0))
  }, [product, products])

  const reviews = useMemo(() => getMockReviews(product), [product])

  const recentProducts = useMemo(() => {
    if (!recentIds.length) return []
    const map = new Map(products.map((p) => [p.id, p]))
    return recentIds.map((id) => map.get(id)).filter(Boolean)
  }, [products, recentIds])

  if (!product) {
    const isLoading = status === 'loading'
    return (
      <Container className={styles.notFound}>
        {isLoading ? (
          <div className={styles.skeletonLayout} aria-label="Loading product">
            <Skeleton className={styles.skeletonMedia} />
            <div className={styles.skeletonInfo}>
              <Skeleton className={styles.skeletonLine} />
              <Skeleton className={styles.skeletonLineShort} />
              <Skeleton className={styles.skeletonLine} />
              <Skeleton className={styles.skeletonAction} />
            </div>
          </div>
        ) : (
          <Card className={styles.notFoundCard}>
            <h1 className={styles.notFoundTitle}>Product not found</h1>
            <p className={styles.notFoundText}>
              {error ? String(error) : 'The item may have been removed or the link is incorrect.'}
            </p>
            <Button to="/products" variant="secondary">
              Back to products
            </Button>
          </Card>
        )}
      </Container>
    )
  }

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null

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

  function onBuyNow() {
    addProduct(product, 1)
    trackEvent('begin_checkout', {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      currency: 'INR',
    })
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
                    to={`/products/${v.slug ?? v.id}`}
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

        {relatedBase.length ? (
          <div className={styles.related}>
            <div className={styles.relatedHeader}>
              <div>
                <h2 className={styles.relatedTitle}>You may also like</h2>
                <p className={styles.relatedDesc}>More premium choices with a similar feel.</p>
              </div>
              <div className={styles.relatedSearch}>
                <Input
                  label="Search similar"
                  name="related"
                  value={relatedQuery}
                  onChange={(e) => setRelatedQuery(e.target.value)}
                  placeholder="Search within similar teas..."
                />
                <Link
                  className={styles.relatedLink}
                  to={`/products${relatedQuery.trim() ? `?q=${encodeURIComponent(relatedQuery.trim())}` : ''}`}
                >
                  Search all
                </Link>
              </div>
            </div>
            {related.length ? (
              <div className={styles.relatedGrid}>
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <Card className={styles.relatedEmpty}>
                <div className={styles.relatedEmptyTitle}>No similar matches</div>
                <div className={styles.relatedEmptyText}>Try a different keyword or browse all products.</div>
                <Button variant="secondary" to={`/products${relatedQuery.trim() ? `?q=${encodeURIComponent(relatedQuery.trim())}` : ''}`}>
                  Search all products
                </Button>
              </Card>
            )}
          </div>
        ) : null}

        {recentProducts.length > 1 ? (
          <div className={styles.recent}>
            <div className={styles.relatedHeader}>
              <div>
                <h2 className={styles.relatedTitle}>Recently viewed</h2>
                <p className={styles.relatedDesc}>Pick up where you left off.</p>
              </div>
            </div>
            <div className={styles.relatedGrid}>
              {recentProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p) => (
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
