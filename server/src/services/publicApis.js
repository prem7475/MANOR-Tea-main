import { getPincodeCache, setPincodeCache } from '../utils/pincodeCache.js'

const PINCODE_ENDPOINT = 'https://api.postalpincode.in/pincode'

async function fetchJson(url, { timeoutMs = 6000 } = {}) {
  const controller = new AbortController()
  const handle = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Request failed (${res.status})`)
    return res.json()
  } finally {
    clearTimeout(handle)
  }
}

export async function lookupPincode(code) {
  const trimmed = String(code ?? '').trim()
  if (!trimmed) return null

  const cached = getPincodeCache(trimmed)
  if (cached) return cached

  const data = await fetchJson(`${PINCODE_ENDPOINT}/${encodeURIComponent(trimmed)}`)
  const row = Array.isArray(data) ? data[0] : null
  if (!row || row.Status !== 'Success' || !Array.isArray(row.PostOffice) || !row.PostOffice.length) {
    const payload = { ok: false, message: row?.Message || 'Invalid pincode' }
    setPincodeCache(trimmed, payload)
    return payload
  }

  const primary = row.PostOffice[0]
  const payload = {
    ok: true,
    pincode: primary.Pincode,
    city: primary.District,
    state: primary.State,
    region: primary.Region,
    country: primary.Country,
    postOffices: row.PostOffice.map((p) => ({
      name: p.Name,
      branchType: p.BranchType,
      deliveryStatus: p.DeliveryStatus,
    })),
  }

  setPincodeCache(trimmed, payload)
  return payload
}
