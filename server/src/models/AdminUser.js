import mongoose from 'mongoose'

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

AdminUserSchema.index({ email: 1 }, { unique: true })

export const AdminUser = mongoose.model('AdminUser', AdminUserSchema)
