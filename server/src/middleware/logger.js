import crypto from 'node:crypto'

import { env } from '../config/env.js'

function safeString(value) {
  return typeof value === 'string' ? value : ''
}

function shouldLog() {
  return env.nodeEnv !== 'test'
}

export function requestLogger(req, res, next) {
  if (!shouldLog()) return next()

  const start = process.hrtime.bigint()
  const reqId = crypto.randomUUID()
  req.id = reqId

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6
    const level =
      res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    const line = [
      `[${new Date().toISOString()}]`,
      level.toUpperCase(),
      safeString(req.method),
      safeString(req.originalUrl || req.url),
      String(res.statusCode),
      `${durationMs.toFixed(1)}ms`,
      `rid=${reqId}`,
    ].join(' ')

    // eslint-disable-next-line no-console
    console.log(line)
  })

  return next()
}
