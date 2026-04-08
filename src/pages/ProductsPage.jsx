import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import styles from './ProductsPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useProductsStore } from '../hooks/useProductsStore.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function bySort(sortKey) {
  if (sortKey === 'price-asc') return (a, b) => a.price - b.price
  if (sortKey === 'price-desc') return (a, b) => b.price - a.price
  if (sortKey === 'rating') return (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
  return () => 0
}

export default function ProductsPage() {
  useDocumentTitle('Products')

  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('cat') ?? 'all'
  const sort = params.get('sort') ?? 'featured'
  const minParam = params.get('min') ?? ''
  const maxParam = params.get('max') ?? ''
  const ratingParam = params.get('rating') ?? 'all'
  const stockParam = params.get('stock') ?? 'all'
  const tagParam = params.get('tag') ?? 'all'

  const [draftQuery, setDraftQuery] = useState(query)
  const [draftMin, setDraftMin] = useState(minParam)
  const [draftMax, setDraftMax] = useState(maxParam)
  const productsState = useProductsStore((s) => s.products)
  const status = useProductsStore((s) => s.status)
  const error = useProductsStore((s) => s.error)

  useEffect(() => {
    setDraftQuery(query)
  }, [query])

  useEffect(() => {
    setDraftMin(minParam)
    setDraftMax(maxParam)
  }, [minParam, maxParam])

  const products = useMemo(() => {
    const all = productsState ?? []
    const q = query.trim().toLowerCase()
    const minPrice = Number(minParam)
    const maxPrice = Number(maxParam)
    const ratingMin = ratingParam === 'all' ? 0 : Number(ratingParam)

    const filtered = all.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (Number.isFinite(minPrice) && minParam !== '' && p.price < minPrice) return false
      if (Number.isFinite(maxPrice) && maxParam !== '' && p.price > maxPrice) return false
      if (ratingMin && (p.rating ?? 0) < ratingMin) return false
      if (stockParam === 'in' && !p.inStock) return false
      if (tagParam !== 'all' && !(p.tags ?? []).includes(tagParam)) return false
      if (!q) return true
      const hay = `${p.name} ${p.subtitle ?? ''} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })

    const sorted = [...filtered]
    if (sort !== 'featured') sorted.sort(bySort(sort))
    else sorted.sort((a, b) => (b.tags?.includes('bestSeller') ? 1 : 0) - (a.tags?.includes('bestSeller') ? 1 : 0))
    return sorted
  }, [category, maxParam, minParam, productsState, query, ratingParam, sort, stockParam, tagParam])

  const loading = status === 'loading' && !productsState?.length

  function applyQuery() {
    const next = new URLSearchParams(params)
    if (draftQuery.trim()) next.set('q', draftQuery.trim())
    else next.delete('q')
    setParams(next, { replace: true })
  }

  function applyPrice() {
    const next = new URLSearchParams(params)
    if (draftMin.trim()) next.set('min', draftMin.trim())
    else next.delete('min')
    if (draftMax.trim()) next.set('max', draftMax.trim())
    else next.delete('max')
    setParams(next, { replace: true })
  }

  function setRating(nextRating) {
    const next = new URLSearchParams(params)
    if (nextRating === 'all') next.delete('rating')
    else next.set('rating', nextRating)
    setParams(next, { replace: true })
  }

  function setStock(nextStock) {
    const next = new URLSearchParams(params)
    if (nextStock === 'all') next.delete('stock')
    else next.set('stock', nextStock)
    setParams(next, { replace: true })
  }

  function setTag(nextTag) {
    const next = new URLSearchParams(params)
    if (nextTag === 'all') next.delete('tag')
    else next.set('tag', nextTag)
    setParams(next, { replace: true })
  }

  function setCategory(nextCat) {
    const next = new URLSearchParams(params)
    if (nextCat === 'all') next.delete('cat')
    else next.set('cat', nextCat)
    setParams(next, { replace: true })
  }

  function setSort(nextSort) {
    const next = new URLSearchParams(params)
    if (nextSort === 'featured') next.delete('sort')
    else next.set('sort', nextSort)
    setParams(next, { replace: true })
  }

  const actions = (
    <div className={styles.actions}>
      <div className={styles.searchRow}>
        <Input
          label="Search"
          name="q"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyQuery()
          }}
          placeholder="Try classic, gift, strong..."
        />
        <Button variant="secondary" onClick={applyQuery}>
          Search
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.tabs} role="tablist" aria-label="Category">
          <button
            type="button"
            className={`${styles.tab} ${category === 'all' ? styles.tabActive : ''}`}
            onClick={() => setCategory('all')}
            role="tab"
            aria-selected={category === 'all' ? 'true' : 'false'}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.tab} ${category === 'tea' ? styles.tabActive : ''}`}
            onClick={() => setCategory('tea')}
            role="tab"
            aria-selected={category === 'tea' ? 'true' : 'false'}
          >
            Tea
          </button>
          <button
            type="button"
            className={`${styles.tab} ${category === 'gift' ? styles.tabActive : ''}`}
            onClick={() => setCategory('gift')}
            role="tab"
            aria-selected={category === 'gift' ? 'true' : 'false'}
          >
            Gifts
          </button>
        </div>

        <div className={styles.filterRow}>
          <label className={styles.sort}>
            <span className={styles.sortLabel}>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.select}>
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>

          <label className={styles.sort}>
            <span className={styles.sortLabel}>Rating</span>
            <select value={ratingParam} onChange={(e) => setRating(e.target.value)} className={styles.select}>
              <option value="all">All</option>
              <option value="4.5">4.5+</option>
              <option value="4.7">4.7+</option>
              <option value="4.9">4.9+</option>
            </select>
          </label>

          <label className={styles.sort}>
            <span className={styles.sortLabel}>Availability</span>
            <select value={stockParam} onChange={(e) => setStock(e.target.value)} className={styles.select}>
              <option value="all">All</option>
              <option value="in">In stock</option>
            </select>
          </label>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.price}>
            <div className={styles.sortLabel}>Price range</div>
            <div className={styles.priceRow}>
              <Input
                label="Min"
                name="min"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                placeholder="0"
                inputMode="numeric"
              />
              <Input
                label="Max"
                name="max"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                placeholder="1500"
                inputMode="numeric"
              />
              <Button variant="ghost" onClick={applyPrice}>
                Apply
              </Button>
            </div>
          </div>

          <div className={styles.tags}>
            <div className={styles.sortLabel}>Quick filters</div>
            <div className={styles.tagRow}>
              {[
                { key: 'all', label: 'All' },
                { key: 'bestSeller', label: 'Best sellers' },
                { key: 'new', label: 'New' },
                { key: 'premium', label: 'Premium' },
                { key: 'classic', label: 'Classic' },
                { key: 'strong', label: 'Strong' },
                { key: 'gift', label: 'Gift' },
              ].map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  className={`${styles.tag} ${tagParam === tag.key ? styles.tagActive : ''}`}
                  onClick={() => setTag(tag.key)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <PageShell
      title="Products"
      subtitle="Premium tea and curated hampers — designed to be simple, clear, and two clicks away."
      actions={actions}
    >
      {loading ? (
        <div className={styles.grid} aria-label="Loading products">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
              <Skeleton className={styles.skeletonMedia} />
              <div className={styles.skeletonBody}>
                <Skeleton className={styles.skeletonLine} />
                <Skeleton className={styles.skeletonLineShort} />
                <Skeleton className={styles.skeletonLine} />
                <Skeleton className={styles.skeletonAction} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {error && !loading ? <div className={styles.emptyText}>{error}</div> : null}
      <div className={styles.meta}>
        <span className={styles.count}>{products.length} items</span>
        {(query ||
          category !== 'all' ||
          sort !== 'featured' ||
          minParam ||
          maxParam ||
          ratingParam !== 'all' ||
          stockParam !== 'all' ||
          tagParam !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              setDraftQuery('')
              setDraftMin('')
              setDraftMax('')
              setParams(new URLSearchParams(), { replace: true })
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {products.length ? (
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matches found"
          text="Try a different keyword or clear filters."
          action={
            <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Show all products
            </Button>
          }
        />
      )}
    </PageShell>
  )
}
