import express from 'express'
import { z } from 'zod'

import { Product } from '../models/Product.js'
import { Offer } from '../models/Offer.js'
import { Order } from '../models/Order.js'
import { SiteSettings } from '../models/SiteSettings.js'
import { ContactMessage } from '../models/ContactMessage.js'
import { createOrderId } from '../utils/ids.js'
import { sendError, sendJson } from '../utils/http.js'
import { renderOrderConfirmation, sendEmail } from '../services/email.js'
import { clearAnalyticsCache } from '../utils/analyticsCache.js'
import { lookupPincode } from '../services/publicApis.js'

const router = express.Router()

router.get('/health', (req, res) => sendJson(res, 200, { ok: true }))

router.get('/products', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim().toLowerCase()
    const cat = String(req.query.cat ?? '').trim()

    const filter = {}
    if (cat === 'tea' || cat === 'gift') filter.category = cat
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { subtitle: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [q] } },
      ]
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()
    sendJson(res, 200, { products })
  } catch (err) {
    next(err)
  }
})

router.get('/products/:slugOrId', async (req, res, next) => {
  try {
    const key = String(req.params.slugOrId ?? '').trim()
    if (!key) return sendError(res, 400, 'Missing product key')

    const product =
      (await Product.findOne({ slug: key }).lean()) ||
      (await Product.findOne({ id: key }).lean())

    if (!product) return sendError(res, 404, 'Product not found')
    return sendJson(res, 200, { product })
  } catch (err) {
    next(err)
  }
})

router.get('/offers', async (req, res, next) => {
  try {
    const offers = await Offer.find({ active: true }).sort({ createdAt: -1 }).lean()
    sendJson(res, 200, { offers })
  } catch (err) {
    next(err)
  }
})

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
})

router.post('/contact', async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body)
    if (!parsed.success) return sendError(res, 400, 'Invalid contact payload', parsed.error.flatten())

    await ContactMessage.create(parsed.data)
    return sendJson(res, 201, { ok: true })
  } catch (err) {
    next(err)
  }
})

async function getSettingsDoc() {
  const existing = await SiteSettings.findOne({ key: 'default' }).lean()
  if (existing) return existing
  const created = await SiteSettings.create({ key: 'default' })
  return created.toObject()
}

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await getSettingsDoc()
    return sendJson(res, 200, { settings })
  } catch (err) {
    next(err)
  }
})

router.get('/pincode/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code ?? '').trim()
    if (!/^\d{6}$/.test(code)) return sendError(res, 400, 'Invalid pincode')

    const data = await lookupPincode(code)
    if (!data?.ok) return sendError(res, 404, data?.message || 'Pincode not found')
    return sendJson(res, 200, { pincode: data })
  } catch (err) {
    next(err)
  }
})

const orderLineSchema = z.object({
  lineId: z.string().min(1),
  kind: z.enum(['product', 'custom']),
  productId: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1).optional(),
  unitPrice: z.number().positive().optional(),
  quantity: z.number().int().min(1).max(99),
  meta: z.any().optional(),
})

const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional().or(z.literal('')),
  }),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional().default(''),
    city: z.string().min(2),
    state: z.string().optional().default(''),
    pincode: z.string().min(3),
  }),
  payment: z.object({
    method: z.enum(['upi', 'card', 'cod']).default('upi'),
  }),
  items: z.array(orderLineSchema).min(1),
  offerCode: z.string().optional().default(''),
  utm: z.any().optional(),
  note: z.string().optional(),
  giftNote: z.string().optional(),
})

function normalizeOfferCode(value) {
  const code = String(value ?? '').trim().toUpperCase()
  return code.length ? code : null
}

router.post('/orders', async (req, res, next) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendError(res, 400, 'Invalid order payload', parsed.error.flatten())
    }

    const { customer, address, payment, items, offerCode } = parsed.data

    // Build server-trusted line items for catalog products.
    const builtLines = []
    for (const line of items) {
      if (line.kind === 'product') {
        const pid = String(line.productId ?? '').trim()
        if (!pid) return sendError(res, 400, 'Missing productId for product line')
        const product = await Product.findOne({ id: pid }).lean()
        if (!product) return sendError(res, 400, `Unknown productId: ${pid}`)
        if (!product.inStock) return sendError(res, 409, `${product.name} is out of stock`)

        builtLines.push({
          lineId: line.lineId,
          kind: 'product',
          productId: product.id,
          title: product.name,
          subtitle: product.subtitle ?? '',
          image: product.image,
          unitPrice: product.price,
          quantity: line.quantity,
          meta: null,
        })
      } else {
        // Custom blend line: trust UI for title/meta/price in this demo.
        const unitPrice = Number(line.unitPrice)
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) return sendError(res, 400, 'Invalid unitPrice for custom line')

        builtLines.push({
          lineId: line.lineId,
          kind: 'custom',
          productId: null,
          title: String(line.title ?? 'Custom tea').trim() || 'Custom tea',
          subtitle: String(line.subtitle ?? 'Custom tea blend').trim() || 'Custom tea blend',
          image: String(line.image ?? '/imgtea.jpeg').trim() || '/imgtea.jpeg',
          unitPrice,
          quantity: line.quantity,
          meta: line.meta ?? null,
        })
      }
    }

    const subtotal = builtLines.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49

    const normalizedOffer = normalizeOfferCode(offerCode)
    const offer = normalizedOffer ? await Offer.findOne({ code: normalizedOffer, active: true }).lean() : null

    let discount = 0
    if (offer && subtotal >= (offer.minOrder ?? 0)) {
      discount =
        offer.type === 'percent'
          ? Math.round((subtotal * offer.value) / 100)
          : Math.min(offer.value, subtotal)
    }

    const total = Math.max(0, subtotal - discount + shipping)
    const id = createOrderId()

    const now = new Date()
    const order = await Order.create({
      id,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', at: now, updatedBy: 'system' }],
      customer: { fullName: customer.fullName, phone: customer.phone, email: customer.email ? String(customer.email).trim().toLowerCase() : null },
      address,
      payment: { method: payment.method, status: 'paid', provider: 'demo', paidAt: now },
      currency: 'INR',
      source: 'storefront',
      meta: { note: String(parsed.data.note ?? ''), giftNote: String(parsed.data.giftNote ?? ''), utm: parsed.data.utm ?? null },
      items: builtLines,
      summary: { subtotal, discount, tax: 0, shipping, total, offerCode: normalizedOffer },
    })

    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: `MANOR Order Confirmation · ${order.id}`,
        html: renderOrderConfirmation(order),
      })
    }

    clearAnalyticsCache()

    return sendJson(res, 201, { orderId: order.id })
  } catch (err) {
    // Very rare: ID collision.
    if (String(err?.code) === '11000') return sendError(res, 409, 'Please retry')
    next(err)
  }
})

router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const id = String(req.params.orderId ?? '').trim().toUpperCase()
    if (!id) return sendError(res, 400, 'Missing orderId')

    const order = await Order.findOne({ id }).lean()
    if (!order) return sendError(res, 404, 'Order not found')

    // Public response: avoid leaking address/customer PII.
    return sendJson(res, 200, {
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        payment: order.payment,
        summary: order.summary,
        items: order.items,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
