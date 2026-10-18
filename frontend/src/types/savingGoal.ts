export interface SavingGoalCreate {
  name: string
  target_amount: string
  target_date: string
}

export interface SavingGoalAllocation {
  amount: string
}

export interface SavingGoalRead extends SavingGoalCreate {
  id: string
  current_amount: string
  currency: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}
