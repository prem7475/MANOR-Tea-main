import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, DollarSign, ShoppingBag, Users2, Hourglass } from 'lucide-react'
import { Link } from 'react-router-dom'

import styles from './AdminDashboardPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import AdminTable from '../components/AdminTable.jsx'
import { formatINR } from '../../utils/currency.js'
import { fetchAdminAnalytics, fetchAdminOrders, fetchAdminUsers } from '../services/adminApi.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Skeleton from '../../components/ui/Skeleton.jsx'

function formatDateShort(value) {
  const d = value ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusTone(status) {
  const s = String(status ?? 'Pending').toLowerCase()
  if (s === 'delivered') return 'accent'
  if (s === 'shipped') return 'accent'
  if (s === 'processing') return 'neutral'
  return 'neutral'
}

export default function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard')

  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
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
          setUsers([])
          return
        }
      } catch {
        // fallback to local compute
      }

      try {
        const [nextOrders, nextUsers] = await Promise.all([fetchAdminOrders(), fetchAdminUsers()])
        if (cancelled) return
        setOrders(Array.isArray(nextOrders) ? nextOrders : [])
        setUsers(Array.isArray(nextUsers) ? nextUsers : [])
      } catch {
        // ignore (toasts handled in pages that edit data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const id = window.setInterval(load, 15_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const revenue = orders.reduce((sum, o) => sum + (o.summary?.total ?? 0), 0)
    const pendingOrders = orders.filter((o) => String(o.status ?? 'Pending') === 'Pending').length

    const userKeys = new Set()
    for (const o of orders) {
      const email = o.customer?.email ? String(o.customer.email).trim().toLowerCase() : ''
      const phone = o.customer?.phone ? String(o.customer.phone).trim() : ''
      if (email) userKeys.add(email)
      else if (phone) userKeys.add(phone)
    }

    const totalUsers = users.length || userKeys.size
    const customTeaOrders = orders.filter((o) => (o.items ?? []).some((i) => i.kind === 'custom')).length

    return { totalOrders, revenue, totalUsers, pendingOrders, customTeaOrders }
  }, [orders, users.length])

  const statsResolved = analytics?.summary
    ? {
        totalOrders: analytics.summary.totalOrders ?? 0,
        revenue: analytics.summary.revenue ?? 0,
        totalUsers: analytics.summary.totalUsers ?? stats.totalUsers,
        pendingOrders: analytics.summary.pendingOrders ?? 0,
        customTeaOrders: analytics.summary.customOrders ?? 0,
      }
    : stats

  const isLoading = loading && !analytics && orders.length === 0 && users.length === 0

  const last7 = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push(d)
    }

    const totals = days.map((d) => {
      const start = d.getTime()
      const end = start + 24 * 60 * 60 * 1000
      return orders
        .filter((o) => {
          const t = new Date(o.createdAt).getTime()
          return t >= start && t < end
        })
        .reduce((sum, o) => sum + (o.summary?.total ?? 0), 0)
    })

    const max = Math.max(...totals, 1)

    return days.map((d, idx) => ({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      value: totals[idx],
      pct: Math.round((totals[idx] / max) * 100),
    }))
  }, [orders])

  const trendSeries = analytics?.revenueByDay
    ? analytics.revenueByDay.slice(-7)
    : last7

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Order',
        width: '140px',
        render: (o) => (
          <Link to="/admin/orders" className={styles.orderLink}>
            {o.id}
          </Link>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (o) => (
          <div className={styles.customer}>
            <div className={styles.customerName}>{o.customer?.fullName || '—'}</div>
            <div className={styles.customerMeta}>{o.customer?.phone || o.customer?.email || ''}</div>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        width: '140px',
        render: (o) => formatDateShort(o.createdAt),
      },
      {
        key: 'status',
        header: 'Status',
        width: '140px',
        render: (o) => <Badge tone={statusTone(o.status)}>{o.status ?? 'Pending'}</Badge>,
      },
      {
        key: 'total',
        header: 'Total',
        width: '140px',
        align: 'right',
        render: (o) => formatINR(o.summary?.total ?? 0),
      },
    ],
    [],
  )

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`kpi-skel-${idx}`} className={styles.kpi}>
              <div className={styles.kpiTop}>
                <Skeleton className={styles.skeletonIcon} />
                <Skeleton className={styles.skeletonLabel} />
              </div>
              <Skeleton className={styles.skeletonValue} />
            </Card>
          ))
        ) : (
          <>
            <Card className={styles.kpi}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIcon}>
                  <ShoppingBag size={18} />
                </div>
                <div className={styles.kpiLabel}>Total orders</div>
              </div>
              <div className={styles.kpiValue}>{statsResolved.totalOrders}</div>
            </Card>

            <Card className={styles.kpi}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIcon}>
                  <DollarSign size={18} />
                </div>
                <div className={styles.kpiLabel}>Revenue (mock)</div>
              </div>
              <div className={styles.kpiValue}>{formatINR(statsResolved.revenue)}</div>
            </Card>

            <Card className={styles.kpi}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIcon}>
                  <Users2 size={18} />
                </div>
                <div className={styles.kpiLabel}>Users</div>
              </div>
              <div className={styles.kpiValue}>{statsResolved.totalUsers}</div>
            </Card>

            <Card className={styles.kpi}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIcon}>
                  <Hourglass size={18} />
                </div>
                <div className={styles.kpiLabel}>Pending</div>
              </div>
              <div className={styles.kpiValue}>{statsResolved.pendingOrders}</div>
            </Card>
          </>
        )}
      </div>

      <div className={styles.mainGrid}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Sales overview</div>
              <div className={styles.panelSub}>Last 7 days (live MongoDB data).</div>
            </div>
            <Button to="/admin/analytics" variant="ghost" size="sm">
              Analytics <ArrowRight size={18} />
            </Button>
          </div>

          {isLoading ? (
            <>
              <div className={styles.chartSkeleton} aria-label="Loading chart">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={`bar-skel-${idx}`} className={styles.skeletonBarWrap}>
                    <Skeleton className={styles.skeletonBar} style={{ height: `${30 + (idx % 3) * 18}%` }} />
                    <Skeleton className={styles.skeletonBarLabel} />
                  </div>
                ))}
              </div>

              <div className={styles.quickRow}>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={`quick-skel-${idx}`} className={styles.quick}>
                    <Skeleton className={styles.skeletonLine} />
                    <Skeleton className={styles.skeletonValue} />
                    <Skeleton className={styles.skeletonLineShort} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.chart} aria-label="Sales chart">
                {trendSeries.map((d) => (
                  <div key={d.key} className={styles.barWrap} title={`${d.label}: ${formatINR(d.value)}`}>
                    <div className={styles.barTrack}>
                      <div className={styles.bar} style={{ height: `${Math.max(6, d.pct)}%` }} />
                    </div>
                    <div className={styles.barLabel}>{d.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.quickRow}>
                  <div className={styles.quick}>
                    <div className={styles.quickLabel}>Custom tea orders</div>
                    <div className={styles.quickValue}>{statsResolved.customTeaOrders}</div>
                    <Link to="/admin/custom-orders" className={styles.quickLink}>
                      Review requests
                    </Link>
                  </div>
                <div className={styles.quick}>
                  <div className={styles.quickLabel}>Next step</div>
                  <div className={styles.quickValue}>API connected</div>
                  <div className={styles.quickHint}>Add payment verification and roles for production.</div>
                </div>
              </div>
            </>
          )}
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Recent orders</div>
              <div className={styles.panelSub}>Latest 6 orders.</div>
            </div>
            <Button to="/admin/orders" variant="secondary" size="sm">
              View all
            </Button>
          </div>

          {isLoading ? (
            <div className={styles.skeletonTable} aria-label="Loading recent orders">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`recent-skel-${idx}`} className={styles.skeletonRow}>
                  <Skeleton className={styles.skeletonCellWide} />
                  <Skeleton className={styles.skeletonCell} />
                  <Skeleton className={styles.skeletonCell} />
                  <Skeleton className={styles.skeletonCell} />
                </div>
              ))}
            </div>
          ) : (
            <AdminTable
              columns={columns}
              rows={recentOrders}
              getRowKey={(o) => o.internalId ?? o.id}
              emptyLabel="No orders yet."
            />
          )}
        </Card>
      </div>
    </div>
  )
}
