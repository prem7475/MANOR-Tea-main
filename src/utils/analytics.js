const GA_ID = import.meta.env.VITE_GA_ID

let initialized = false

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()

    const script = document.createElement('script')
    script.async = true
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load analytics'))
    document.head.appendChild(script)
  })
}

export async function initAnalytics() {
  if (!GA_ID || initialized || typeof window === 'undefined') return
  initialized = true

  try {
    await loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { anonymize_ip: true })
  } catch {
    // silently fail in demo environments
  }
}

export function trackEvent(event, params = {}) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', event, params)
}

