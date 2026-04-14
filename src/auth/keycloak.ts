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

async function ensureKeycloakReachable(baseUrl: string, realmName: string): Promise<void> {
  const wellKnownUrl = `${baseUrl}/realms/${realmName}/.well-known/openid-configuration`
  let response: Response
  try {
    response = await fetch(wellKnownUrl, { method: 'GET' })
  } catch {
    throw new Error(
      `Keycloak could not be reached at ${baseUrl}. Check that Keycloak is running and VITE_KEYCLOAK_URL is correct.`,
    )
  }

  if (!response.ok) {
    throw new Error(
      `Keycloak endpoint check failed (${response.status}) at ${wellKnownUrl}. Verify realm and URL settings.`,
    )
  }
}

export function initKeycloakClient(): Promise<boolean> {
  if (!keycloak) return Promise.resolve(false)

  if (!initPromise) {
    initPromise = ensureKeycloakReachable(url, realm)
      .then(() =>
        keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        }),
      )
      .catch((err: unknown) => {
        initPromise = null
        throw err
      })
  }

  return initPromise
}
