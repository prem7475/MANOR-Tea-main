import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import styles from './AdminOffersPage.module.css'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import Badge from '../../components/ui/Badge.jsx'
import AdminTable from '../components/AdminTable.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { formatINR } from '../../utils/currency.js'
import { createId } from '../../utils/id.js'
import { createAdminOffer, deleteAdminOffer, fetchAdminOffers, updateAdminOffer } from '../services/adminApi.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import { useOffersStore } from '../../hooks/useOffersStore.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

function normalizeCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

function validateDraft(draft) {
  const errors = {}
  if (!normalizeCode(draft.code)) errors.code = 'Enter a code'
  if (!String(draft.title ?? '').trim()) errors.title = 'Enter a title'
  const minOrder = Number(draft.minOrder)
  if (!Number.isFinite(minOrder) || minOrder < 0) errors.minOrder = 'Enter a minimum order'

  const type = draft.type
  if (type !== 'percent' && type !== 'flat') errors.type = 'Choose a type'

  const value = Number(draft.value)
  if (!Number.isFinite(value) || value <= 0) errors.value = 'Enter a value'
  if (type === 'percent' && value > 90) errors.value = 'Percent should be <= 90'
  return errors
}

const blank = {
  code: '',
  title: '',
  description: '',
  minOrder: 0,
  type: 'percent',
  value: 10,
}

export default function AdminOffersPage() {
  useDocumentTitle('Admin offers')

  const notify = useUiStore((s) => s.notify)
  const refreshStorefrontOffers = useOffersStore((s) => s.refresh)
  const [offers, setOffersState] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [draft, setDraft] = useState(blank)
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      const next = await fetchAdminOffers()
      setOffersState(Array.isArray(next) ? next : [])
    } catch (err) {
      notify({ title: 'Load failed', message: err?.message || 'Unable to load offers', intent: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreate() {
    setEditingId(null)
    setDraft(blank)
    setErrors({})
    setIsEditorOpen(true)
  }

  function openEdit(offer) {
    setEditingId(offer.id)
    setDraft({
      code: offer.code ?? '',
      title: offer.title ?? '',
      description: offer.description ?? '',
      minOrder: offer.minOrder ?? 0,
      type: offer.type ?? 'percent',
      value: offer.value ?? 10,
    })
    setErrors({})
    setIsEditorOpen(true)
  }

  function requestDelete(offer) {
    setEditingId(offer.id)
    setDraft({ code: offer.code, title: offer.title })
    setIsDeleteOpen(true)
  }

  async function save() {
    const nextErrors = validateDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const code = normalizeCode(draft.code)
    const payload = {
      id: editingId ?? createId('offer'),
      code,
      title: draft.title.trim(),
      description: String(draft.description ?? '').trim(),
      minOrder: Number(draft.minOrder) || 0,
      type: draft.type,
      value: Number(draft.value),
      active: true,
    }

    try {
      const nextOffer = editingId ? await updateAdminOffer(editingId, payload) : await createAdminOffer(payload)
      if (!nextOffer) throw new Error('Missing offer from server')

      setOffersState((prev) => {
        const list = Array.isArray(prev) ? prev : []
        return editingId ? list.map((o) => (o.id === editingId ? { ...o, ...nextOffer } : o)) : [nextOffer, ...list]
      })

      setIsEditorOpen(false)
      notify({ title: 'Saved', message: code, intent: 'success' })
      refreshStorefrontOffers()
    } catch (err) {
      notify({ title: 'Save failed', message: err?.message || 'Unable to save offer', intent: 'error' })
    }
  }

  async function confirmDelete() {
    const id = editingId
    if (!id) return
    try {
      await deleteAdminOffer(id)
      setOffersState((prev) => (Array.isArray(prev) ? prev.filter((o) => o.id !== id) : []))
      setIsDeleteOpen(false)
      notify({ title: 'Deleted', message: 'Offer removed.', intent: 'info' })
      refreshStorefrontOffers()
    } catch (err) {
      notify({ title: 'Delete failed', message: err?.message || 'Unable to delete offer', intent: 'error' })
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Code',
        width: '140px',
        render: (o) => <Badge tone="accent">{o.code}</Badge>,
      },
      {
        key: 'title',
        header: 'Offer',
        render: (o) => (
          <div className={styles.offerCell}>
            <div className={styles.offerTitle}>{o.title}</div>
            <div className={styles.offerDesc}>{o.description}</div>
          </div>
        ),
      },
      {
        key: 'minOrder',
        header: 'Min order',
        width: '140px',
        align: 'right',
        render: (o) => formatINR(o.minOrder),
      },
      {
        key: 'benefit',
        header: 'Benefit',
        width: '160px',
        align: 'right',
        render: (o) => (o.type === 'percent' ? `${o.value}%` : formatINR(o.value)),
      },
      {
        key: 'actions',
        header: 'Actions',
        width: '160px',
        align: 'right',
        render: (o) => (
          <div className={styles.rowActions}>
            <IconButton label="Edit" variant="soft" onClick={() => openEdit(o)}>
              <Pencil size={18} />
            </IconButton>
            <IconButton label="Delete" variant="soft" onClick={() => requestDelete(o)}>
              <Trash2 size={18} />
            </IconButton>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Offers</div>
          <div className={styles.subtitle}>Manage discount codes used in cart/checkout (MongoDB backend).</div>
        </div>
        <Button variant="secondary" size="sm" onClick={openCreate} disabled={loading}>
          <Plus size={18} /> Add offer
        </Button>
      </div>

      {loading && offers.length === 0 ? (
        <div className={styles.skeletonTable} aria-label="Loading offers">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className={styles.skeletonRow}>
              <Skeleton className={styles.skeletonCellWide} />
              <Skeleton className={styles.skeletonCell} />
              <Skeleton className={styles.skeletonCell} />
            </div>
          ))}
        </div>
      ) : (
        <AdminTable
          columns={columns}
          rows={offers}
          getRowKey={(o) => o.id}
          emptyLabel={loading ? 'Loading offers...' : 'No offers yet.'}
          emptyText={!loading ? 'Create a code to power checkout discounts.' : undefined}
          emptyAction={
            !loading ? (
              <Button variant="secondary" onClick={openCreate}>
                <Plus size={18} /> Add offer
              </Button>
            ) : null
          }
        />
      )}

      <AdminModal
        open={isEditorOpen}
        title={editingId ? 'Edit offer' : 'Add offer'}
        onClose={() => setIsEditorOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editingId ? 'Save changes' : 'Create offer'}</Button>
          </>
        }
      >
        <div className={styles.form}>
          <Input
            label="Code"
            name="code"
            value={draft.code}
            onChange={(e) => setDraft((s) => ({ ...s, code: e.target.value }))}
            error={errors.code}
            placeholder="MANOR10"
          />
          <Input
            label="Title"
            name="title"
            value={draft.title}
            onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
            error={errors.title}
            placeholder="10% off above ₹500"
          />
          <Input
            label="Description"
            name="description"
            value={draft.description}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
            placeholder="A gentle discount for your everyday restock."
          />
          <div className={styles.row}>
            <Input
              label="Minimum order"
              name="minOrder"
              value={draft.minOrder}
              onChange={(e) => setDraft((s) => ({ ...s, minOrder: e.target.value }))}
              error={errors.minOrder}
              inputMode="numeric"
              placeholder="500"
            />
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Type</span>
              <select
                className={styles.select}
                value={draft.type}
                onChange={(e) => setDraft((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat</option>
              </select>
              {errors.type ? <span className={styles.fieldError}>{errors.type}</span> : null}
            </label>
          </div>
          <Input
            label={draft.type === 'percent' ? 'Percent (%)' : 'Flat discount (₹)'}
            name="value"
            value={draft.value}
            onChange={(e) => setDraft((s) => ({ ...s, value: e.target.value }))}
            error={errors.value}
            inputMode="numeric"
            placeholder={draft.type === 'percent' ? '10' : '100'}
          />
        </div>
      </AdminModal>

      <AdminModal
        open={isDeleteOpen}
        title="Delete offer"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <div className={styles.deleteText}>
          This will remove <strong>{draft.code}</strong> from offers on this device.
        </div>
      </AdminModal>
    </div>
  )
}
