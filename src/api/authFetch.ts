import { keycloak, keycloakConfigured } from '../auth/keycloak'

/**
 * Ensures the access token is fresh (Keycloak refresh if needed), then returns headers
 * including `Authorization: Bearer <token>` when the user is logged in via Keycloak.
 */
export async function getAuthHeaders(existing?: HeadersInit): Promise<Headers> {
  const headers = new Headers(existing)

  if (!keycloakConfigured || !keycloak?.authenticated) {
    return headers
  }

  try {
    await keycloak.updateToken(30)
    const token = keycloak.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } catch {
    // Refresh failed; request proceeds without Bearer — expect 401 from API if auth required.
  }

  return headers
}

/**
 * Same as `fetch`, but merges Keycloak Bearer auth when available.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = await getAuthHeaders(init?.headers)
  return fetch(input, { ...init, headers })
}

/** Join `VITE_API_BASE_URL` with a path (e.g. `/api/messages`). */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
