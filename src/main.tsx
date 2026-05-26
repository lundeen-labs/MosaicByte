import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    {/* Real-user Core Web Vitals (LCP/INP/CLS) — the data source behind the
        status-strip metrics. Cookieless; renders nothing. */}
    <SpeedInsights />
  </StrictMode>
)
