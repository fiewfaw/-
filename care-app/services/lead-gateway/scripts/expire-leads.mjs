import { fileURLToPath } from 'node:url'

import { createSheetsStorageFromEnvironment } from '../src/sheets-runtime.mjs'

export async function runExpiry(options = {}) {
  const createStorage = options.createStorage || (() => createSheetsStorageFromEnvironment())
  const stdout = options.stdout || ((value) => process.stdout.write(value))
  const stderr = options.stderr || ((value) => process.stderr.write(value))
  try {
    const storage = await createStorage()
    const result = await storage('expireLeads', {}, 'scheduled-expiry')
    if (!result?.ok) throw new Error('lead_expiry_failed')
    stdout(`${JSON.stringify({ ok: true, purged: Number(result.purged) || 0 })}\n`)
    return 0
  } catch {
    stderr(`${JSON.stringify({ ok: false, error: 'lead_expiry_failed' })}\n`)
    return 1
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) process.exitCode = await runExpiry()
