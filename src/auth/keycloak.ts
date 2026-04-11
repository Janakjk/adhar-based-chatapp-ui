import Keycloak from 'keycloak-js'

const url = (import.meta.env.VITE_KEYCLOAK_URL ?? '').replace(/\/$/, '')
const realm = (import.meta.env.VITE_KEYCLOAK_REALM ?? '').trim()
const clientId = (import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? '').trim()

export const keycloakConfigured = Boolean(url && realm && clientId)

export const keycloak: Keycloak | null = keycloakConfigured
  ? new Keycloak({ url, realm, clientId })
  : null

let initPromise: Promise<boolean> | null = null

export function resetKeycloakInit() {
  initPromise = null
}

export function initKeycloakClient(): Promise<boolean> {
  if (!keycloak) return Promise.resolve(false)

  if (!initPromise) {
    initPromise = keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      })
      .catch((err: unknown) => {
        initPromise = null
        throw err
      })
  }

  return initPromise
}
