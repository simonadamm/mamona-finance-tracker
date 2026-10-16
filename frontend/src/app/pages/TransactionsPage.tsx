import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'

import TransactionTable from '../../components/transactions/TransactionTable'
import { getTransactions } from '../../services/transactions'
import type { TransactionRead } from '../../types/transaction'
import TransactionFilters from '../../components/transactions/TransactionFilters'
import { getCategories } from '../../services/categories'
import type { CategoryRead } from '../../types/category'
import AddTransactionDialog from '../../components/transactions/AddTransactionDialog'

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <h1>Transactions</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setTransactionSaved(false)
            setDialogOpen(true)
          }}
        >
          Add new transaction
        </Button>
      </Box>
      <p>
        {year
          ? 'Transactions for the selected period'
          : 'Last 50 transactions'}
      </p>

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
            />
      )}
    </section>
  )
}
