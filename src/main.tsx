import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Tokens are the styling contract (ADR 0002) and load last so they win over
// the Vite starter scaffolding in index.css, which #2 removes.
import './styles/tokens.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
