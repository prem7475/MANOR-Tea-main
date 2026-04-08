const CACHE_TTL_MS = 1000 * 60 * 2

const cache = {
  analytics: null,
  expiresAt: 0,
}

export function getAnalyticsCache() {
  if (cache.analytics && cache.expiresAt > Date.now()) return cache.analytics
  return null
}

export function setAnalyticsCache(payload) {
  cache.analytics = payload
  cache.expiresAt = Date.now() + CACHE_TTL_MS
  return cache.analytics
}

export function clearAnalyticsCache() {
  cache.analytics = null
  cache.expiresAt = 0
}
