import type { FileFailureType } from './errors.ts'
import type { PayloadKind } from './present.ts'
import type { ParseStatus } from './session.ts'

export type WorkerInbound =
  | { type: 'PARSE_START'; sessionId: string; format: 'jpeg' | 'heic'; buffer: ArrayBuffer }
  | { type: 'PARSE_ABORT' }

export type WorkerOutbound =
  | { type: 'PARSE_PROGRESS'; percent: number }
  | {
      type: 'PARSE_DONE'
      sessionId: string
      status: ParseStatus
      tree: SegmentTreeDto | null
      failureType?: FileFailureType
      message?: string
    }

export interface SegmentTreeDto {
  rootId: string
  nodes: SegmentNodeDto[]
  warnings: string[]
}

export interface SegmentNodeDto {
  id: string
  parentId: string | null
  label: string
  parCatalogId: string
  offset: number
  length: number
  loadType: PayloadKind
  warning: boolean
}

export interface ParseWorkerResult {
  status: ParseStatus
  tree: SegmentTreeDto | null
  failureType: FileFailureType | null
  message: string
}

export type WorkerEventHandler = (event: WorkerOutbound) => void
export type Unsubscribe = () => void
