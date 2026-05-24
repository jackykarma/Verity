import type { GalleryImage, PresentResult, ReadablePayload } from '../../shared/types/present.ts'

interface DetailPanelProps {
  result: PresentResult | null
  loading?: boolean
}

function ReadableBody({ payload }: { payload: ReadablePayload }) {
  return (
    <>
      {payload.hexPreview ? (
        <section className="detail-panel__hex-section" data-testid="detail-hex-section">
          <h4 className="detail-panel__section-title">原始数据 (Hex)</h4>
          <pre className="detail-panel__hex">{payload.hexPreview}</pre>
        </section>
      ) : null}
      <h3>{payload.title}</h3>
      <dl>
        {payload.fields.map((f) => (
          <div key={f.key}>
            <dt>{f.key}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      {payload.textBody ? (
        <pre className="detail-panel__xml" data-testid="detail-text-body">
          {payload.textBody}
        </pre>
      ) : null}
    </>
  )
}

function GalleryGrid({ gallery }: { gallery: GalleryImage[] }) {
  return (
    <div className="detail-panel__gallery" data-testid="detail-gallery">
      {gallery.map((item) => (
        <figure key={item.label} className="detail-panel__gallery-item">
          <img src={item.src} alt={item.alt} className="detail-panel__gallery-image" />
          <figcaption>{item.label}</figcaption>
        </figure>
      ))}
    </div>
  )
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
        <p className="detail-panel__error">
          {viewModel.kind === 'empty' ? viewModel.message : failureKind}
        </p>
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
          <ReadableBody payload={viewModel.payload} />
        </div>
      ) : null}
      {viewModel.kind === 'mixed' ? (
        <div className="detail-panel__mixed">
          <ReadableBody payload={viewModel.readable} />
          {viewModel.gallery && viewModel.gallery.length > 0 ? (
            <GalleryGrid gallery={viewModel.gallery} />
          ) : viewModel.media.kind === 'image' ? (
            <img src={viewModel.media.src} alt={viewModel.media.alt} className="detail-panel__image" />
          ) : null}
        </div>
      ) : null}
      {viewModel.kind === 'empty' ? <p>{viewModel.message}</p> : null}
    </div>
  )
}
