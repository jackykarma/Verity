import { useState } from 'react'

export function PrivacyNotice() {
  const [open, setOpen] = useState(false)

  return (
    <div className="privacy-notice">
      <button type="button" className="privacy-notice__toggle" onClick={() => setOpen((v) => !v)}>
        {open ? '收起隐私说明' : '隐私说明'}
      </button>
      {open ? (
        <p className="privacy-notice__body">
          所有文件仅在您的浏览器本地解析，不会上传至任何服务器。关闭页面或重新选择文件后，内存中的文件与解析结果将被清除。
        </p>
      ) : null}
    </div>
  )
}
