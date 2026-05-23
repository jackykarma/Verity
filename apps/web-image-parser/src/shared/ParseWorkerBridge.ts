import type {
  ParseWorkerResult,
  Unsubscribe,
  WorkerEventHandler,
  WorkerInbound,
  WorkerOutbound,
} from './types/parseMessages.ts'
import type { ParseSession } from './types/session.ts'

export class ParseWorkerBridge {
  private worker: Worker | null = null
  private generation = 0
  private handlers = new Set<WorkerEventHandler>()

  onEvent(handler: WorkerEventHandler): Unsubscribe {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  private emit(event: WorkerOutbound): void {
    for (const handler of this.handlers) {
      handler(event)
    }
  }

  async spawnParse(session: ParseSession, format: ParseSession['detectedFormat']): Promise<ParseWorkerResult> {
    this.abort()
    this.generation += 1
    const currentGen = this.generation

    const worker = new Worker(new URL('../worker/entry.ts', import.meta.url), { type: 'module' })
    this.worker = worker

    return new Promise((resolve) => {
      const cleanup = (): void => {
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
      }

      const finish = (result: ParseWorkerResult): void => {
        if (currentGen !== this.generation) {
          return
        }
        cleanup()
        resolve(result)
      }

      const onMessage = (ev: MessageEvent<WorkerOutbound>): void => {
        const msg = ev.data
        this.emit(msg)
        if (msg.type === 'PARSE_DONE') {
          finish({
            status: msg.status,
            tree: msg.tree,
            failureType: msg.failureType ?? null,
            message: msg.message ?? '',
          })
        }
      }

      const onError = (): void => {
        finish({
          status: 'failed',
          tree: null,
          failureType: 'PARSE_FAILED',
          message: 'Worker 解析异常',
        })
      }

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)

      const inbound: WorkerInbound = {
        type: 'PARSE_START',
        sessionId: session.sessionId,
        format,
        buffer: session.buffer,
      }
      worker.postMessage(inbound)
    })
  }

  abort(): void {
    this.generation += 1
    if (this.worker) {
      try {
        this.worker.postMessage({ type: 'PARSE_ABORT' } satisfies WorkerInbound)
      } catch {
        // worker may already be terminated
      }
      this.worker.terminate()
      this.worker = null
    }
  }
}
