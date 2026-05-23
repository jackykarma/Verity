import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WorkbenchPage } from './shell/WorkbenchPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkbenchPage />
  </StrictMode>,
)
