import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId } from '../utils/id.js'

// Orders store (client-side mock).
// - Persists recent orders on this device.
// - For production: move order creation + payment verification to a backend.
function createOrderNumber() {
  const short = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MANOR-${short}`
}

export const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],
      lastOrderId: null,

      createOrder: ({ customer, address, payment, items, summary }) => {
        const order = {
          id: createOrderNumber(),
          internalId: createId('order'),
          createdAt: new Date().toISOString(),
          customer,
          address,
          payment,
          items,
          summary,
        }

        set((state) => ({
          orders: [order, ...state.orders].slice(0, 20),
          lastOrderId: order.id,
        }))

        return order.id
      },

      getOrderById: (orderId) => {
        const id = String(orderId ?? '').trim().toUpperCase()
        if (!id) return null
        return get().orders.find((o) => o.id.toUpperCase() === id) ?? null
      },
    }),
    { name: 'manor:orders:v1', version: 1 },
  ),
)
