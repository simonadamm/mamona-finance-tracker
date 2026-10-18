import { apiRequest } from './api'
import type { MonthlyStatsRead } from '../types/analytics'

export function getMonthlyStats(
  year: number,
  month: number,
  signal?: AbortSignal,
): Promise<MonthlyStatsRead> {
  const params = new URLSearchParams({ year: String(year), month: String(month) })
  return apiRequest<MonthlyStatsRead>(`/analytics/monthly?${params}`, { signal })
}
