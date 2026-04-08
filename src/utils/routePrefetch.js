const routeImporters = {
  '/': () => import('../pages/HomePage.jsx'),
  '/about': () => import('../pages/AboutPage.jsx'),
  '/products': () => import('../pages/ProductsPage.jsx'),
  '/product': () => import('../pages/ProductDetailPage.jsx'),
  '/cart': () => import('../pages/CartPage.jsx'),
  '/checkout': () => import('../pages/CheckoutPage.jsx'),
  '/thank-you': () => import('../pages/ThankYouPage.jsx'),
  '/track-order': () => import('../pages/TrackOrderPage.jsx'),
  '/helpdesk': () => import('../pages/HelpdeskPage.jsx'),
  '/contact': () => import('../pages/ContactPage.jsx'),
  '/customize-tea': () => import('../pages/CustomTeaBuilderPage.jsx'),
  '/gifts': () => import('../pages/GiftsPage.jsx'),
  '/offers': () => import('../pages/OffersPage.jsx'),
  '/leadership': () => import('../pages/LeadershipPage.jsx'),
  '/payments': () => import('../pages/PaymentsInfoPage.jsx'),
  '/favourites': () => import('../pages/FavouritesPage.jsx'),
  '/admin': () => import('../admin/AdminApp.jsx'),
}

const prefetched = new Set()

function normalizePath(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return '/'
  const withoutHash = raw.split('#')[0]
  const withoutQuery = withoutHash.split('?')[0]
  return withoutQuery || '/'
}

export function prefetchByPath(path) {
  const clean = normalizePath(path)
  if (!clean) return

  const isProductDetail = clean.startsWith('/products/')
  const key = isProductDetail ? '/product' : clean

  if (prefetched.has(key)) return
  const importer = routeImporters[key]
  if (!importer) return

  prefetched.add(key)
  importer()
}

export function prefetchCriticalRoutes() {
  ;['/products', '/cart', '/checkout', '/offers'].forEach(prefetchByPath)
}

