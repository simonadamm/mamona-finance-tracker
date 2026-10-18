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
  average_daily_expenses: string
  expenses_by_category: CategoryExpenseRead[]
}
