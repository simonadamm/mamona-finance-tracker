import { apiRequest } from './api'
import type {
  TransactionCreate,
  TransactionQuery,
  TransactionRead,
  TransactionDraft,
} from '../types/transaction'

export function getTransactions(
  filters: TransactionQuery = {},
  signal?: AbortSignal,
): Promise<TransactionRead[]> {
  const params = new URLSearchParams()

  if (filters.year !== undefined) {
    params.set('year', String(filters.year))
  }

  if (filters.month !== undefined) {
    params.set('month', String(filters.month))
  }

  if (filters.category_id) {
    params.set('category_id', filters.category_id)
  }

  const query = params.toString()
  const path = query ? `/transactions?${query}` : '/transactions'

  return apiRequest<TransactionRead[]>(path, { signal })
}

export function createTransaction(
  data: TransactionCreate,
): Promise<TransactionRead> {
  return apiRequest<TransactionRead>('/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export function generateTransactionDraft(
  query: string,
  signal?: AbortSignal,
): Promise<TransactionDraft> {
  return apiRequest<TransactionDraft>('/transactions/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    signal,
  })
}