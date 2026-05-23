import type { ReactNode } from 'react'
import { PrivacyNotice } from '../components/PrivacyNotice.tsx'

interface WorkbenchLayoutProps {
  header: ReactNode
  ingest: ReactNode
  status: ReactNode
  error?: ReactNode
  formatSlot: ReactNode
  tree: ReactNode
  detail: ReactNode
}

export function WorkbenchLayout({
  header,
  ingest,
  status,
  error,
  formatSlot,
  tree,
  detail,
}: WorkbenchLayoutProps) {
  return (
    <div className="workbench">
      {header}
      <PrivacyNotice />
      {ingest}
      {error}
      {status}
      {formatSlot}
      <div className="workbench__body">
        <aside className="workbench__tree">{tree}</aside>
        <main className="workbench__detail">{detail}</main>
      </div>
    </div>
  )
}
