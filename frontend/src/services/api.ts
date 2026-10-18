const API_BASE_URL = '/api'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    let message = `Following request can't be done. HTTP Code: ${response.status}.`
    // FastAPI business-rule errors carry a readable message in detail.
    try {
      const body: unknown = await response.json()
      if (typeof body === 'object' && body !== null && 'detail' in body
        && typeof body.detail === 'string' && body.detail.trim()) {
        message = body.detail
      }
    } catch {
      // Keep the HTTP fallback for empty or non-JSON error responses.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
