import { apiRequest } from './api'
import type { MonthlyHistoryRead, MonthlyStatsRead } from '../types/analytics'

export function getMonthlyStats(
  year: number,
  month: number,
  signal?: AbortSignal,
): Promise<MonthlyStatsRead> {
  const params = new URLSearchParams({ year: String(year), month: String(month) })
  return apiRequest<MonthlyStatsRead>(`/analytics/monthly?${params}`, { signal })
}

export function getMonthlyHistory(
  months: number,
  signal?: AbortSignal,
): Promise<MonthlyHistoryRead> {
  const params = new URLSearchParams({ months: String(months) })
  return apiRequest<MonthlyHistoryRead>(`/analytics/history?${params}`, { signal })
}
