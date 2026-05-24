export type PayloadKind = 'image' | 'video' | 'audio' | 'metadata' | 'other' | 'mixed'

export type AuxSubtype = 'depth' | 'hdrGain' | 'alpha'

export type PresentStatus = 'success' | 'failed' | 'degraded'

export type PresentFailureKind =
  | 'PREVIEW_FAILED'
  | 'PLAYBACK_FAILED'
  | 'NO_CONTENT'
  | 'PAYLOAD_TOO_LARGE'
  | 'ENV_UNSUPPORTED'

export interface ByteRangeRef {
  kind: 'byteRange'
  sessionId: string
  offset: number
  length: number
}

export interface BlobUrlRef {
  kind: 'blobUrl'
  url: string
  mimeType: string
}

export type ContentRef = ByteRangeRef | BlobUrlRef

export interface ReadableField {
  key: string
  value: string
}

export interface ReadablePayload {
  title: string
  fields: ReadableField[]
  hexPreview?: string
  textBody?: string
}

export interface GalleryImage {
  label: string
  alt: string
  src: string
  contentRef?: ContentRef
}

export interface PresentRequest {
  segmentId: string
  sessionId: string
  payloadKind: PayloadKind
  auxSubtype: AuxSubtype | null
  contentRef: ContentRef | null
  readablePayload: ReadablePayload | null
  gallery?: GalleryImage[]
}

export type PresentViewModel =
  | { kind: 'empty'; message: string }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; mimeType: string }
  | { kind: 'audio'; src: string; mimeType: string }
  | { kind: 'readable'; payload: ReadablePayload }
  | { kind: 'mixed'; readable: ReadablePayload; media: PresentViewModel; gallery?: GalleryImage[] }

export interface PresentResult {
  status: PresentStatus
  failureKind: PresentFailureKind | null
  viewModel: PresentViewModel
}

export type PresentStrategy =
  | 'image'
  | 'video'
  | 'audio'
  | 'readable'
  | 'mixed'
  | 'empty'
