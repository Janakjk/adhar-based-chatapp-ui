import { Navigate, useLocation } from 'react-router-dom'
import { hasDemoSession } from '../auth/demoSession'
import { useKeycloakAuth } from '../auth/KeycloakAuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { mode, authenticated } = useKeycloakAuth()
  const location = useLocation()

  if (mode === 'mock') {
    return children
  }

  const demo = hasDemoSession()
  if (!authenticated && !demo) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
