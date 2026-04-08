import { env } from './config/env.js'
import { connectDb } from './db/connect.js'
import { createApp } from './app.js'

async function main() {
  await connectDb({ mongoUri: env.mongoUri })

  const app = createApp()
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] failed to start:', err)
  process.exitCode = 1
})

