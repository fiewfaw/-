import { createSheetsStorageFromEnvironment } from '../src/sheets-runtime.mjs'
import { runSyntheticSmoke } from '../src/smoke-runner.mjs'

try {
  const storage = await createSheetsStorageFromEnvironment()
  await runSyntheticSmoke({ gateway: process.env.LEAD_GATEWAY_URL, storage })
} catch {
  console.error(JSON.stringify({ ok: false, error: 'synthetic_smoke_failed' }))
  process.exitCode = 1
}
