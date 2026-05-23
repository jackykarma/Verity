import { validateFile, type ValidationResult } from '../shared/SessionStore.ts'
import type { FileFailureType } from '../shared/types/errors.ts'
import { FILE_FAILURE_MESSAGES } from '../shared/types/errors.ts'

export interface IngestOutcome {
  ok: boolean
  file?: File
  validation?: ValidationResult
  failureType?: FileFailureType
  message?: string
}

export class IngestService {
  async ingestFromFileList(files: FileList | File[]): Promise<IngestOutcome> {
    const list = Array.from(files)
    if (list.length === 0) {
      return { ok: false, failureType: 'READ_FAILED', message: '未选择文件' }
    }
    if (list.length > 1) {
      return { ok: false, failureType: 'UNSUPPORTED_TYPE', message: '一次仅支持单个文件' }
    }
    return this.ingestFile(list[0]!)
  }

  async ingestFile(file: File): Promise<IngestOutcome> {
    const validation = await validateFile(file)
    if (!validation.ok) {
      const failureType = validation.failureType ?? 'UNKNOWN'
      return {
        ok: false,
        validation,
        failureType,
        message: validation.message ?? FILE_FAILURE_MESSAGES[failureType],
      }
    }
    return { ok: true, file, validation }
  }
}

export const ingestService = new IngestService()
