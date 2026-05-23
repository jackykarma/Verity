import { sniffFormat, isSupportedFormat } from './fileSniff.ts'
import type { FileFailureType } from './types/errors.ts'
import type { FileFormat, ParseSession } from './types/session.ts'
import { MAX_FILE_SIZE_BYTES } from './types/session.ts'

let sessionCounter = 0

function nextSessionId(): string {
  sessionCounter += 1
  return `sess-${Date.now()}-${sessionCounter}`
}

export class SessionStore {
  private static instance: SessionStore | null = null
  private activeSession: ParseSession | null = null

  static getInstance(): SessionStore {
    SessionStore.instance ??= new SessionStore()
    return SessionStore.instance
  }

  /** 测试用：重置单例 */
  static resetForTests(): void {
    SessionStore.instance?.disposeAll()
    SessionStore.instance = null
  }

  async createSession(file: File, detectedFormat: FileFormat): Promise<ParseSession> {
    this.disposeAll()
    const buffer = await file.arrayBuffer()
    const session: ParseSession = {
      sessionId: nextSessionId(),
      buffer,
      fileName: file.name,
      detectedFormat,
      createdAt: Date.now(),
    }
    this.activeSession = session
    return session
  }

  getSession(sessionId: string): ParseSession | null {
    if (this.activeSession?.sessionId === sessionId) {
      return this.activeSession
    }
    return null
  }

  getActiveSession(): ParseSession | null {
    return this.activeSession
  }

  disposeSession(sessionId: string): void {
    if (this.activeSession?.sessionId === sessionId) {
      this.activeSession = null
    }
  }

  disposeAll(): void {
    this.activeSession = null
  }
}

export interface ValidationResult {
  ok: boolean
  failureType?: FileFailureType
  message?: string
  format?: FileFormat
}

export async function validateFile(file: File): Promise<ValidationResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      failureType: 'FILE_TOO_LARGE',
      message: '文件超过 50MB 上限',
    }
  }

  const head = await file.slice(0, 64).arrayBuffer()
  const sniff = sniffFormat(head, file.name)
  if (!isSupportedFormat(sniff.format)) {
    return {
      ok: false,
      failureType: 'UNSUPPORTED_TYPE',
      message: '不支持的文件类型，请选择 JPEG 或 HEIC 图片',
    }
  }

  return { ok: true, format: sniff.format }
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}
