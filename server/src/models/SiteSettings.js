import mongoose from 'mongoose'

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    payments: {
      upi: { type: Boolean, default: true },
      card: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
    },
    notifications: { type: Boolean, default: true },
    contact: {
      email: { type: String, default: 'support@manor-tea.com' },
      phone: { type: String, default: '+91 98765 43210' },
      location: { type: String, default: 'Nagpur, India' },
    },
    shipping: {
      freeAbove: { type: Number, default: 499 },
      fee: { type: Number, default: 49 },
    },
  },
  { timestamps: true },
)

SiteSettingsSchema.index({ key: 1 }, { unique: true })

export const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema)
