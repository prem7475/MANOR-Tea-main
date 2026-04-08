import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function normalizeUrl(value) {
  const url = String(value ?? '').trim()
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function main() {
  const rootDir = path.resolve(process.cwd())
  const publicDir = path.join(rootDir, 'public')

  const siteUrl =
    normalizeUrl(process.env.SITE_URL) ||
    normalizeUrl(process.env.URL) ||
    normalizeUrl('https://manor-tea.netlify.app')

  const { products } = await import(pathToFileURL(path.join(rootDir, 'src/assets/data/products.js')).href)

  const routes = [
    '/',
    '/products',
    '/gifts',
    '/offers',
    '/customize-tea',
    '/about',
    '/contact',
    '/helpdesk',
    '/track-order',
    '/payments',
    '/leadership',
    '/favourites',
    '/cart',
    '/checkout',
    '/terms',
    '/privacy',
    '/refunds',
    '/shipping',
  ]

  const productRoutes = (products ?? []).map((p) => `/products/${p.slug ?? p.id}`)
  const allRoutes = Array.from(new Set([...routes, ...productRoutes])).sort()

  const lastmod = new Date().toISOString()
  const urls = allRoutes
    .map((route) => {
      const loc = `${siteUrl}${route === '/' ? '' : route}`
      return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

  const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`

  await fs.mkdir(publicDir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8'),
    fs.writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8'),
  ])

  console.log(`[seo] Wrote sitemap.xml + robots.txt for ${allRoutes.length} routes (base: ${siteUrl})`)
}

main().catch((err) => {
  console.error('[seo] Failed to generate sitemap/robots:', err)
  process.exitCode = 1
})
