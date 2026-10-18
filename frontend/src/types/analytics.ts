export interface CategoryExpenseRead {
  category_id: string
  category_name: string
  amount: string
}

export interface MonthlyStatsRead {
  year: number
  month: number
  currency: string
  period_start: string
  period_end: string
  days_counted: number
  total_income: string
  total_expenses: string
  net_cash_flow: string
  savings_deposits: string
  savings_withdrawals: string
  net_savings: string
  remaining_budget: string
  average_daily_expenses: string
  expenses_by_category: CategoryExpenseRead[]
}

export interface MonthlyHistoryPoint {
  year: number
  month: number
  total_income: string
  total_expenses: string
  net_cash_flow: string
  is_current_month: boolean
}

export interface MonthlyHistoryRead {
  currency: string
  as_of: string
  points: MonthlyHistoryPoint[]
}
