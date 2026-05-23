import type { PresentResult } from '../../shared/types/present.ts'
import type { HeicEnvReport } from '../../format-heic/HeicEnvDetector.ts'
import { DetailPanel } from './DetailPanel.tsx'

interface HeicDetailPaneProps {
  result: PresentResult | null
  loading?: boolean
  env: HeicEnvReport
  parseHint?: string | null
}

export function HeicDetailPane({ result, loading, env, parseHint }: HeicDetailPaneProps) {
  return (
    <div className="heic-detail-pane">
      <div className="heic-detail-pane__env" data-level={env.level}>
        <strong>HEIC 环境 {env.level}</strong>
        <span>{env.message}</span>
      </div>
      {parseHint ? <p className="heic-detail-pane__hint">{parseHint}</p> : null}
      <DetailPanel result={result} loading={loading} />
    </div>
  )
}
