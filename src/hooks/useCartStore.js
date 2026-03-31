import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { offers } from '../assets/data/offers.js'
import { getProductById } from '../services/catalogService.js'
import { createId } from '../utils/id.js'

// Cart store (Zustand + localStorage persistence).
// - Stores a snapshot of cart lines for stability (prices/images at time of add).
// - Supports both catalog products and custom blend lines.
// - Includes a simple offer system with min-order rules.
function normalizeOfferCode(value) {
  if (!value) return null
  const code = String(value).trim().toUpperCase()
  return code.length ? code : null
}

function findOffer(code) {
  const normalized = normalizeOfferCode(code)
  if (!normalized) return null
  return offers.find((o) => o.code === normalized) ?? null
}

function clampQty(qty) {
  const n = Number(qty)
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(99, Math.round(n)))
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      offerCode: null,

      addProduct: (productId, quantity = 1) => {
        const product = getProductById(productId)
        if (!product || !product.inStock) return

        const qty = clampQty(quantity)
        set((state) => {
          const existing = state.items.find(
            (i) => i.kind === 'product' && i.productId === productId,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === existing.lineId ? { ...i, quantity: clampQty(i.quantity + qty) } : i,
              ),
            }
          }

          const line = {
            lineId: createId('line'),
            kind: 'product',
            productId,
            title: product.name,
            subtitle: product.subtitle,
            image: product.image,
            unitPrice: product.price,
            quantity: qty,
          }

          return { items: [line, ...state.items] }
        })
      },

      addCustomItem: ({ title, image, unitPrice, meta }, quantity = 1) => {
        const qty = clampQty(quantity)
        const line = {
          lineId: createId('line'),
          kind: 'custom',
          productId: null,
          title,
          subtitle: 'Custom tea blend',
          image,
          unitPrice,
          quantity: qty,
          meta,
        }
        set((state) => ({ items: [line, ...state.items] }))
      },

      removeLine: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: clampQty(quantity) } : i,
          ),
        })),

      clearCart: () => set({ items: [], offerCode: null }),

      setOfferCode: (value) => set({ offerCode: normalizeOfferCode(value) }),

      clearOffer: () => set({ offerCode: null }),

      getSummary: () => {
        const { items, offerCode } = get()
        const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

        const offer = findOffer(offerCode)
        const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49

        let discount = 0
        if (offer && subtotal >= offer.minOrder) {
          discount =
            offer.type === 'percent'
              ? Math.round((subtotal * offer.value) / 100)
              : Math.min(offer.value, subtotal)
        }

        const total = Math.max(0, subtotal - discount + shipping)
        return { subtotal, discount, shipping, total, offer }
      },
    }),
    { name: 'manor:cart:v1', version: 1 },
  ),
)
