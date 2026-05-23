import { ParseWorkerBridge } from '../shared/ParseWorkerBridge.ts'
import { SessionStore } from '../shared/SessionStore.ts'
import type { SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { FileFailureType } from '../shared/types/errors.ts'
import { FILE_FAILURE_MESSAGES } from '../shared/types/errors.ts'
import type { ParsePhase } from '../shared/types/session.ts'
import { PARSE_TIMEOUT_MS } from '../shared/types/session.ts'
import { validateFile } from '../shared/SessionStore.ts'
import { contentPresenter } from '../present/ContentPresenter.ts'
import { buildParseReport, summarizeTreeHealth } from '../format-jpeg/ParseResultReporter.ts'
import type { ParseReport } from '../format-jpeg/ParseResultReporter.ts'
import { emitFileLevelTelemetry } from './FileLevelTelemetry.ts'

export type PhaseListener = (phase: ParsePhase, detail?: ParseDetail) => void

export interface ParseDetail {
  tree: SegmentTreeDto | null
  failureType: FileFailureType | null
  message: string
  fileName: string | null
  report: ParseReport | null
}

export class ParseOrchestrator {
  private bridge = new ParseWorkerBridge()
  private store = SessionStore.getInstance()
  private phase: ParsePhase = 'idle'
  private taskGeneration = 0
  private watchdogId: ReturnType<typeof setTimeout> | null = null
  private tree: SegmentTreeDto | null = null
  private failureType: FileFailureType | null = null
  private message = ''
  private fileName: string | null = null
  private listeners = new Set<PhaseListener>()
  private parsing = false

  subscribe(listener: PhaseListener): () => void {
    this.listeners.add(listener)
    listener(this.phase, this.snapshot())
    return () => this.listeners.delete(listener)
  }

  getPhase(): ParsePhase {
    return this.phase
  }

  getTree(): SegmentTreeDto | null {
    return this.tree
  }

  getDetail(): ParseDetail {
    return this.snapshot()
  }

  private snapshot(): ParseDetail {
    const health = summarizeTreeHealth(this.tree)
    const message =
      this.message && (this.phase === 'success' || this.phase === 'partial')
        ? `${health} — ${this.message}`
        : this.message

    return {
      tree: this.tree,
      failureType: this.failureType,
      message,
      fileName: this.fileName,
      report: buildParseReport(this.phase, this.tree, this.failureType, message),
    }
  }

  private setPhase(phase: ParsePhase): void {
    this.phase = phase
    const detail = this.snapshot()
    for (const listener of this.listeners) {
      listener(phase, detail)
    }
  }

  private clearWatchdog(): void {
    if (this.watchdogId !== null) {
      clearTimeout(this.watchdogId)
      this.watchdogId = null
    }
  }

  async startParse(file: File): Promise<void> {
    if (this.parsing) {
      return
    }

    this.taskGeneration += 1
    const gen = this.taskGeneration
    this.parsing = true
    this.setPhase('validating')

    const validation = await validateFile(file)
    if (!validation.ok || !validation.format) {
      this.failureType = validation.failureType ?? 'UNKNOWN'
      this.message = validation.message ?? FILE_FAILURE_MESSAGES[this.failureType]
      this.parsing = false
      this.setPhase('failed')
      return
    }

    if (gen !== this.taskGeneration) {
      this.parsing = false
      return
    }

    this.bridge.abort()
    this.store.disposeAll()
    contentPresenter.dispose()
    this.tree = null
    this.failureType = null
    this.message = ''
    this.fileName = file.name

    const session = await this.store.createSession(file, validation.format)
    this.setPhase('parsing')
    const parseStarted = performance.now()

    this.clearWatchdog()
    this.watchdogId = setTimeout(() => {
      if (gen !== this.taskGeneration) {
        return
      }
      this.cancelInternal('PARSE_TIMEOUT')
    }, PARSE_TIMEOUT_MS)

    try {
      const result = await this.bridge.spawnParse(session, validation.format)
      if (gen !== this.taskGeneration) {
        return
      }

      this.clearWatchdog()
      this.tree = result.tree
      this.failureType = result.failureType
      this.message = result.message

      switch (result.status) {
        case 'success':
          this.setPhase('success')
          break
        case 'partial':
          this.setPhase('partial')
          break
        case 'cancelled':
          this.setPhase('cancelled')
          break
        default:
          this.setPhase('failed')
      }

      emitFileLevelTelemetry({
        phase: this.phase,
        failureType: this.failureType,
        format: validation.format,
        durationMs: performance.now() - parseStarted,
        fileName: file.name,
      })
    } catch {
      if (gen === this.taskGeneration) {
        this.failureType = 'PARSE_FAILED'
        this.message = FILE_FAILURE_MESSAGES.PARSE_FAILED
        this.setPhase('failed')
      }
    } finally {
      this.parsing = false
    }
  }

  cancel(): void {
    this.cancelInternal('CANCELLED')
  }

  private cancelInternal(failureType: FileFailureType): void {
    this.taskGeneration += 1
    this.clearWatchdog()
    this.bridge.abort()
    this.parsing = false
    this.failureType = failureType
    this.message = FILE_FAILURE_MESSAGES[failureType]
    this.setPhase('cancelled')
  }

  reset(): void {
    this.taskGeneration += 1
    this.clearWatchdog()
    this.bridge.abort()
    this.store.disposeAll()
    contentPresenter.dispose()
    this.tree = null
    this.failureType = null
    this.message = ''
    this.fileName = null
    this.parsing = false
    this.setPhase('idle')
  }
}

export const parseOrchestrator = new ParseOrchestrator()
