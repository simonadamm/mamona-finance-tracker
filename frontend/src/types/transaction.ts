export type TransactionType = 'income' | 'expense' | 'transfer'

export interface TransactionQuery {
  year?: number
  month?: number
  category_id?: string
}

export interface TransactionRead {
  id: string
  user_id: string
  category_id: string

  type: TransactionType
  amount: string
  currency: string
  transaction_date: string

  merchant_name: string | null
  description: string | null

  created_at: string
  updated_at: string
}

export interface TransactionCreate {
  category_id: string
  type: TransactionType
  amount: string
  currency: string
  transaction_date: string
  merchant_name: string | null
  description: string | null
}