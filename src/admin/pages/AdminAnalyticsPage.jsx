import React, { useEffect, useMemo, useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'

import styles from './AdminAnalyticsPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { fetchAdminAnalytics, fetchAdminOrders, fetchAdminProducts } from '../services/adminApi.js'
import { formatINR } from '../../utils/currency.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Button from '../../components/ui/Button.jsx'

function dayKey(date) {
  return date.toISOString().slice(0, 10)
}

export default function AdminAnalyticsPage() {
  useDocumentTitle('Admin analytics')

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await fetchAdminAnalytics()
        if (cancelled) return
        if (data && typeof data === 'object') {
          setAnalytics(data)
          setOrders([])
          setProducts([])
          return
        }
      } catch {
        // fallback to local compute
      }

      try {
        const [nextOrders, nextProducts] = await Promise.all([fetchAdminOrders(), fetchAdminProducts()])
        if (cancelled) return
        setOrders(Array.isArray(nextOrders) ? nextOrders : [])
        setProducts(Array.isArray(nextProducts) ? nextProducts : [])
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = window.setInterval(load, 30_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const productById = useMemo(() => {
    const map = new Map()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const last14 = useMemo(() => {
    const now = new Date()
    const days = []
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push(d)
    }

    const totalsByDay = new Map()
    for (const d of days) totalsByDay.set(dayKey(d), 0)
    for (const o of orders) {
      const d = new Date(o.createdAt)
      d.setHours(0, 0, 0, 0)
      const key = dayKey(d)
      if (!totalsByDay.has(key)) continue
      totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + (o.summary?.total ?? 0))
    }

    const series = days.map((d) => {
      const key = dayKey(d)
      return {
        key,
        label: d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
        value: totalsByDay.get(key) ?? 0,
      }
    })

    const max = Math.max(...series.map((s) => s.value), 1)
    return series.map((s) => ({ ...s, pct: Math.round((s.value / max) * 100) }))
  }, [orders])

  const mix = useMemo(() => {
    const counts = { tea: 0, gift: 0, custom: 0 }
    for (const o of orders) {
      for (const i of o.items ?? []) {
        if (i.kind === 'custom') {
          counts.custom += 1
        } else if (i.kind === 'product') {
          const p = productById.get(i.productId)
          if (p?.category === 'gift') counts.gift += 1
          else counts.tea += 1
        }
      }
    }

    const total = counts.tea + counts.gift + counts.custom || 1
    const rows = [
      { key: 'tea', label: 'Tea', value: counts.tea },
      { key: 'gift', label: 'Gifts', value: counts.gift },
      { key: 'custom', label: 'Custom tea', value: counts.custom },
    ]
    return rows.map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) }))
  }, [orders, productById])

  const topProducts = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      for (const i of o.items ?? []) {
        if (i.kind !== 'product') continue
        const prev = map.get(i.productId) ?? { productId: i.productId, qty: 0, revenue: 0 }
        map.set(i.productId, {
          productId: i.productId,
          qty: prev.qty + (i.quantity ?? 0),
          revenue: prev.revenue + (i.unitPrice ?? 0) * (i.quantity ?? 0),
        })
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((row) => ({ ...row, product: productById.get(row.productId) }))
  }, [orders, productById])

  const isLoading = loading && !analytics && orders.length === 0 && products.length === 0

  const trendSeries = analytics?.revenueByDay ?? last14
  const mixRows = analytics?.orderMix ?? mix
  const topRows = useMemo(() => {
    if (analytics?.topProducts) return analytics.topProducts
    return topProducts.map((row) => ({
      productId: row.productId,
      qty: row.qty,
      revenue: row.revenue,
      name: row.product?.name ?? row.productId,
    }))
  }, [analytics, topProducts])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BarChart3 size={18} />
          <div className={styles.title}>Analytics</div>
        </div>
        <div className={styles.subtitle}>Simple, premium charts based on live orders in MongoDB.</div>
      </div>

      <div className={styles.grid}>
        <Card className={styles.panel}>
          <div className={styles.panelTop}>
            <div>
              <div className={styles.panelTitle}>Sales trend</div>
              <div className={styles.panelSub}>Last 14 days</div>
            </div>
            <Badge tone="neutral">
              <TrendingUp size={14} /> Demo
            </Badge>
          </div>

          {isLoading ? (
            <div className={styles.trendSkeleton} aria-label="Loading trend">
              {Array.from({ length: 14 }).map((_, idx) => (
                <div key={`trend-skel-${idx}`} className={styles.skeletonCol}>
                  <Skeleton className={styles.skeletonBar} style={{ height: `${22 + (idx % 4) * 14}%` }} />
                  <Skeleton className={styles.skeletonLabel} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.trend}>
              {trendSeries.map((d) => (
                <div key={d.key} className={styles.trendCol} title={`${d.label}: ${formatINR(d.value)}`}>
                  <div className={styles.trendTrack}>
                    <div className={styles.trendBar} style={{ height: `${Math.max(4, d.pct)}%` }} />
                  </div>
                  <div className={styles.trendLabel}>{d.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTop}>
            <div>
              <div className={styles.panelTitle}>Order mix</div>
              <div className={styles.panelSub}>Items by category</div>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.mixSkeleton} aria-label="Loading order mix">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`mix-skel-${idx}`} className={styles.mixRow}>
                  <div className={styles.mixLeft}>
                    <Skeleton className={styles.skeletonLine} />
                    <Skeleton className={styles.skeletonLineShort} />
                  </div>
                  <Skeleton className={styles.skeletonBarTrack} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.mix}>
              {mixRows.map((r) => (
                <div key={r.key} className={styles.mixRow}>
                  <div className={styles.mixLeft}>
                    <div className={styles.mixLabel}>{r.label}</div>
                    <div className={styles.mixMeta}>
                      {r.value} items • {r.pct}%
                    </div>
                  </div>
                  <div className={styles.mixBarTrack} aria-hidden="true">
                    <div className={styles.mixBar} style={{ width: `${Math.max(6, r.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelTop}>
            <div>
              <div className={styles.panelTitle}>Top products</div>
              <div className={styles.panelSub}>By revenue (mock)</div>
            </div>
          </div>

          <div className={styles.topList}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={`top-skel-${idx}`} className={styles.topRow}>
                  <div className={styles.topLeft}>
                    <Skeleton className={styles.skeletonLine} />
                    <Skeleton className={styles.skeletonLineShort} />
                  </div>
                  <Skeleton className={styles.skeletonValue} />
                </div>
              ))
            ) : topRows.length ? (
              topRows.map((row) => (
                <div key={row.productId} className={styles.topRow}>
                  <div>
                    <div className={styles.topName}>{row.name ?? row.productId}</div>
                    <div className={styles.topMeta}>{row.qty} sold</div>
                  </div>
                  <div className={styles.topValue}>{formatINR(row.revenue)}</div>
                </div>
              ))
            ) : (
              <EmptyState
                className={styles.empty}
                title="No product sales yet"
                text="Place a test order to start collecting analytics."
                action={
                  <Button to="/products" variant="secondary">
                    Place test order
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
