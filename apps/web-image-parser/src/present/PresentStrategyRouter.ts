import type { PresentFailureKind, PresentRequest, PresentStrategy } from '../shared/types/present.ts'

export function resolvePresentStrategy(req: PresentRequest): PresentStrategy {
  if (!req.contentRef && !req.readablePayload && !(req.gallery && req.gallery.length > 0)) {
    return 'empty'
  }

  if (req.gallery && req.gallery.length > 0) {
    return 'mixed'
  }

  switch (req.payloadKind) {
    case 'image':
      return 'image'
    case 'video':
      return 'video'
    case 'audio':
      return 'audio'
    case 'metadata':
    case 'other':
      return 'readable'
    case 'mixed':
      return 'mixed'
    default:
      return 'empty'
  }
}

export function failureKindForEmpty(req: PresentRequest): PresentFailureKind {
  if (!req.contentRef && !req.readablePayload) {
    return 'NO_CONTENT'
  }
  return 'PREVIEW_FAILED'
}
