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

export interface TransactionDraft {
  category: string | null
  category_id: string | null
  type: TransactionType | null
  amount: string | null
  currency: string | null
  transaction_date: string | null
  merchant_name: string | null
  description: string | null
}

export type TransactionFormValues =
  Omit<TransactionCreate, 'type'> & {
    type: TransactionType | ''
  }