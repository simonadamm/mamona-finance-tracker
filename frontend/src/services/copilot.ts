import { apiRequest } from './api'
import type { FinancialCopilotRequest, FinancialCopilotResponse } from '../types/copilot'

export async function askFinancialCopilot(
  data: FinancialCopilotRequest,
  signal?: AbortSignal,
): Promise<FinancialCopilotResponse> {
  const response = await apiRequest<FinancialCopilotResponse>('/financial_copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  })
  if (typeof response?.answer !== 'string' || !response.answer.trim()
    || typeof response.thread_id !== 'string' || !response.thread_id) {
    throw new Error('The assistant returned an incomplete response. Please start a new chat.')
  }
  return response
}
