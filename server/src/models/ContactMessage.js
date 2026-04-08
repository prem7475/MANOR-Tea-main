import mongoose from 'mongoose'

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

ContactMessageSchema.index({ createdAt: -1 })
ContactMessageSchema.index({ email: 1 })

export const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema)
