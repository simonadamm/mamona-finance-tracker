import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import SavingsSummary from '../../components/savings/SavingsSummary'
import SavingsMovementsTable from '../../components/savings/SavingsMovementsTable'
import SavingGoalsPanel from '../../components/savings/SavingGoalsPanel'
import { getSavingsMovements, getSavingsSummary } from '../../services/savings'
import type { SavingsMovementPage, SavingsSummaryRead } from '../../types/savings'

export default function SavingsPage() {
  const [summary, setSummary] = useState<SavingsSummaryRead | null>(null)
  const [movements, setMovements] = useState<SavingsMovementPage | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [reloadKey, setReloadKey] = useState(0)
  const [summaryVersion, setSummaryVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const data = await getSavingsSummary(controller.signal)
        if (!controller.signal.aborted) setSummary(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setSummary(null)
          setSummaryError(error instanceof Error ? error.message : 'Savings totals could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setSummaryLoading(false)
      }
    }
    void loadSummary()
    return () => controller.abort()
  }, [reloadKey, summaryVersion])

  useEffect(() => {
    const controller = new AbortController()
    async function loadHistory() {
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        const data = await getSavingsMovements(rowsPerPage, page * rowsPerPage, controller.signal)
        if (controller.signal.aborted) return
        const lastPage = Math.max(0, Math.ceil(data.total / rowsPerPage) - 1)
        if (page > lastPage) {
          setPage(lastPage)
          return
        }
        setMovements(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setMovements(null)
          setHistoryError(error instanceof Error ? error.message : 'Savings history could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false)
      }
    }
    void loadHistory()
    return () => controller.abort()
  }, [page, rowsPerPage, reloadKey])

  const retry = () => setReloadKey((value) => value + 1)

  return (
    <section>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <h1>Savings</h1>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button color="inherit" disabled={summaryLoading || historyLoading} onClick={retry}>Refresh</Button>
          <Button component={RouterLink} to="/analyse" variant="contained">Record a monthly deposit</Button>
        </Box>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Money set aside across all recorded months, with a history of deposits and withdrawals.
      </Typography>

      {summaryLoading && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <CircularProgress size={24} aria-hidden="true" />Loading Savings totals…
        </Box>
      )}
      {!summaryLoading && summaryError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" onClick={retry}>Retry</Button>}>{summaryError}</Alert>
      )}
      {!summaryLoading && !summaryError && summary && (
        <>
          <SavingsSummary summary={summary} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            As of {summary.as_of}. Only {summary.currency} movements are included;
            future movements are excluded. Savings carry across months, independently
            of each month's budget. Totals include all operations, not just this page of history.
          </Typography>
        </>
      )}

      <SavingGoalsPanel currency={summary?.currency} refreshKey={reloadKey}
        onAllocationChanged={() => setSummaryVersion((value) => value + 1)} />

      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Movement history</Typography>
      {historyError ? (
        <Alert severity="error" action={<Button color="inherit" onClick={retry}>Retry</Button>}>{historyError}</Alert>
      ) : (
        <SavingsMovementsTable
          data={movements}
          loading={historyLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows)
            setPage(0)
          }}
        />
      )}
    </section>
  )
}
