import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      {/* Real-user Core Web Vitals (LCP/INP/CLS) — the data source behind the
          status-strip metrics. Cookieless; renders nothing. */}
      <SpeedInsights />
    </HelmetProvider>
  </StrictMode>
)
