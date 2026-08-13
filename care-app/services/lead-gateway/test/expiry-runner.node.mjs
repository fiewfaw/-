import assert from 'node:assert/strict'
import test from 'node:test'

import { runExpiry } from '../scripts/expire-leads.mjs'

test('expiry runner invokes storage once and prints counts only', async () => {
  const calls = []
  const stdout = []
  const stderr = []
  const exitCode = await runExpiry({
    createStorage: async () => async (...args) => {
      calls.push(args)
      return { ok: true, purged: 2, contact_name: 'must-not-print', phone: '0800000000' }
    },
    stdout: (value) => stdout.push(value),
    stderr: (value) => stderr.push(value),
  })

  assert.equal(exitCode, 0)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'expireLeads')
  assert.deepEqual(JSON.parse(stdout.join('')), { ok: true, purged: 2 })
  assert.equal(stderr.join(''), '')
  assert.doesNotMatch(stdout.join(''), /must-not-print|0800000000/)
})

test('expiry runner fails closed without leaking the upstream error', async () => {
  const stdout = []
  const stderr = []
  const exitCode = await runExpiry({
    createStorage: async () => async () => {
      throw new Error('contact_name=Private phone=0800000000')
    },
    stdout: (value) => stdout.push(value),
    stderr: (value) => stderr.push(value),
  })

  assert.equal(exitCode, 1)
  assert.equal(stdout.join(''), '')
  assert.deepEqual(JSON.parse(stderr.join('')), { ok: false, error: 'lead_expiry_failed' })
  assert.doesNotMatch(stderr.join(''), /Private|0800000000/)
})
