import { describe, expect, it, beforeEach } from 'vitest'
import { SessionStore } from '../SessionStore.ts'

describe('SessionStore', () => {
  beforeEach(() => {
    SessionStore.resetForTests()
  })

  it('creates singleton instance', () => {
    const a = SessionStore.getInstance()
    const b = SessionStore.getInstance()
    expect(a).toBe(b)
  })

  it('clears session when new file loaded', async () => {
    const store = SessionStore.getInstance()
    const file1 = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'a.jpg', { type: 'image/jpeg' })
    const file2 = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe1])], 'b.jpg', { type: 'image/jpeg' })

    const s1 = await store.createSession(file1, 'jpeg')
    expect(store.getActiveSession()?.sessionId).toBe(s1.sessionId)

    const s2 = await store.createSession(file2, 'jpeg')
    expect(store.getSession(s1.sessionId)).toBeNull()
    expect(store.getActiveSession()?.sessionId).toBe(s2.sessionId)
  })

  it('disposeAll clears active session', async () => {
    const store = SessionStore.getInstance()
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'a.jpg', { type: 'image/jpeg' })
    await store.createSession(file, 'jpeg')
    store.disposeAll()
    expect(store.getActiveSession()).toBeNull()
  })
})
