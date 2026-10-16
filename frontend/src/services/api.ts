const API_BASE_URL = '/api'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    throw new Error(
      `Following request can't be done. HTTP Code: ${response.status}.`,
    )
  }

  return response.json() as Promise<T>
}