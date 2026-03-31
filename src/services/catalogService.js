import { products } from '../assets/data/products.js'

export function getAllProducts() {
  return products
}

export function getProductById(productId) {
  return products.find((p) => p.id === productId) ?? null
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category)
}

