import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import PageHeader from '../../components/layout/PageHeader'

import TransactionTable from '../../components/transactions/TransactionTable'
import { getTransactions } from '../../services/transactions'
import type { TransactionRead } from '../../types/transaction'
import TransactionFilters from '../../components/transactions/TransactionFilters'
import { getCategories } from '../../services/categories'
import type { CategoryRead } from '../../types/category'
import AddTransactionDialog from '../../components/transactions/AddTransactionDialog'
import TransactionActionDialog from '../../components/transactions/TransactionActionDialog'

interface TransactionAction {
  mode: 'edit' | 'delete'
  transaction: TransactionRead
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [transactionSaved, setTransactionSaved] = useState(false)
  const [action, setAction] = useState<TransactionAction | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTransactions() {

      setLoading(true)
      setError(null)

      try {
        const data = await getTransactions(
          {
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            category_id: categoryId || undefined,
          },
          controller.signal,
        )

        if (!controller.signal.aborted) {
          setTransactions(data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : 'This transaction cannot be loaded',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadTransactions()

    return () => controller.abort()
  }, [year, month, categoryId, reloadKey])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const data = await getCategories(controller.signal)

        if (!controller.signal.aborted) {
          setCategories(data)
        }
      } catch {
        if (!controller.signal.aborted) {
          setCategoriesError('Category names could not be loaded.')
        }
      }
    }

    void loadCategories()

    return () => controller.abort()
  }, [])

  return (
    <section>
      <PageHeader eyebrow="THE EVERYDAY DETAILS" title="Every move, in view." description={year ? 'Explore your transactions for the selected period.' : 'Your 50 most recent transactions, all in one place.'}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setActionMessage(null)
            setTransactionSaved(false)
            setDialogOpen(true)
          }}
        >
          Add new transaction
        </Button>
      </PageHeader>

      {transactionSaved && (
        <Alert
          severity="success"
          onClose={() => setTransactionSaved(false)}
          sx={{ mb: 3 }}
        >
          Transaction saved. It will appear in the list if it matches
          the current filters.
        </Alert>
      )}

      {dialogOpen && (
        <AddTransactionDialog
          categories={categories}
          onClose={() => setDialogOpen(false)}
          onCreated={() => {
            setDialogOpen(false)
            setTransactionSaved(true)
            setReloadKey((value) => value + 1)
          }}
        />
      )}

      {actionMessage && (
        <Alert
          severity="success"
          onClose={() => setActionMessage(null)}
          sx={{ mb: 3 }}
        >
          {actionMessage}
        </Alert>
      )}

      {action && (
        <TransactionActionDialog
          key={`${action.mode}-${action.transaction.id}`}
          mode={action.mode}
          transaction={action.transaction}
          categories={categories}
          onClose={() => setAction(null)}
          onCompleted={() => {
            setActionMessage(
              action.mode === 'edit'
                ? 'Transaction updated. The list respects your current filters.'
                : 'Transaction deleted.',
            )
            setAction(null)
            setReloadKey((value) => value + 1)
          }}
        />
      )}

      <TransactionFilters
        year={year}
        month={month}
        categoryId={categoryId}
        categories={categories}
        onYearChange={(value) => {
          setYear(value)

          if (!value) {
            setMonth('')
            setCategoryId('')
          }
        }}
        onMonthChange={setMonth}
        onCategoryChange={setCategoryId}
      />

      {loading && (
        <div role="status">
          <CircularProgress size={24} aria-hidden="true" />
          <span>Transactions loading...</span>
        </div>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {categoriesError && (
        <Alert severity="warning">{categoriesError}</Alert>
      )}

      {!loading && !error && (
        transactions.length === 0
          ? <Alert severity="info">No transactions found for the selected filters.</Alert>
          : <TransactionTable
              transactions={transactions}
              categories={categories}
              onEdit={(transaction) => {
                setActionMessage(null)
                setTransactionSaved(false)
                setAction({ mode: 'edit', transaction })
              }}
              onDelete={(transaction) => {
                setActionMessage(null)
                setTransactionSaved(false)
                setAction({ mode: 'delete', transaction })
              }}
            />
      )}
    </section>
  )
}
