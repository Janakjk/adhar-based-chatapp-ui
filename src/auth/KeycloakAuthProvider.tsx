import type Keycloak from 'keycloak-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initKeycloakClient,
  keycloak,
  keycloakConfigured,
  resetKeycloakInit,
} from './keycloak'

export type AuthMode = 'keycloak' | 'mock'

export type KeycloakAuthContextValue = {
  mode: AuthMode
  authenticated: boolean
  initError: string | null
  keycloak: Keycloak | null
  loginWithKeycloak: () => void
  registerWithKeycloak: () => void
  logoutKeycloak: () => void
  retryKeycloakInit: () => void
}

const KeycloakAuthContext = createContext<KeycloakAuthContextValue | null>(null)

function AuthBootLoader() {
  return (
    <div className="auth-boot">
      <div className="auth-boot-inner">
        <div className="auth-boot-spinner" aria-hidden />
        <p>Connecting to auth…</p>
      </div>
    </div>
  )
}

export function KeycloakAuthProvider({ children }: { children: ReactNode }) {
  const [bootReady, setBootReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const mode: AuthMode = keycloakConfigured ? 'keycloak' : 'mock'

  useEffect(() => {
    if (!keycloakConfigured) {
      setAuthenticated(false)
      setInitError(null)
      setBootReady(true)
      return
    }

    let cancelled = false
    setBootReady(false)
    setInitError(null)

    initKeycloakClient()
      .then((auth) => {
        const kc = keycloak
        if (cancelled || !kc) return
        setAuthenticated(auth)
        setBootReady(true)

        const sync = () => setAuthenticated(!!kc.authenticated)

        kc.onAuthSuccess = sync
        kc.onAuthRefreshSuccess = sync
        kc.onAuthLogout = () => setAuthenticated(false)
        kc.onTokenExpired = () =>
          kc.updateToken(60).catch(() =>
            kc.login({
              redirectUri: `${window.location.origin}/chat`,
            }),
          )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : typeof err === 'string' ? err : 'Keycloak init failed'
        setInitError(message)
        setAuthenticated(false)
        setBootReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [retryToken])

  const loginWithKeycloak = useCallback(() => {
    keycloak?.login({ redirectUri: `${window.location.origin}/chat` })
  }, [])

  const registerWithKeycloak = useCallback(() => {
    keycloak?.register({ redirectUri: `${window.location.origin}/chat` })
  }, [])

  const logoutKeycloak = useCallback(() => {
    keycloak?.logout({ redirectUri: `${window.location.origin}/login` })
  }, [])

  const retryKeycloakInit = useCallback(() => {
    resetKeycloakInit()
    setRetryToken((t) => t + 1)
  }, [])

  const value = useMemo<KeycloakAuthContextValue>(
    () => ({
      mode,
      authenticated,
      initError,
      keycloak,
      loginWithKeycloak,
      registerWithKeycloak,
      logoutKeycloak,
      retryKeycloakInit,
    }),
    [
      mode,
      authenticated,
      initError,
      loginWithKeycloak,
      registerWithKeycloak,
      logoutKeycloak,
      retryKeycloakInit,
    ],
  )

  if (!bootReady) {
    return <AuthBootLoader />
  }

  return (
    <KeycloakAuthContext.Provider value={value}>{children}</KeycloakAuthContext.Provider>
  )
}

export function useKeycloakAuth(): KeycloakAuthContextValue {
  const ctx = useContext(KeycloakAuthContext)
  if (!ctx) {
    throw new Error('useKeycloakAuth must be used within KeycloakAuthProvider')
  }
  return ctx
}
