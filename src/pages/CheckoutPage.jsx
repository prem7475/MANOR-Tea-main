import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './CheckoutPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import OrderSummary from '../components/commerce/OrderSummary.jsx'
import { useCartStore } from '../hooks/useCartStore.js'
import { useOrdersStore } from '../hooks/useOrdersStore.js'
import { useUiStore } from '../hooks/useUiStore.js'
import { isNonEmpty, isValidEmail } from '../utils/validation.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const paymentMethods = [
  { id: 'upi', label: 'UPI (Mock)', note: 'Instant, simple, secure UI.' },
  { id: 'card', label: 'Card (Mock)', note: 'Visa / Mastercard / RuPay.' },
  { id: 'cod', label: 'Cash on delivery', note: 'Pay at delivery (demo).' },
]

export default function CheckoutPage() {
  useDocumentTitle('Checkout')

  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const getSummary = useCartStore((s) => s.getSummary)
  const clearCart = useCartStore((s) => s.clearCart)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const notify = useUiStore((s) => s.notify)

  const summary = getSummary()

  const [step, setStep] = useState(1)
  const [isPlacing, setIsPlacing] = useState(false)

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
  })

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [payment, setPayment] = useState('upi')
  const [errors, setErrors] = useState({})

  if (!items.length) {
    return (
      <PageShell
        title="Checkout"
        subtitle="Your cart is empty. Add a product first."
        actions={<Button to="/products" variant="secondary">Browse products</Button>}
      >
        <Card className={styles.empty}>
          <div className={styles.emptyTitle}>Nothing to checkout</div>
          <div className={styles.emptyText}>Choose a tea or hamper and come back here.</div>
        </Card>
      </PageShell>
    )
  }

  function validateStep(nextStep) {
    const nextErrors = {}
    if (nextStep >= 2) {
      if (!isNonEmpty(customer.fullName)) nextErrors.fullName = 'Enter your full name'
      if (!isNonEmpty(customer.phone)) nextErrors.phone = 'Enter your phone number'
      if (customer.email && !isValidEmail(customer.email)) nextErrors.email = 'Enter a valid email'
      if (!isNonEmpty(address.line1)) nextErrors.line1 = 'Enter address line 1'
      if (!isNonEmpty(address.city)) nextErrors.city = 'Enter your city'
      if (!isNonEmpty(address.pincode)) nextErrors.pincode = 'Enter pincode'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function next() {
    const ok = validateStep(step + 1)
    if (!ok) {
      notify({ title: 'Please check details', message: 'Some fields need attention.', intent: 'warning' })
      return
    }
    setStep((s) => Math.min(3, s + 1))
  }

  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  async function placeOrder() {
    const ok = validateStep(3)
    if (!ok) return

    setIsPlacing(true)
    notify({ title: 'Processing payment', message: 'This is a mock payment flow.', intent: 'info' })

    await new Promise((r) => window.setTimeout(r, 900))

    const orderId = createOrder({
      customer,
      address,
      payment: { method: payment, status: 'paid (mock)' },
      items,
      summary: { ...summary, offerCode: useCartStore.getState().offerCode ?? null },
    })

    clearCart()
    setIsPlacing(false)
    navigate(`/thank-you?orderId=${encodeURIComponent(orderId)}`, { replace: true })
  }

  return (
    <PageShell
      title="Checkout"
      subtitle="A calm, simple flow — delivery details, payment choice, and confirmation."
      actions={
        <Button to="/cart" variant="ghost">
          Back to cart
        </Button>
      }
    >
      <div className={styles.layout}>
        <div className={styles.form}>
          <Card className={styles.stepper}>
            <div className={styles.stepperRow} aria-label="Checkout steps">
              <div className={`${styles.stepPill} ${step >= 1 ? styles.stepActive : ''}`}>1 · Details</div>
              <div className={`${styles.stepPill} ${step >= 2 ? styles.stepActive : ''}`}>2 · Payment</div>
              <div className={`${styles.stepPill} ${step >= 3 ? styles.stepActive : ''}`}>3 · Review</div>
            </div>
          </Card>

          {step === 1 && (
            <Card className={styles.card}>
              <div className={styles.cardTitle}>Delivery details</div>
              <div className={styles.fields}>
                <Input
                  label="Full name"
                  name="fullName"
                  value={customer.fullName}
                  onChange={(e) => setCustomer((s) => ({ ...s, fullName: e.target.value }))}
                  error={errors.fullName}
                  placeholder="Your name"
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))}
                  error={errors.phone}
                  placeholder="10-digit mobile"
                />
                <Input
                  label="Email (optional)"
                  name="email"
                  value={customer.email}
                  onChange={(e) => setCustomer((s) => ({ ...s, email: e.target.value }))}
                  error={errors.email}
                  placeholder="you@example.com"
                />

                <Input
                  label="Address line 1"
                  name="line1"
                  value={address.line1}
                  onChange={(e) => setAddress((s) => ({ ...s, line1: e.target.value }))}
                  error={errors.line1}
                  placeholder="House / street"
                />
                <Input
                  label="Address line 2 (optional)"
                  name="line2"
                  value={address.line2}
                  onChange={(e) => setAddress((s) => ({ ...s, line2: e.target.value }))}
                  placeholder="Landmark"
                />

                <div className={styles.row3}>
                  <Input
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={(e) => setAddress((s) => ({ ...s, city: e.target.value }))}
                    error={errors.city}
                    placeholder="City"
                  />
                  <Input
                    label="State (optional)"
                    name="state"
                    value={address.state}
                    onChange={(e) => setAddress((s) => ({ ...s, state: e.target.value }))}
                    placeholder="State"
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress((s) => ({ ...s, pincode: e.target.value }))}
                    error={errors.pincode}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className={styles.navButtons}>
                <Button variant="secondary" onClick={next}>
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className={styles.card}>
              <div className={styles.cardTitle}>Payment</div>
              <div className={styles.paymentList} role="radiogroup" aria-label="Payment method">
                {paymentMethods.map((m) => (
                  <label key={m.id} className={`${styles.payment} ${payment === m.id ? styles.paymentActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                    />
                    <div>
                      <div className={styles.paymentLabel}>{m.label}</div>
                      <div className={styles.paymentNote}>{m.note}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className={styles.navButtons}>
                <Button variant="ghost" onClick={back}>
                  Back
                </Button>
                <Button variant="secondary" onClick={next}>
                  Review order
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className={styles.card}>
              <div className={styles.cardTitle}>Review & place order</div>
              <div className={styles.review}>
                <div className={styles.reviewBlock}>
                  <div className={styles.reviewTitle}>Deliver to</div>
                  <div className={styles.reviewText}>{customer.fullName}</div>
                  <div className={styles.reviewText}>{customer.phone}</div>
                  {customer.email ? <div className={styles.reviewText}>{customer.email}</div> : null}
                  <div className={styles.reviewText}>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </div>
                  <div className={styles.reviewText}>
                    {address.city}
                    {address.state ? `, ${address.state}` : ''} · {address.pincode}
                  </div>
                </div>

                <div className={styles.reviewBlock}>
                  <div className={styles.reviewTitle}>Payment method</div>
                  <div className={styles.reviewText}>
                    {paymentMethods.find((p) => p.id === payment)?.label ?? '—'}
                  </div>
                  <div className={styles.reviewHint}>This is a mock payment UI for demo.</div>
                </div>
              </div>

              <div className={styles.navButtons}>
                <Button variant="ghost" onClick={back}>
                  Back
                </Button>
                <Button onClick={placeOrder} loading={isPlacing}>
                  Pay & place order
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className={styles.summary}>
          <OrderSummary compact cta={null} />
        </div>
      </div>
    </PageShell>
  )
}
