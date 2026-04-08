import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import { env } from '../config/env.js'
import { requireAdmin } from '../middleware/auth.js'
import { AdminUser } from '../models/AdminUser.js'
import { Product } from '../models/Product.js'
import { Offer } from '../models/Offer.js'
import { Order } from '../models/Order.js'
import { createPublicId } from '../utils/ids.js'
import { slugify } from '../utils/slug.js'
import { sendError, sendJson } from '../utils/http.js'
import { renderStatusUpdate, sendEmail } from '../services/email.js'
import { clearAnalyticsCache, getAnalyticsCache, setAnalyticsCache } from '../utils/analyticsCache.js'

const router = express.Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid login payload', parsed.error.flatten())

    const email = parsed.data.email.trim().toLowerCase()
    const password = parsed.data.password

    const admin = await AdminUser.findOne({ email }).lean()
    if (!admin) return sendError(res, 401, 'Invalid email or password')

    const ok = await bcrypt.compare(password, admin.passwordHash)
    if (!ok) return sendError(res, 401, 'Invalid email or password')

    const token = jwt.sign(
      { sub: String(admin._id), role: 'admin', email: admin.email, name: admin.name },
      env.jwtSecret,
      { expiresIn: '12h' },
    )

    return sendJson(res, 200, {
      token,
      admin: { email: admin.email, name: admin.name },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/auth/me', requireAdmin, async (req, res) => {
  return sendJson(res, 200, { admin: { email: req.admin?.email ?? '', name: req.admin?.name ?? 'Admin' } })
})

router.post('/auth/logout', requireAdmin, async (req, res) => {
  return sendJson(res, 200, { ok: true })
})

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean()
    return sendJson(res, 200, { products })
  } catch (err) {
    next(err)
  }
})

const productInputSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  groupId: z.string().nullable().optional(),
  variantLabel: z.string().nullable().optional(),
  name: z.string().min(2),
  subtitle: z.string().optional(),
  description: z.string().min(5),
  longDescription: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  category: z.enum(['tea', 'gift']),
  tags: z.array(z.string()).optional(),
  rating: z.number().optional().nullable(),
  reviewCount: z.number().optional().nullable(),
  image: z.string().min(1),
  images: z.array(z.string()).optional(),
  attributes: z.any().optional(),
  inStock: z.boolean().optional(),
})

async function uniqueSlug(base, existingId) {
  const raw = slugify(base)
  let candidate = raw || createPublicId('product').toLowerCase()
  let i = 2
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await Product.findOne({ slug: candidate }).lean()
    if (!found) return candidate
    if (existingId && found.id === existingId) return candidate
    candidate = `${raw}-${i}`
    i += 1
  }
}

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const parsed = productInputSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid product payload', parsed.error.flatten())

    const data = parsed.data
    const id = data.id?.trim() || createPublicId('p')
    const slug = await uniqueSlug(data.slug || data.name, id)

    const product = await Product.create({
      ...data,
      id,
      slug,
      subtitle: data.subtitle ?? '',
      longDescription: data.longDescription ?? '',
      tags: data.tags ?? [],
      images: data.images ?? [],
      attributes: data.attributes ?? {},
      inStock: data.inStock ?? true,
      groupId: data.groupId ?? null,
      variantLabel: data.variantLabel ?? null,
      compareAtPrice: data.compareAtPrice ?? null,
      rating: data.rating ?? null,
      reviewCount: data.reviewCount ?? null,
    })

    return sendJson(res, 201, { product })
  } catch (err) {
    if (String(err?.code) === '11000') return sendError(res, 409, 'Duplicate product id/slug')
    next(err)
  }
})

router.patch('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '').trim()
    if (!id) return sendError(res, 400, 'Missing product id')

    const parsed = productInputSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid product payload', parsed.error.flatten())

    const data = parsed.data
    const update = { ...data }

    if (data.name && !data.slug) {
      update.slug = await uniqueSlug(data.name, id)
    }
    if (data.slug) {
      update.slug = await uniqueSlug(data.slug, id)
    }

    const product = await Product.findOneAndUpdate({ id }, update, { new: true }).lean()
    if (!product) return sendError(res, 404, 'Product not found')

    return sendJson(res, 200, { product })
  } catch (err) {
    if (String(err?.code) === '11000') return sendError(res, 409, 'Duplicate slug')
    next(err)
  }
})

router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '').trim()
    if (!id) return sendError(res, 400, 'Missing product id')

    const deleted = await Product.findOneAndDelete({ id }).lean()
    if (!deleted) return sendError(res, 404, 'Product not found')
    return sendJson(res, 200, { ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/offers', requireAdmin, async (req, res, next) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 }).lean()
    return sendJson(res, 200, { offers })
  } catch (err) {
    next(err)
  }
})

const offerSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  minOrder: z.number().min(0).optional(),
  type: z.enum(['percent', 'flat']),
  value: z.number().positive(),
  active: z.boolean().optional(),
})

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

router.post('/offers', requireAdmin, async (req, res, next) => {
  try {
    const parsed = offerSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid offer payload', parsed.error.flatten())

    const data = parsed.data
    const offer = await Offer.create({
      ...data,
      id: data.id?.trim() || createPublicId('offer'),
      code: normalizeCode(data.code),
      description: data.description ?? '',
      minOrder: data.minOrder ?? 0,
      active: data.active ?? true,
    })

    return sendJson(res, 201, { offer })
  } catch (err) {
    if (String(err?.code) === '11000') return sendError(res, 409, 'Duplicate offer id/code')
    next(err)
  }
})

router.patch('/offers/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '').trim()
    if (!id) return sendError(res, 400, 'Missing offer id')

    const parsed = offerSchema.partial().safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid offer payload', parsed.error.flatten())

    const data = parsed.data
    if (data.code) data.code = normalizeCode(data.code)

    const offer = await Offer.findOneAndUpdate({ id }, data, { new: true }).lean()
    if (!offer) return sendError(res, 404, 'Offer not found')

    return sendJson(res, 200, { offer })
  } catch (err) {
    if (String(err?.code) === '11000') return sendError(res, 409, 'Duplicate offer code')
    next(err)
  }
})

router.delete('/offers/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '').trim()
    if (!id) return sendError(res, 400, 'Missing offer id')

    const deleted = await Offer.findOneAndDelete({ id }).lean()
    if (!deleted) return sendError(res, 404, 'Offer not found')

    return sendJson(res, 200, { ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/orders', requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.query.status ?? '').trim()
    const q = String(req.query.q ?? '').trim()

    const filter = {}
    if (['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) filter.status = status
    if (q) {
      const up = q.trim().toUpperCase()
      filter.$or = [
        { id: { $regex: up, $options: 'i' } },
        { 'customer.fullName': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
      ]
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean()
    return sendJson(res, 200, { orders })
  } catch (err) {
    next(err)
  }
})

router.patch('/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '').trim().toUpperCase()
    if (!id) return sendError(res, 400, 'Missing order id')

    const parsed = z.object({ status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered']) }).safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid status', parsed.error.flatten())

    const order = await Order.findOneAndUpdate(
      { id },
      {
        status: parsed.data.status,
        $push: { statusHistory: { status: parsed.data.status, at: new Date(), updatedBy: req.admin?.email ?? 'admin' } },
      },
      { new: true },
    ).lean()

    if (!order) return sendError(res, 404, 'Order not found')

    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: `MANOR Order Update · ${order.id}`,
        html: renderStatusUpdate(order),
      })
    }

    clearAnalyticsCache()

    return sendJson(res, 200, { order })
  } catch (err) {
    next(err)
  }
})

router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim().toLowerCase()
    const match = {}
    if (q) {
      match.$or = [
        { 'customer.fullName': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
      ]
    }

    const rows = await Order.aggregate([
      { $match: match },
      {
        $project: {
          fullName: '$customer.fullName',
          email: '$customer.email',
          phone: '$customer.phone',
          total: '$summary.total',
          createdAt: '$createdAt',
        },
      },
      {
        $addFields: {
          key: {
            $cond: [{ $ifNull: ['$email', false] }, '$email', '$phone'],
          },
        },
      },
      { $match: { key: { $ne: null } } },
      {
        $group: {
          _id: '$key',
          key: { $first: '$key' },
          name: { $first: '$fullName' },
          email: { $first: '$email' },
          phone: { $first: '$phone' },
          orders: { $sum: 1 },
          spent: { $sum: '$total' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      { $sort: { spent: -1 } },
      { $limit: 500 },
    ])

    return sendJson(res, 200, { users: rows })
  } catch (err) {
    next(err)
  }
})

router.get('/analytics', requireAdmin, async (req, res, next) => {
  try {
    const cached = getAnalyticsCache()
    if (cached) return sendJson(res, 200, cached)

    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 13)

    const [totalOrders, revenueAgg, pendingOrders, customOrders, totalUsersAgg, revenueByDayAgg, mixAgg, topAgg] =
      await Promise.all([
        Order.countDocuments({}),
        Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$summary.total' } } }]),
        Order.countDocuments({ status: 'Pending' }),
        Order.countDocuments({ 'items.kind': 'custom' }),
        Order.aggregate([
          {
            $project: {
              key: {
                $cond: [{ $ifNull: ['$customer.email', false] }, '$customer.email', '$customer.phone'],
              },
            },
          },
          { $match: { key: { $ne: null } } },
          { $group: { _id: '$key' } },
          { $count: 'total' },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              total: { $sum: '$summary.total' },
            },
          },
        ]),
        Order.aggregate([
          { $unwind: '$items' },
          {
            $project: {
              kind: '$items.kind',
              productId: '$items.productId',
              qty: '$items.quantity',
            },
          },
          { $lookup: { from: 'products', localField: 'productId', foreignField: 'id', as: 'product' } },
          { $addFields: { category: { $ifNull: [{ $first: '$product.category' }, null] } } },
          { $group: { _id: { kind: '$kind', category: '$category' }, qty: { $sum: '$qty' } } },
        ]),
        Order.aggregate([
          { $unwind: '$items' },
          { $match: { 'items.kind': 'product' } },
          {
            $group: {
              _id: '$items.productId',
              qty: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 6 },
          { $lookup: { from: 'products', localField: '_id', foreignField: 'id', as: 'product' } },
          { $addFields: { product: { $first: '$product' } } },
          {
            $project: {
              _id: 0,
              productId: '$_id',
              qty: 1,
              revenue: 1,
              name: '$product.name',
              category: '$product.category',
            },
          },
        ]),
      ])

    const revenue = revenueAgg?.[0]?.revenue ?? 0
    const totalUsers = totalUsersAgg?.[0]?.total ?? 0

    const revenueMap = new Map(revenueByDayAgg.map((row) => [row._id, row.total]))
    const days = []
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        key,
        label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        value: revenueMap.get(key) ?? 0,
      })
    }
    const max = Math.max(...days.map((d) => d.value), 1)
    const revenueByDay = days.map((d) => ({ ...d, pct: Math.round((d.value / max) * 100) }))

    const mixCounts = { tea: 0, gift: 0, custom: 0 }
    for (const row of mixAgg) {
      if (row._id?.kind === 'custom') mixCounts.custom += row.qty
      if (row._id?.kind === 'product') {
        if (row._id?.category === 'gift') mixCounts.gift += row.qty
        else mixCounts.tea += row.qty
      }
    }
    const mixTotal = mixCounts.tea + mixCounts.gift + mixCounts.custom || 1
    const orderMix = [
      { key: 'tea', label: 'Tea', value: mixCounts.tea },
      { key: 'gift', label: 'Gifts', value: mixCounts.gift },
      { key: 'custom', label: 'Custom tea', value: mixCounts.custom },
    ].map((r) => ({ ...r, pct: Math.round((r.value / mixTotal) * 100) }))

    const payload = {
      summary: {
        totalOrders,
        revenue,
        pendingOrders,
        customOrders,
        totalUsers,
      },
      revenueByDay,
      orderMix,
      topProducts: topAgg ?? [],
    }

    setAnalyticsCache(payload)
    return sendJson(res, 200, payload)
  } catch (err) {
    next(err)
  }
})

export default router
