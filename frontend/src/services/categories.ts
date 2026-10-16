import { apiRequest } from './api'
import type { CategoryRead } from '../types/category'

export function getCategories(
  signal?: AbortSignal,
): Promise<CategoryRead[]> {
  return apiRequest<CategoryRead[]>('/categories', { signal })
}