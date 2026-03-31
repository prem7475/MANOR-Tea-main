import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import styles from './ProductsPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import ProductCard from '../components/commerce/ProductCard.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { getAllProducts } from '../services/catalogService.js'
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

  const [draftQuery, setDraftQuery] = useState(query)

  useEffect(() => {
    setDraftQuery(query)
  }, [query])

  const products = useMemo(() => {
    const all = getAllProducts()
    const q = query.trim().toLowerCase()

    const filtered = all.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      const hay = `${p.name} ${p.subtitle ?? ''} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })

    const sorted = [...filtered]
    if (sort !== 'featured') sorted.sort(bySort(sort))
    else sorted.sort((a, b) => (b.tags?.includes('bestSeller') ? 1 : 0) - (a.tags?.includes('bestSeller') ? 1 : 0))
    return sorted
  }, [category, query, sort])

  function applyQuery() {
    const next = new URLSearchParams(params)
    if (draftQuery.trim()) next.set('q', draftQuery.trim())
    else next.delete('q')
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
          placeholder="Try “classic”, “gift”, “strong”…"
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

        <label className={styles.sort}>
          <span className={styles.sortLabel}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.select}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
    </div>
  )

  return (
    <PageShell
      title="Products"
      subtitle="Premium tea and curated hampers — designed to be simple, clear, and two clicks away."
      actions={actions}
    >
      <div className={styles.meta}>
        <span className={styles.count}>{products.length} items</span>
        {(query || category !== 'all' || sort !== 'featured') && (
          <Button
            variant="ghost"
            onClick={() => {
              setDraftQuery('')
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
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No matches found</div>
          <div className={styles.emptyText}>Try a different keyword or clear filters.</div>
          <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Show all products
          </Button>
        </div>
      )}
    </PageShell>
  )
}
