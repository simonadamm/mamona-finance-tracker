export interface SavingsDepositCreate {
  amount: string
  movement_date: string
}

export interface SavingsMovementRead extends SavingsDepositCreate {
  id: string
  type: 'deposit' | 'withdrawal'
  currency: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface SavingsSummaryRead {
  currency: string
  as_of: string
  total_deposits: string
  total_withdrawals: string
  total_savings: string
  assigned_savings: string
  available_savings: string
}

export interface SavingsMovementPage {
  currency: string
  as_of: string
  items: SavingsMovementRead[]
  total: number
  limit: number
  offset: number
}
