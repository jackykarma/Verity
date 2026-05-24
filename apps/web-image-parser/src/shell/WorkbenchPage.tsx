import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toPresentRequest } from '../format-jpeg/JpegTreeAdapter.ts'
import { toHeicPresentRequest } from '../format-heic/HeicTreeAdapter.ts'
import { classifyHeicParseOutcome } from '../format-heic/HeicFailureClassifier.ts'
import { detectHeicEnvironment } from '../format-heic/HeicEnvDetector.ts'
import { contentPresenter } from '../present/ContentPresenter.ts'
import { presentFailureMessage } from '../present/copy.ts'
import { SessionStore } from '../shared/SessionStore.ts'
import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { PresentResult } from '../shared/types/present.ts'
import type { FileFormat, ParsePhase } from '../shared/types/session.ts'
import type { FileFailureType } from '../shared/types/errors.ts'
import { FileIngestZone } from './components/FileIngestZone.tsx'
import { FormatSlot } from './components/FormatSlot.tsx'
import { HeicDetailPane } from './components/HeicDetailPane.tsx'
import { HeicSegmentTree } from './components/HeicSegmentTree.tsx'
import { ParseStatusBar } from './components/ParseStatusBar.tsx'
import { SegmentTreePanel } from './components/SegmentTreePanel.tsx'
import { DetailPanel } from './components/DetailPanel.tsx'
import { WorkbenchLayout } from './layout/WorkbenchLayout.tsx'
import { parseOrchestrator } from './ParseOrchestrator.ts'

function phaseToParseStatus(phase: ParsePhase): 'success' | 'partial' | 'failed' | null {
  if (phase === 'success') return 'success'
  if (phase === 'partial') return 'partial'
  if (phase === 'failed') return 'failed'
  return null
}

export function WorkbenchPage() {
  const [phase, setPhase] = useState<ParsePhase>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [failureType, setFailureType] = useState<FileFailureType | null>(null)
  const [message, setMessage] = useState('')
  const [tree, setTree] = useState(parseOrchestrator.getTree())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [presentResult, setPresentResult] = useState<PresentResult | null>(null)
  const [ingestError, setIngestError] = useState<string | null>(null)
  const [format, setFormat] = useState<FileFormat | null>(null)
  const [presentLoading, setPresentLoading] = useState(false)
  const [heicParseHint, setHeicParseHint] = useState<string | null>(null)
  const selectSeq = useRef(0)
  const heicEnv = useMemo(() => detectHeicEnvironment(), [])

  useEffect(() => {
    return parseOrchestrator.subscribe((nextPhase, detail) => {
      setPhase(nextPhase)
      setFileName(detail?.fileName ?? null)
      setFailureType(detail?.failureType ?? null)
      setMessage(detail?.message ?? '')
      setTree(detail?.tree ?? null)
      const session = SessionStore.getInstance().getActiveSession()
      setFormat(session?.detectedFormat ?? null)

      const parseStatus = phaseToParseStatus(nextPhase)
      if (session?.detectedFormat === 'heic' && detail?.tree && parseStatus) {
        const truncated =
          parseStatus === 'partial' ||
          detail.message.includes('截断') ||
          detail.tree.warnings.some((w) => w.includes('截断') || w.includes('超出'))
        const report = classifyHeicParseOutcome(
          parseStatus,
          truncated,
          heicEnv,
          detail.tree.nodes.length,
        )
        setHeicParseHint(report.userMessage || null)
      } else {
        setHeicParseHint(null)
      }

      if (nextPhase === 'idle') {
        setSelectedId(null)
        setPresentResult(null)
        setFormat(null)
        setHeicParseHint(null)
      }
    })
  }, [heicEnv])

  const handleSelectNode = useCallback(async (node: SegmentNodeDto) => {
    const seq = ++selectSeq.current
    setSelectedId(node.id)
    setPresentLoading(true)

    const session = SessionStore.getInstance().getActiveSession()
    if (!session) {
      setPresentLoading(false)
      return
    }

    try {
      const req =
        session.detectedFormat === 'jpeg'
          ? await toPresentRequest(node, session.sessionId, session.buffer, tree?.nodes)
          : await toHeicPresentRequest(node, session.sessionId, session.buffer)

      const result = await contentPresenter.present(req)
      if (seq === selectSeq.current) {
        setPresentResult(result)
      }
    } catch {
      if (seq === selectSeq.current) {
        setPresentResult({
          status: 'failed',
          failureKind: 'PREVIEW_FAILED',
          viewModel: { kind: 'empty', message: presentFailureMessage('PREVIEW_FAILED') },
        })
      }
    } finally {
      if (seq === selectSeq.current) {
        setPresentLoading(false)
      }
    }
  }, [tree])

  const handleIngestError = useCallback((type: FileFailureType, msg: string) => {
    setIngestError(msg)
    setFailureType(type)
    setMessage(msg)
  }, [])

  const parsing = phase === 'parsing' || phase === 'validating'

  const treePanel =
    format === 'heic' ? (
      <HeicSegmentTree tree={tree} selectedId={selectedId} onSelect={handleSelectNode} />
    ) : (
      <SegmentTreePanel tree={tree} selectedId={selectedId} onSelect={handleSelectNode} />
    )

  const detailPanel =
    format === 'heic' ? (
      <HeicDetailPane
        result={presentResult}
        loading={presentLoading}
        env={heicEnv}
        parseHint={heicParseHint}
      />
    ) : (
      <DetailPanel result={presentResult} loading={presentLoading} />
    )

  return (
    <WorkbenchLayout
      header={
        <header className="workbench__header">
          <h1>Web 图片数据解析器</h1>
          <p className="workbench__subtitle">EPIC-005 · 本地解析 JPEG / HEIC 结构</p>
        </header>
      }
      ingest={<FileIngestZone disabled={parsing} onError={handleIngestError} />}
      error={ingestError ? <p className="workbench__error">{ingestError}</p> : null}
      status={
        <ParseStatusBar
          phase={phase}
          fileName={fileName}
          failureType={failureType}
          message={message}
          onCancel={() => parseOrchestrator.cancel()}
          onReset={() => {
            parseOrchestrator.reset()
            setIngestError(null)
            setPresentResult(null)
            setSelectedId(null)
            setFormat(null)
            setHeicParseHint(null)
          }}
        />
      }
      formatSlot={<FormatSlot format={format} />}
      tree={treePanel}
      detail={detailPanel}
    />
  )
}
