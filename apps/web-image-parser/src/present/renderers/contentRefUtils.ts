import { SessionStore } from '../../shared/SessionStore.ts'
import type { ContentRef } from '../../shared/types/present.ts'

export interface RenderContext {
  sessionId: string
}

export function resolveContentUrl(ref: ContentRef | null, mimeType: string): string | null {
  if (!ref) {
    return null
  }
  if (ref.kind === 'blobUrl') {
    return ref.url
  }
  const session = SessionStore.getInstance().getSession(ref.sessionId)
  if (!session) {
    return null
  }
  const slice = session.buffer.slice(ref.offset, ref.offset + ref.length)
  const blob = new Blob([slice], { type: mimeType })
  return URL.createObjectURL(blob)
}

export function resolveFullFileUrl(sessionId: string, mimeType: string): string | null {
  const session = SessionStore.getInstance().getSession(sessionId)
  if (!session) {
    return null
  }
  const blob = new Blob([session.buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}
