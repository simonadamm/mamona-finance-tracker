export interface OpeningBalanceRead {
  currency: string
  opening_balance: string | null
  opening_date: string | null
}

export interface OpeningBalanceUpdate {
  opening_balance: string
  opening_date: string
}

export interface BalanceRead extends OpeningBalanceRead {
  as_of: string
  total_income: string | null
  total_expenses: string | null
  current_balance: string | null
}
