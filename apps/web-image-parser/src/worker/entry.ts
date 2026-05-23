import type { WorkerInbound, WorkerOutbound } from '../shared/types/parseMessages.ts'

let aborted = false

function post(msg: WorkerOutbound): void {
  self.postMessage(msg)
}

async function handleParseStart(msg: Extract<WorkerInbound, { type: 'PARSE_START' }>): Promise<void> {
  aborted = false
  post({ type: 'PARSE_PROGRESS', percent: 10 })

  try {
    if (msg.format === 'jpeg') {
      const { parseJpegBuffer } = await import('../format-jpeg/JpegParser.ts')
      if (aborted) {
        post({
          type: 'PARSE_DONE',
          sessionId: msg.sessionId,
          status: 'cancelled',
          tree: null,
          failureType: 'CANCELLED',
          message: '已取消',
        })
        return
      }
      post({ type: 'PARSE_PROGRESS', percent: 60 })
      const result = await parseJpegBuffer(msg.buffer)
      post({
        type: 'PARSE_DONE',
        sessionId: msg.sessionId,
        status: result.status,
        tree: result.tree,
        failureType: result.status === 'failed' ? 'PARSE_FAILED' : undefined,
        message: result.message,
      })
      return
    }

    const { parseHeicBuffer } = await import('../format-heic/HeicParser.ts')
    if (aborted) {
      post({
        type: 'PARSE_DONE',
        sessionId: msg.sessionId,
        status: 'cancelled',
        tree: null,
        failureType: 'CANCELLED',
        message: '已取消',
      })
      return
    }
    post({ type: 'PARSE_PROGRESS', percent: 60 })
    const result = parseHeicBuffer(msg.buffer)
    post({
      type: 'PARSE_DONE',
      sessionId: msg.sessionId,
      status: result.status,
      tree: result.tree,
      failureType: result.status === 'failed' ? 'PARSE_FAILED' : undefined,
      message: result.message,
    })
  } catch {
    post({
      type: 'PARSE_DONE',
      sessionId: msg.sessionId,
      status: 'failed',
      tree: null,
      failureType: 'PARSE_FAILED',
      message: 'Worker 内部解析异常',
    })
  }
}

self.addEventListener('message', (ev: MessageEvent<WorkerInbound>) => {
  const msg = ev.data
  if (msg.type === 'PARSE_ABORT') {
    aborted = true
    return
  }
  if (msg.type === 'PARSE_START') {
    void handleParseStart(msg)
  }
})
