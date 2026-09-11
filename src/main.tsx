import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tokens are the styling contract — ADR 0002.
import './styles/tokens.css'
import { App } from '@/app/app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
