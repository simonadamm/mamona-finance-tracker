import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import TransactionForm from './TransactionForm'
import { deleteTransaction } from '../../services/transactions'
import type { CategoryRead } from '../../types/category'
import type { TransactionRead } from '../../types/transaction'

interface TransactionActionDialogProps {
  mode: 'edit' | 'delete'
  transaction: TransactionRead
  categories: CategoryRead[]
  onClose: () => void
  onCompleted: () => void
}

export default function TransactionActionDialog({
  mode,
  transaction,
  categories,
  onClose,
  onCompleted,
}: TransactionActionDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (!busy) onClose()
  }

  async function handleDelete() {
    if (busy) return

    setBusy(true)
    setError(null)

    try {
      await deleteTransaction(transaction.id)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The transaction could not be deleted.',
      )
      return
    } finally {
      setBusy(false)
    }

    onCompleted()
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="transaction-action-title"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle id="transaction-action-title">
        {mode === 'edit' ? 'Edit transaction' : 'Delete transaction'}
      </DialogTitle>
      <DialogContent>
        {mode === 'edit' ? (
          <TransactionForm
            transactionId={transaction.id}
            categories={categories}
            initialValues={{
              category_id: transaction.category_id,
              type: transaction.type,
              amount: transaction.amount,
              currency: transaction.currency,
              transaction_date: transaction.transaction_date,
              merchant_name: transaction.merchant_name,
              description: transaction.description,
            }}
            onSaved={onCompleted}
            onSavingChange={setBusy}
          />
        ) : (
          <>
            <Typography sx={{ mb: 2 }}>
              {transaction.transaction_date}
              {' — '}
              {transaction.description || transaction.merchant_name || 'Transaction'}
              {' — '}
              {transaction.amount} {transaction.currency}
            </Typography>
            <Alert severity="warning">
              Delete this transaction? This action cannot be undone.
            </Alert>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={busy}>
          Cancel
        </Button>
        {mode === 'delete' && (
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Delete transaction'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
