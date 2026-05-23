export type FileFormat = 'jpeg' | 'heic'

export interface ParseSession {
  sessionId: string
  buffer: ArrayBuffer
  fileName: string
  detectedFormat: FileFormat
  createdAt: number
}

export type ParsePhase =
  | 'idle'
  | 'validating'
  | 'parsing'
  | 'success'
  | 'partial'
  | 'failed'
  | 'cancelled'

export type ParseStatus = 'success' | 'partial' | 'failed' | 'cancelled'

export const PARSE_TIMEOUT_MS = 120_000
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const CONTRACT_VERSION = 1
