import React from 'react'
import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'

import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ThankYouPage from './pages/ThankYouPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import HelpdeskPage from './pages/HelpdeskPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import CustomTeaBuilderPage from './pages/CustomTeaBuilderPage.jsx'
import GiftsPage from './pages/GiftsPage.jsx'
import OffersPage from './pages/OffersPage.jsx'
import LeadershipPage from './pages/LeadershipPage.jsx'
import PaymentsInfoPage from './pages/PaymentsInfoPage.jsx'
import FavouritesPage from './pages/FavouritesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
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

        {/* Backwards compatible route (legacy) */}
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
