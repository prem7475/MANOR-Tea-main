import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import RequireAdminAuth from './components/RequireAdminAuth.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import AdminOffersPage from './pages/AdminOffersPage.jsx'
import AdminOrdersPage from './pages/AdminOrdersPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import AdminCustomTeaOrdersPage from './pages/AdminCustomTeaOrdersPage.jsx'
import AdminSettingsPage from './pages/AdminSettingsPage.jsx'
import AdminNotFoundPage from './pages/AdminNotFoundPage.jsx'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />

      <Route
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="custom-orders" element={<AdminCustomTeaOrdersPage />} />
        <Route path="custom-tea-orders" element={<Navigate to="/admin/custom-orders" replace />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<AdminNotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  )
}
