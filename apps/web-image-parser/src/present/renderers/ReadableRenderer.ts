import type { PresentRequest, PresentResult } from '../../shared/types/present.ts'
import { presentFailureMessage } from '../copy.ts'

export async function renderReadable(req: PresentRequest): Promise<PresentResult> {
  const payload = req.readablePayload ?? {
    title: req.segmentId,
    fields: [],
  }

  if (payload.fields.length === 0 && !req.contentRef && !payload.textBody) {
    return {
      status: 'failed',
      failureKind: 'NO_CONTENT',
      viewModel: { kind: 'empty', message: presentFailureMessage('NO_CONTENT') },
    }
  }

  return {
    status: 'success',
    failureKind: null,
    viewModel: { kind: 'readable', payload },
  }
}
