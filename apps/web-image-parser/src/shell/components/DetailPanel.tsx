import type { PresentResult } from '../../shared/types/present.ts'

interface DetailPanelProps {
  result: PresentResult | null
  loading?: boolean
}

export function DetailPanel({ result, loading }: DetailPanelProps) {
  if (loading) {
    return (
      <div className="detail-panel" data-testid="detail-panel">
        加载中…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="detail-panel detail-panel--empty" data-testid="detail-panel">
        选择左侧分区查看内容
      </div>
    )
  }

  const { viewModel, status, failureKind } = result

  return (
    <div className="detail-panel" data-testid="detail-panel">
      {status !== 'success' && failureKind ? (
        <p className="detail-panel__error">{viewModel.kind === 'empty' ? viewModel.message : failureKind}</p>
      ) : null}
      {viewModel.kind === 'image' ? (
        <img src={viewModel.src} alt={viewModel.alt} className="detail-panel__image" />
      ) : null}
      {viewModel.kind === 'video' ? (
        <video src={viewModel.src} controls className="detail-panel__video">
          <track kind="captions" />
        </video>
      ) : null}
      {viewModel.kind === 'audio' ? (
        <audio src={viewModel.src} controls className="detail-panel__audio" />
      ) : null}
      {viewModel.kind === 'readable' ? (
        <div className="detail-panel__readable">
          <h3>{viewModel.payload.title}</h3>
          <dl>
            {viewModel.payload.fields.map((f) => (
              <div key={f.key}>
                <dt>{f.key}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {viewModel.payload.hexPreview ? (
            <pre className="detail-panel__hex">{viewModel.payload.hexPreview}</pre>
          ) : null}
        </div>
      ) : null}
      {viewModel.kind === 'mixed' ? (
        <div className="detail-panel__mixed">
          <h3>{viewModel.readable.title}</h3>
          {viewModel.media.kind === 'image' ? (
            <img src={viewModel.media.src} alt={viewModel.media.alt} />
          ) : null}
        </div>
      ) : null}
      {viewModel.kind === 'empty' ? <p>{viewModel.message}</p> : null}
    </div>
  )
}
