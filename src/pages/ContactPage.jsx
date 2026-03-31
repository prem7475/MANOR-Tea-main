import React, { useState } from 'react'

import styles from './ContactPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useUiStore } from '../hooks/useUiStore.js'
import { isNonEmpty, isValidEmail } from '../utils/validation.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function ContactPage() {
  useDocumentTitle('Contact')

  const notify = useUiStore((s) => s.notify)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!isNonEmpty(form.name)) e.name = 'Enter your name'
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email'
    if (!isNonEmpty(form.message)) e.message = 'Write a short message'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(event) {
    event.preventDefault()
    if (!validate()) {
      notify({ title: 'Please check details', message: 'Some fields need attention.', intent: 'warning' })
      return
    }
    notify({ title: 'Message received', message: 'This is a demo form (no email sent).', intent: 'success' })
    setForm({ name: '', email: '', message: '' })
    setErrors({})
  }

  return (
    <PageShell
      title="Contact"
      subtitle="Questions, bulk orders, or feedback — we’re here. We keep support calm and clear."
      actions={
        <>
          <Button to="/helpdesk" variant="ghost">
            Helpdesk
          </Button>
          <Button to="/track-order" variant="secondary">
            Track order
          </Button>
        </>
      }
    >
      <div className={styles.layout}>
        <Card className={styles.card}>
          <div className={styles.cardTitle}>Write to us</div>
          <form className={styles.form} onSubmit={submit}>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              error={errors.name}
              placeholder="Your name"
            />
            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              error={errors.email}
              placeholder="you@example.com"
            />
            <label className={styles.textareaField}>
              <span className={styles.textareaLabel}>Message</span>
              <textarea
                className={`${styles.textarea} ${errors.message ? styles.textareaError : ''}`}
                value={form.message}
                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                rows={6}
                placeholder="How can we help?"
              />
              {errors.message ? <span className={styles.error}>{errors.message}</span> : null}
            </label>

            <Button type="submit" fullWidth>
              Send message
            </Button>
          </form>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardTitle}>Contact details</div>
          <div className={styles.details}>
            <div>
              <div className={styles.detailLabel}>Email</div>
              <div className={styles.detailValue}>support@manor-tea.example</div>
            </div>
            <div>
              <div className={styles.detailLabel}>Phone</div>
              <div className={styles.detailValue}>+91 00000 00000</div>
            </div>
            <div>
              <div className={styles.detailLabel}>Location</div>
              <div className={styles.detailValue}>Nagpur, India (demo)</div>
            </div>
          </div>
          <div className={styles.note}>
            Replace placeholders with real contact info before production deployment.
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

