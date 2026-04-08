import dotenv from 'dotenv'

dotenv.config()

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function optional(name, fallback = '') {
  return process.env[name] ?? fallback
}

export const env = Object.freeze({
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '8080')) || 8080,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:5173'),
  adminSeed: Object.freeze({
    email: optional('ADMIN_EMAIL', 'admin@manor.com').trim().toLowerCase(),
    password: optional('ADMIN_PASSWORD', 'manoradmin'),
    name: optional('ADMIN_NAME', 'MANOR Admin'),
  }),
})

