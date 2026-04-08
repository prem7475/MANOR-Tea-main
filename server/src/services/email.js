import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function createTransport() {
  if (!hasSmtpConfig()) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail({ to, subject, html }) {
  if (!to) return { ok: false }
  const transport = createTransport()

  if (!transport) {
    // Fallback for demo environments: log only.
    // eslint-disable-next-line no-console
    console.log(`[email] to=${to} subject="${subject}"`)
    return { ok: true, skipped: true }
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || `MANOR <${env.adminSeed.email}>`,
    to,
    subject,
    html,
  })

  return { ok: true }
}

export function renderOrderConfirmation(order) {
  const items = (order.items || [])
    .map((i) => `<li>${i.title} × ${i.quantity} — ₹${i.unitPrice}</li>`)
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Thank you for your order</h2>
      <p>Your order <strong>${order.id}</strong> has been placed.</p>
      <ul>${items}</ul>
      <p>Total: <strong>₹${order.summary?.total ?? 0}</strong></p>
      <p>Track your order anytime using your Order ID.</p>
    </div>
  `
}

export function renderStatusUpdate(order) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Order update</h2>
      <p>Your order <strong>${order.id}</strong> is now <strong>${order.status}</strong>.</p>
      <p>Total: <strong>₹${order.summary?.total ?? 0}</strong></p>
    </div>
  `
}

