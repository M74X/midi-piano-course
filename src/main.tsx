import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import AudioTest from './components/AudioTest'
import * as Tone from 'tone'
Tone.getDestination().volume.value = -24

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <AudioTest />
  </StrictMode>,
)
