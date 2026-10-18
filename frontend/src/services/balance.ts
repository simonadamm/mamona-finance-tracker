import { apiRequest } from './api'
import type {
  BalanceRead,
  OpeningBalanceRead,
  OpeningBalanceUpdate,
} from '../types/balance'

export function getBalance(signal?: AbortSignal): Promise<BalanceRead> {
  return apiRequest<BalanceRead>('/balance', { signal })
}

export function getOpeningBalance(signal?: AbortSignal): Promise<OpeningBalanceRead> {
  return apiRequest<OpeningBalanceRead>('/balance/opening', { signal })
}

export function updateOpeningBalance(
  data: OpeningBalanceUpdate,
): Promise<OpeningBalanceRead> {
  return apiRequest<OpeningBalanceRead>('/balance/opening', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
