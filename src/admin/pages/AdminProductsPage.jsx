import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Pencil, Plus, RefreshCcw, Table2, Trash2, Upload } from 'lucide-react'

import styles from './AdminProductsPage.module.css'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import IconButton from '../../components/ui/IconButton.jsx'
import Badge from '../../components/ui/Badge.jsx'
import AdminTable from '../components/AdminTable.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { formatINR } from '../../utils/currency.js'
import { fetchAdminProducts, createAdminProduct, deleteAdminProduct, updateAdminProduct } from '../services/adminApi.js'
import { useUiStore } from '../../hooks/useUiStore.js'
import { useProductsStore } from '../../hooks/useProductsStore.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import EmptyState from '../../components/ui/EmptyState.jsx'

async function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

function validateDraft(draft) {
  const errors = {}
  if (!String(draft.name ?? '').trim()) errors.name = 'Enter a name'
  const price = Number(draft.price)
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a valid price'
  if (!String(draft.description ?? '').trim()) errors.description = 'Enter a description'
  if (!String(draft.category ?? '').trim()) errors.category = 'Choose a category'
  if (!String(draft.image ?? '').trim()) errors.image = 'Add an image URL (or upload)'
  return errors
}

const blankDraft = {
  name: '',
  subtitle: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 'tea',
  image: '',
  inStock: true,
}

export default function AdminProductsPage() {
  useDocumentTitle('Admin products')

  const notify = useUiStore((s) => s.notify)
  const refreshStorefrontProducts = useProductsStore((s) => s.refresh)
  const [view, setView] = useState('table')
  const [query, setQuery] = useState('')
  const [products, setProductsState] = useState([])
  const [loading, setLoading] = useState(false)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [draft, setDraft] = useState(blankDraft)
  const [draftErrors, setDraftErrors] = useState({})
  const [editingId, setEditingId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug ?? ''} ${p.category ?? ''} ${p.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, query])

  async function refresh() {
    setLoading(true)
    try {
      const next = await fetchAdminProducts()
      setProductsState(Array.isArray(next) ? next : [])
    } catch (err) {
      notify({ title: 'Load failed', message: err?.message || 'Unable to load products', intent: 'error' })
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
    setDraft(blankDraft)
    setDraftErrors({})
    setIsEditorOpen(true)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setDraft({
      name: product.name ?? '',
      subtitle: product.subtitle ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      category: product.category ?? 'tea',
      image: product.image ?? '',
      inStock: Boolean(product.inStock),
    })
    setDraftErrors({})
    setIsEditorOpen(true)
  }

  function requestDelete(product) {
    setEditingId(product.id)
    setDraft({ name: product.name })
    setIsDeleteOpen(true)
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      notify({
        title: 'Image too large',
        message: 'Please use an image under 500KB for this demo.',
        intent: 'warning',
      })
      return
    }
    try {
      const dataUrl = await readAsDataUrl(file)
      setDraft((s) => ({ ...s, image: dataUrl }))
    } catch {
      notify({ title: 'Upload failed', message: 'Could not read that file.', intent: 'error' })
    }
  }

  async function save() {
    const errors = validateDraft(draft)
    setDraftErrors(errors)
    if (Object.keys(errors).length) return

    const payload = {
      name: draft.name.trim(),
      subtitle: draft.subtitle.trim() || '',
      description: draft.description.trim(),
      longDescription: draft.description.trim(),
      price: Number(draft.price),
      compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
      category: draft.category,
      tags: [],
      rating: 4.7,
      reviewCount: 0,
      image: draft.image.trim(),
      images: [draft.image.trim()],
      attributes: {
        weightGrams: null,
        caffeine: 'Medium',
        tastingNotes: [],
        brew: { temp: '95°C', time: '3–4 min', serves: '' },
      },
      inStock: Boolean(draft.inStock),
    }

    try {
      const nextProduct = editingId
        ? await updateAdminProduct(editingId, payload)
        : await createAdminProduct(payload)

      if (!nextProduct) throw new Error('Missing product from server')

      setProductsState((prev) => {
        const list = Array.isArray(prev) ? prev : []
        return editingId
          ? list.map((p) => (p.id === editingId ? { ...p, ...nextProduct } : p))
          : [nextProduct, ...list]
      })

      setIsEditorOpen(false)
      notify({ title: 'Saved', message: nextProduct.name, intent: 'success' })
      refreshStorefrontProducts()
    } catch (err) {
      notify({ title: 'Save failed', message: err?.message || 'Unable to save product', intent: 'error' })
    }
  }

  async function confirmDelete() {
    const id = editingId
    if (!id) return
    try {
      await deleteAdminProduct(id)
      setProductsState((prev) => (Array.isArray(prev) ? prev.filter((p) => p.id !== id) : []))
      setIsDeleteOpen(false)
      notify({ title: 'Deleted', message: 'Product removed.', intent: 'info' })
      refreshStorefrontProducts()
    } catch (err) {
      notify({ title: 'Delete failed', message: err?.message || 'Unable to delete product', intent: 'error' })
    }
  }

  function doRefresh() {
    refresh()
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Product',
        render: (p) => (
          <div className={styles.productCell}>
            <img className={styles.thumb} src={p.image} alt="" loading="lazy" />
            <div>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productMeta}>
                {p.category} • <span className={styles.mono}>{p.slug ?? p.id}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'price',
        header: 'Price',
        width: '140px',
        align: 'right',
        render: (p) => formatINR(p.price),
      },
      {
        key: 'stock',
        header: 'Stock',
        width: '140px',
        render: (p) => <Badge tone={p.inStock ? 'accent' : 'danger'}>{p.inStock ? 'In stock' : 'Out'}</Badge>,
      },
      {
        key: 'actions',
        header: 'Actions',
        width: '160px',
        align: 'right',
        render: (p) => (
          <div className={styles.rowActions}>
            <IconButton label="Edit" variant="soft" onClick={() => openEdit(p)}>
              <Pencil size={18} />
            </IconButton>
            <IconButton label="Delete" variant="soft" onClick={() => requestDelete(p)}>
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
          <div className={styles.title}>Products</div>
          <div className={styles.subtitle}>Create, edit, and curate the storefront catalog (MongoDB backend).</div>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" size="sm" onClick={doRefresh} disabled={loading}>
            <RefreshCcw size={18} /> Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={openCreate}>
            <Plus size={18} /> Add product
          </Button>
        </div>
      </div>

      <Card className={styles.controls}>
        <Input
          label="Search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, slug, category..."
        />
        <div className={styles.viewToggle} aria-label="View mode">
          <button
            type="button"
            className={`${styles.toggle} ${view === 'table' ? styles.toggleActive : ''}`}
            onClick={() => setView('table')}
          >
            <Table2 size={16} /> Table
          </button>
          <button
            type="button"
            className={`${styles.toggle} ${view === 'cards' ? styles.toggleActive : ''}`}
            onClick={() => setView('cards')}
          >
            <LayoutGrid size={16} /> Cards
          </button>
        </div>
      </Card>

      {loading && filtered.length === 0 ? (
        <div className={styles.skeletonGrid} aria-label="Loading products">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`product-skel-${idx}`} className={styles.skeletonCard}>
              <Skeleton className={styles.skeletonMedia} />
              <Skeleton className={styles.skeletonLine} />
              <Skeleton className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      ) : view === 'table' ? (
        <AdminTable
          columns={columns}
          rows={filtered}
          getRowKey={(p) => p.id}
          emptyLabel={loading ? 'Loading products...' : 'No products found.'}
          emptyText={!loading ? 'Add your first product to start merchandising.' : undefined}
          emptyAction={
            !loading ? (
              <Button variant="secondary" onClick={openCreate}>
                <Plus size={18} /> Add product
              </Button>
            ) : null
          }
        />
      ) : filtered.length ? (
        <div className={styles.cardGrid}>
          {filtered.map((p) => (
            <Card key={p.id} className={styles.productCard}>
              <img className={styles.cardImg} src={p.image} alt="" loading="lazy" />
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div className={styles.cardName}>{p.name}</div>
                  <Badge tone={p.inStock ? 'accent' : 'danger'}>{p.inStock ? 'In stock' : 'Out'}</Badge>
                </div>
                <div className={styles.cardMeta}>
                  {p.category} • <span className={styles.mono}>{p.slug ?? p.id}</span>
                </div>
                <div className={styles.cardPrice}>{formatINR(p.price)}</div>
                <div className={styles.cardActions}>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                    <Pencil size={18} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => requestDelete(p)}>
                    <Trash2 size={18} /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products yet"
          text="Add your first product to start merchandising."
          action={
            <Button variant="secondary" onClick={openCreate}>
              <Plus size={18} /> Add product
            </Button>
          }
        />
      )}

      <AdminModal
        open={isEditorOpen}
        title={editingId ? 'Edit product' : 'Add product'}
        onClose={() => setIsEditorOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editingId ? 'Save changes' : 'Create product'}</Button>
          </>
        }
      >
        <div className={styles.form}>
          <Input
            label="Name"
            name="name"
            value={draft.name}
            onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
            error={draftErrors.name}
            placeholder="MANOR Classic Leaf Tea"
          />
          <Input
            label="Subtitle (optional)"
            name="subtitle"
            value={draft.subtitle}
            onChange={(e) => setDraft((s) => ({ ...s, subtitle: e.target.value }))}
            placeholder="250g pouch"
          />
          <div className={styles.row}>
            <Input
              label="Price"
              name="price"
              value={draft.price}
              onChange={(e) => setDraft((s) => ({ ...s, price: e.target.value }))}
              error={draftErrors.price}
              inputMode="numeric"
              placeholder="150"
            />
            <Input
              label="Compare at (optional)"
              name="compareAtPrice"
              value={draft.compareAtPrice}
              onChange={(e) => setDraft((s) => ({ ...s, compareAtPrice: e.target.value }))}
              inputMode="numeric"
              placeholder="195"
            />
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Category</span>
            <select
              className={styles.select}
              value={draft.category}
              onChange={(e) => setDraft((s) => ({ ...s, category: e.target.value }))}
            >
              <option value="tea">Tea</option>
              <option value="gift">Gift</option>
            </select>
            {draftErrors.category ? <span className={styles.fieldError}>{draftErrors.category}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Description</span>
            <textarea
              className={`${styles.textarea} ${draftErrors.description ? styles.textareaError : ''}`}
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
              placeholder="Short, premium description..."
            />
            {draftErrors.description ? <span className={styles.fieldError}>{draftErrors.description}</span> : null}
          </label>

          <div className={styles.row}>
            <Input
              label="Image URL"
              name="image"
              value={draft.image}
              onChange={(e) => setDraft((s) => ({ ...s, image: e.target.value }))}
              error={draftErrors.image}
              placeholder="/Manor (1).jpg"
            />

            <label className={styles.upload}>
              <span className={styles.uploadLabel}>Upload</span>
              <span className={styles.uploadButton}>
                <Upload size={18} /> Choose
              </span>
              <input type="file" accept="image/*" onChange={onUpload} />
              <span className={styles.uploadHint}>Demo: stores as data URL.</span>
            </label>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={draft.inStock}
              onChange={(e) => setDraft((s) => ({ ...s, inStock: e.target.checked }))}
            />
            In stock
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={isDeleteOpen}
        title="Delete product"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <div className={styles.deleteText}>
          This will remove <strong>{draft.name}</strong> from the catalog on this device.
        </div>
      </AdminModal>
    </div>
  )
}
