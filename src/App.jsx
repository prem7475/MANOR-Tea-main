import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ScreenLoader from './components/ui/ScreenLoader.jsx'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const ThankYouPage = lazy(() => import('./pages/ThankYouPage.jsx'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage.jsx'))
const HelpdeskPage = lazy(() => import('./pages/HelpdeskPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const CustomTeaBuilderPage = lazy(() => import('./pages/CustomTeaBuilderPage.jsx'))
const GiftsPage = lazy(() => import('./pages/GiftsPage.jsx'))
const OffersPage = lazy(() => import('./pages/OffersPage.jsx'))
const LeadershipPage = lazy(() => import('./pages/LeadershipPage.jsx'))
const PaymentsInfoPage = lazy(() => import('./pages/PaymentsInfoPage.jsx'))
const FavouritesPage = lazy(() => import('./pages/FavouritesPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const RefundPage = lazy(() => import('./pages/RefundPage.jsx'))
const ShippingPage = lazy(() => import('./pages/ShippingPage.jsx'))

export default function App() {
  return (
    <Suspense fallback={<ScreenLoader label="Loading experience..." />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />

        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/customize-tea" element={<CustomTeaBuilderPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/helpdesk" element={<HelpdeskPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/leadership" element={<LeadershipPage />} />
          <Route path="/payments" element={<PaymentsInfoPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refunds" element={<RefundPage />} />
          <Route path="/shipping" element={<ShippingPage />} />

          {/* Backwards compatible route (legacy) */}
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
