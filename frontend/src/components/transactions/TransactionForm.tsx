import { useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import { createTransaction, updateTransaction } from '../../services/transactions'
import type { CategoryRead } from '../../types/category'
import type {
  TransactionCreate,
  TransactionFormValues,
  TransactionType,
} from '../../types/transaction'

interface TransactionFormProps {
  categories: CategoryRead[]
  initialValues?: TransactionFormValues
  transactionId?: string
  onSaved: () => void
  onSavingChange?: (saving: boolean) => void
}

function getEmptyForm(): TransactionFormValues {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return {
    category_id: '',
    type: 'expense',
    amount: '',
    currency: 'EUR',
    transaction_date: `${year}-${month}-${day}`,
    merchant_name: '',
    description: '',
  }
}

export default function TransactionForm({
  categories,
  initialValues,
  transactionId,
  onSaved,
  onSavingChange,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormValues>(
    () => initialValues ?? getEmptyForm(),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setError(null)

    const type = form.type

    if (!type) {
      setError('Select a transaction type.')
      return
    }

    const amount = form.amount.trim().replace(',', '.')

    if (
      !/^\d{1,10}(\.\d{1,2})?$/.test(amount) ||
      Number(amount) <= 0
    ) {
      setError(
        'Enter a positive amount with up to 10 integer digits and 2 decimal places.',
      )
      return
    }

    setSaving(true)
    onSavingChange?.(true)

    try {
      const data: TransactionCreate = {
        ...form,
        type,
        amount,
        currency: form.currency.trim().toUpperCase(),
        merchant_name: form.merchant_name?.trim() || null,
        description: form.description?.trim() || null,
      }

      if (transactionId) {
        await updateTransaction(transactionId, data)
      } else {
        await createTransaction(data)
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The transaction could not be saved.',
      )
      return
    } finally {
      setSaving(false)
      onSavingChange?.(false)
    }

    setForm(getEmptyForm())
    onSaved()
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box
        component="fieldset"
        disabled={saving}
        sx={{
          border: 0,
          p: 0,
          m: 0,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <TextField
          select
          required
          id="new-transaction-type"
          label="Type"
          value={form.type}
          onChange={(event) =>
            setForm({
              ...form,
              type: event.target.value as TransactionType,
            })
          }
        >
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="transfer">Transfer</MenuItem>
        </TextField>

        <TextField
          select
          required
          id="new-transaction-category"
          label="Category"
          value={form.category_id}
          disabled={categories.length === 0}
          onChange={(event) =>
            setForm({ ...form, category_id: event.target.value })
          }
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          label="Amount"
          value={form.amount}
          onChange={(event) =>
            setForm({ ...form, amount: event.target.value })
          }
          helperText="For example: 18.50 or 18,50"
          slotProps={{
            htmlInput: { inputMode: 'decimal' },
          }}
        />

        <TextField
          required
          label="Currency"
          value={form.currency}
          onChange={(event) =>
            setForm({
              ...form,
              currency: event.target.value.toUpperCase(),
            })
          }
          helperText="Three-letter code, for example EUR or PLN"
          slotProps={{
            htmlInput: {
              maxLength: 3,
              minLength: 3,
              pattern: '[A-Z]{3}',
            },
          }}
        />

        <TextField
          required
          type="date"
          label="Date"
          value={form.transaction_date}
          onChange={(event) =>
            setForm({
              ...form,
              transaction_date: event.target.value,
            })
          }
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              min: '0001-01-01',
              max: '9999-12-31',
            },
          }}
        />

        <TextField
          label="Merchant"
          value={form.merchant_name ?? ''}
          onChange={(event) =>
            setForm({ ...form, merchant_name: event.target.value })
          }
          slotProps={{
            htmlInput: { maxLength: 255 },
          }}
        />

        <TextField
          multiline
          minRows={2}
          label="Description"
          value={form.description ?? ''}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          sx={{ gridColumn: '1 / -1' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={saving || categories.length === 0}
        sx={{ mt: 2 }}
      >
        {saving ? 'Saving…' : transactionId ? 'Save changes' : 'Save transaction'}
      </Button>
    </Box>
  )
}
