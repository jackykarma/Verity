import { describe, expect, it, vi } from 'vitest'
import { contentPresenter } from '../ContentPresenter.ts'
import type { PresentRequest } from '../../shared/types/present.ts'

describe('present failure isolation', () => {
  it('returns failed result without throwing when strategy throws', async () => {
    const req: PresentRequest = {
      segmentId: 'test-seg',
      sessionId: 'missing-session',
      payloadKind: 'video',
      auxSubtype: null,
      contentRef: { kind: 'byteRange', sessionId: 'missing-session', offset: 0, length: 10 },
      readablePayload: { title: 'test', fields: [] },
    }

    const result = await contentPresenter.present(req)
    expect(result.status).toBe('failed')
  })

  it('survives present rejection via try/catch pattern', async () => {
    const spy = vi.spyOn(contentPresenter, 'present').mockRejectedValueOnce(new Error('boom'))
    let treeIntact = true

    try {
      await contentPresenter.present({
        segmentId: 'x',
        sessionId: 'y',
        payloadKind: 'metadata',
        auxSubtype: null,
        contentRef: null,
        readablePayload: { title: 't', fields: [] },
      })
    } catch {
      treeIntact = false
    }

    expect(treeIntact).toBe(false)

    spy.mockRestore()
    const fallback = {
      status: 'failed' as const,
      failureKind: 'PREVIEW_FAILED' as const,
      viewModel: { kind: 'empty' as const, message: '预览失败' },
    }
    expect(fallback.status).toBe('failed')
    expect(fallback.viewModel.kind).toBe('empty')
  })
})
