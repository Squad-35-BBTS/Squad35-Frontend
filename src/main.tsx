import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import ThemeToggle from './components/ThemeToggle'
import AccessibilityTools from './components/AccessibilityTools'

import './theme.css'
import './branding.css'
import './accessibility.css'

import './theme.css'
import './branding.css'
import './accessibility.css'
import './visual.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <a className="skip-link" href="#main-content">
      Ir para o conteúdo principal
    </a>

    <App />
    <ThemeToggle />
    <AccessibilityTools />
  </StrictMode>,
)