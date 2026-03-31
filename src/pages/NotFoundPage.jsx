import React from 'react'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function NotFoundPage() {
  useDocumentTitle('Not found')

  return (
    <PageShell
      title="Page not found"
      subtitle="The link may be incorrect, or the page has moved. Use the navigation to continue."
      actions={<Button to="/" variant="secondary">Go home</Button>}
    >
      <Card style={{ padding: 18, borderRadius: 'var(--radius-lg)' }}>
        <Button to="/products" variant="ghost">
          Browse products
        </Button>
      </Card>
    </PageShell>
  )
}

