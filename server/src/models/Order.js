import mongoose from 'mongoose'

const OrderLineSchema = new mongoose.Schema(
  {
    lineId: { type: String, required: true },
    kind: { type: String, enum: ['product', 'custom'], required: true },
    productId: { type: String, default: null },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false },
)

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true }, // e.g. MANOR-XXXXXX
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], required: true },
          at: { type: Date, required: true },
          note: { type: String, default: '' },
          updatedBy: { type: String, default: 'system' },
        },
      ],
      default: [],
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: null, trim: true, lowercase: true },
    },
    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, default: '', trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, default: '', trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    payment: {
      method: { type: String, default: 'upi' },
      status: { type: String, default: 'paid' },
      provider: { type: String, default: 'demo' },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    fulfillment: {
      method: { type: String, default: 'standard' },
      eta: { type: String, default: '' },
    },
    tracking: {
      carrier: { type: String, default: '' },
      trackingId: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
    },
    currency: { type: String, default: 'INR' },
    source: { type: String, default: 'storefront' },
    items: { type: [OrderLineSchema], default: [] },
    summary: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, required: true },
      total: { type: Number, required: true },
      offerCode: { type: String, default: null, trim: true, uppercase: true },
    },
    meta: {
      note: { type: String, default: '' },
      giftNote: { type: String, default: '' },
      utm: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  { timestamps: true },
)

OrderSchema.index({ id: 1 }, { unique: true })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ 'customer.email': 1 })
OrderSchema.index({ 'customer.phone': 1 })
OrderSchema.index({ 'items.productId': 1 })

export const Order = mongoose.model('Order', OrderSchema)
