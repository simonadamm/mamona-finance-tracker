import { apiRequest } from './api'
import type { SavingGoalAllocation, SavingGoalCreate, SavingGoalRead } from '../types/savingGoal'

export function getSavingGoals(signal?: AbortSignal): Promise<SavingGoalRead[]> {
  return apiRequest<SavingGoalRead[]>('/saving-goals', { signal })
}

export function createSavingGoal(data: SavingGoalCreate): Promise<SavingGoalRead> {
  return apiRequest<SavingGoalRead>('/saving-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function assignSavingsToGoal(goalId: string, data: SavingGoalAllocation): Promise<SavingGoalRead> {
  return apiRequest<SavingGoalRead>(`/saving-goals/${encodeURIComponent(goalId)}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function releaseSavingsFromGoal(goalId: string, data: SavingGoalAllocation): Promise<SavingGoalRead> {
  return apiRequest<SavingGoalRead>(`/saving-goals/${encodeURIComponent(goalId)}/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
