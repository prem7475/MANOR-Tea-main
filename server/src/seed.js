import { pathToFileURL } from 'node:url'
import path from 'node:path'

import bcrypt from 'bcryptjs'

import { env } from './config/env.js'
import { connectDb } from './db/connect.js'
import { AdminUser } from './models/AdminUser.js'
import { Product } from './models/Product.js'
import { Offer } from './models/Offer.js'

async function upsertAdmin() {
  const email = env.adminSeed.email
  const existing = await AdminUser.findOne({ email }).lean()
  if (existing) return

  const passwordHash = await bcrypt.hash(env.adminSeed.password, 12)
  await AdminUser.create({
    email,
    passwordHash,
    name: env.adminSeed.name,
  })
}

async function importFrontendSeed() {
  const rootDir = path.resolve(process.cwd(), '..')
  const productsUrl = pathToFileURL(path.join(rootDir, 'src/assets/data/products.js')).href
  const offersUrl = pathToFileURL(path.join(rootDir, 'src/assets/data/offers.js')).href

  const [{ products }, { offers }] = await Promise.all([import(productsUrl), import(offersUrl)])

  if (Array.isArray(products) && products.length) {
    for (const p of products) {
      await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true })
    }
  }

  if (Array.isArray(offers) && offers.length) {
    for (const o of offers) {
      await Offer.updateOne({ id: o.id }, { $set: { ...o, active: o.active ?? true } }, { upsert: true })
    }
  }
}

async function main() {
  await connectDb({ mongoUri: env.mongoUri })
  await upsertAdmin()
  await importFrontendSeed()
  // eslint-disable-next-line no-console
  console.log('[seed] done')
  process.exitCode = 0
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed:', err)
  process.exitCode = 1
})

