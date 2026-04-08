import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { env } from './config/env.js'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'
import { errorHandler, notFound } from './middleware/error.js'
import { requestLogger } from './middleware/logger.js'

function parseOrigins(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ''))
}

function normalizeOrigin(value) {
  return String(value ?? '').trim().replace(/\/$/, '')
}

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(helmet())

  const origins = parseOrigins(env.corsOrigins)
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (!origins.length) return callback(null, true)
        const normalized = normalizeOrigin(origin)
        if (origins.includes(normalized)) return callback(null, true)
        return callback(new Error('Not allowed by CORS'))
      },
    }),
  )

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 240,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use(express.json({ limit: '1mb' }))
  app.use(requestLogger)

  app.use('/api', publicRoutes)
  app.use('/api/admin', adminRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
