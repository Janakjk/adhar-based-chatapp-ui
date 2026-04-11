import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { KeycloakAuthProvider } from './auth/KeycloakAuthProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <KeycloakAuthProvider>
        <App />
      </KeycloakAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
