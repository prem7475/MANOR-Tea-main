import mongoose from 'mongoose'

const OfferSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    minOrder: { type: Number, default: 0 },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

OfferSchema.index({ id: 1 }, { unique: true })
OfferSchema.index({ code: 1 }, { unique: true })
OfferSchema.index({ active: 1 })
OfferSchema.index({ createdAt: -1 })

export const Offer = mongoose.model('Offer', OfferSchema)
