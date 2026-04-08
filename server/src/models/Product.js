import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    groupId: { type: String, default: null, trim: true },
    variantLabel: { type: String, default: null, trim: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, default: '', trim: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    category: { type: String, enum: ['tea', 'gift'], required: true },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: null },
    image: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
)

ProductSchema.index({ id: 1 }, { unique: true })
ProductSchema.index({ slug: 1 }, { unique: true })
ProductSchema.index({ category: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ createdAt: -1 })

export const Product = mongoose.model('Product', ProductSchema)
