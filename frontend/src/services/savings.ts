import { apiRequest } from './api'
import type {
  SavingsDepositCreate,
  SavingsMovementRead,
  SavingsSummaryRead,
  SavingsMovementPage,
} from '../types/savings'

export function createSavingsDeposit(data: SavingsDepositCreate): Promise<SavingsMovementRead> {
  return apiRequest<SavingsMovementRead>('/savings/deposits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function getSavingsSummary(signal?: AbortSignal): Promise<SavingsSummaryRead> {
  return apiRequest<SavingsSummaryRead>('/savings', { signal })
}

export function getSavingsMovements(
  limit: number,
  offset: number,
  signal?: AbortSignal,
): Promise<SavingsMovementPage> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return apiRequest<SavingsMovementPage>(`/savings/movements?${params}`, { signal })
}
