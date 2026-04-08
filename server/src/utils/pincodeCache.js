const CACHE_TTL_MS = 1000 * 60 * 60 * 24

const cache = new Map()

export function getPincodeCache(code) {
  const entry = cache.get(code)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(code)
    return null
  }
  return entry.value
}

export function setPincodeCache(code, value) {
  cache.set(code, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

export function clearPincodeCache() {
  cache.clear()
}
