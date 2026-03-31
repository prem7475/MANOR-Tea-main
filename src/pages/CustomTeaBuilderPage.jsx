import React, { useMemo, useState } from 'react'
import { ArrowRight, Leaf, Package, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './CustomTeaBuilderPage.module.css'
import PageShell from '../components/layout/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Input from '../components/ui/Input.jsx'
import { formatINR } from '../utils/currency.js'
import { useCartStore } from '../hooks/useCartStore.js'
import { useUiStore } from '../hooks/useUiStore.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const teaTypes = [
  {
    id: 'assam',
    label: 'Classic Assam',
    desc: 'Bold body, perfect with milk.',
    basePrice: 140,
  },
  {
    id: 'darjeeling',
    label: 'Darjeeling',
    desc: 'Lighter body with a clean finish.',
    basePrice: 180,
  },
  {
    id: 'green',
    label: 'Green Tea',
    desc: 'Fresh, calm, and clean.',
    basePrice: 160,
  },
  {
    id: 'masala',
    label: 'Masala Base',
    desc: 'Warming base for spiced blends.',
    basePrice: 170,
  },
]

const strengths = [
  { id: 'light', label: 'Light', addPrice: 0, note: 'Gentle, everyday comfort.' },
  { id: 'balanced', label: 'Balanced', addPrice: 10, note: 'Most people love this.' },
  { id: 'strong', label: 'Strong', addPrice: 20, note: 'Bold flavour and aroma.' },
]

const flavors = [
  { id: 'elaichi', label: 'Elaichi (Cardamom)', addPrice: 10 },
  { id: 'ginger', label: 'Ginger', addPrice: 10 },
  { id: 'cinnamon', label: 'Cinnamon', addPrice: 10 },
  { id: 'clove', label: 'Clove', addPrice: 10 },
  { id: 'tulsi', label: 'Tulsi', addPrice: 10 },
  { id: 'lemongrass', label: 'Lemongrass', addPrice: 10 },
]

const packaging = [
  {
    id: 'pouch',
    label: 'Premium Pouch (250g)',
    addPrice: 0,
    image: '/Manor (1).jpg',
  },
  {
    id: 'jar',
    label: 'Jar Pack (500g)',
    addPrice: 80,
    image: '/Manor (2).jpg',
  },
  {
    id: 'gift',
    label: 'Gift Box',
    addPrice: 120,
    image: '/gift hamper 2.jpg',
  },
]

export default function CustomTeaBuilderPage() {
  useDocumentTitle('Customize tea')

  const navigate = useNavigate()
  const addCustomItem = useCartStore((s) => s.addCustomItem)
  const notify = useUiStore((s) => s.notify)

  const [typeId, setTypeId] = useState('assam')
  const [strengthId, setStrengthId] = useState('balanced')
  const [flavourIds, setFlavourIds] = useState(['elaichi'])
  const [packId, setPackId] = useState('pouch')
  const [note, setNote] = useState('')

  const selectedType = teaTypes.find((t) => t.id === typeId) ?? teaTypes[0]
  const selectedStrength = strengths.find((s) => s.id === strengthId) ?? strengths[1]
  const selectedPack = packaging.find((p) => p.id === packId) ?? packaging[0]

  const selectedFlavours = useMemo(() => flavoursToList(flavourIds), [flavourIds])

  const price = useMemo(() => {
    const flavoursPrice = selectedFlavours.reduce((sum, f) => sum + f.addPrice, 0)
    return selectedType.basePrice + selectedStrength.addPrice + flavoursPrice + selectedPack.addPrice
  }, [selectedPack.addPrice, selectedStrength.addPrice, selectedType.basePrice, selectedFlavours])

  function toggleFlavour(id) {
    setFlavourIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) {
        notify({ title: 'Limit reached', message: 'Choose up to 3 flavours.', intent: 'warning' })
        return prev
      }
      return [...prev, id]
    })
  }

  function addToCart() {
    const title = `Custom Tea Bag — ${selectedType.label} · ${selectedStrength.label}`
    const meta = {
      teaType: selectedType,
      strength: selectedStrength,
      flavours: selectedFlavours,
      packaging: selectedPack,
      note: note.trim() || null,
    }

    addCustomItem(
      {
        title,
        image: selectedPack.image,
        unitPrice: price,
        meta,
      },
      1,
    )

    notify({ title: 'Added to cart', message: 'Custom tea bag created.', intent: 'success' })
    navigate('/cart')
  }

  return (
    <PageShell
      title="Customize Tea Bag"
      subtitle="Build your tea in a calm, premium flow — choose tea type, strength, flavours, and packaging. See the summary live and add to cart."
      actions={
        <>
          <Button to="/products" variant="ghost">
            Browse products
          </Button>
          <Button to="/cart" variant="secondary">
            View cart
          </Button>
        </>
      }
    >
      <div className={styles.layout}>
        <div className={styles.builder}>
          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <Leaf size={18} /> Tea type
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Tea type">
              {teaTypes.map((t) => (
                <label key={t.id} className={`${styles.option} ${typeId === t.id ? styles.optionActive : ''}`}>
                  <input type="radio" name="teaType" checked={typeId === t.id} onChange={() => setTypeId(t.id)} />
                  <div>
                    <div className={styles.optionLabel}>{t.label}</div>
                    <div className={styles.optionNote}>
                      {t.desc} · <span className={styles.priceInline}>from {formatINR(t.basePrice)}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <Sparkles size={18} /> Strength
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Strength">
              {strengths.map((s) => (
                <label
                  key={s.id}
                  className={`${styles.option} ${strengthId === s.id ? styles.optionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="strength"
                    checked={strengthId === s.id}
                    onChange={() => setStrengthId(s.id)}
                  />
                  <div>
                    <div className={styles.optionLabel}>
                      {s.label}{' '}
                      {s.addPrice ? <span className={styles.add}>+{formatINR(s.addPrice)}</span> : null}
                    </div>
                    <div className={styles.optionNote}>{s.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <Sparkles size={18} /> Flavours
            </div>
            <div className={styles.flavours}>
              {flavors.map((f) => {
                const active = flavourIds.includes(f.id)
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`${styles.flavour} ${active ? styles.flavourActive : ''}`}
                    onClick={() => toggleFlavour(f.id)}
                  >
                    {f.label} {f.addPrice ? <span className={styles.addSmall}>+{formatINR(f.addPrice)}</span> : null}
                  </button>
                )
              })}
            </div>
            <div className={styles.flavourHint}>
              Choose up to 2–3 flavours for a clean finish (recommended).
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardTitle}>
              <Package size={18} /> Packaging
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Packaging">
              {packaging.map((p) => (
                <label key={p.id} className={`${styles.option} ${packId === p.id ? styles.optionActive : ''}`}>
                  <input type="radio" name="pack" checked={packId === p.id} onChange={() => setPackId(p.id)} />
                  <div>
                    <div className={styles.optionLabel}>
                      {p.label}{' '}
                      {p.addPrice ? <span className={styles.add}>+{formatINR(p.addPrice)}</span> : null}
                    </div>
                    <div className={styles.optionNote}>Premium finish, warm tones, minimal label.</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardTitle}>Gift note (optional)</div>
            <Input
              label="Note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short message…"
              hint="We’ll include this in the order summary (demo)."
            />
          </Card>
        </div>

        <Card className={styles.preview}>
          <div className={styles.previewTop}>
            <div className={styles.previewTitle}>Live summary</div>
            <Badge tone="accent">{formatINR(price)}</Badge>
          </div>

          <div className={styles.previewMedia}>
            <img className={styles.previewImg} src={selectedPack.image} alt="" loading="lazy" />
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.label}>Tea</span>
              <span className={styles.value}>{selectedType.label}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.label}>Strength</span>
              <span className={styles.value}>{selectedStrength.label}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.label}>Flavours</span>
              <span className={styles.value}>
                {selectedFlavours.length ? selectedFlavours.map((f) => f.label.split(' (')[0]).join(', ') : 'None'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.label}>Packaging</span>
              <span className={styles.value}>{selectedPack.label}</span>
            </div>
            {note.trim() ? (
              <div className={styles.note}>
                <div className={styles.label}>Note</div>
                <div className={styles.noteText}>{note.trim()}</div>
              </div>
            ) : null}
          </div>

          <Button fullWidth size="lg" onClick={addToCart}>
            Add to cart <ArrowRight size={18} />
          </Button>
          <div className={styles.previewFoot}>You can change quantity in cart after adding.</div>
        </Card>
      </div>
    </PageShell>
  )
}

function flavoursToList(ids) {
  const set = new Set(ids)
  return flavors.filter((f) => set.has(f.id))
}
