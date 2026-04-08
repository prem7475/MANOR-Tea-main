import crypto from 'node:crypto'

export function createPublicId(prefix) {
  const value = crypto.randomBytes(6).toString('hex').toUpperCase()
  return `${prefix}-${value}`
}

export function createOrderId() {
  return createPublicId('MANOR')
}

