import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import MonthlyStatsSummary from '../../components/analytics/MonthlyStatsSummary'
import MonthlyStatsCharts from '../../components/analytics/MonthlyStatsCharts'
import MonthlyHistoryChart from '../../components/analytics/MonthlyHistoryChart'
import SavingsDepositPanel from '../../components/savings/SavingsDepositPanel'
import { getMonthlyStats } from '../../services/analytics'
import type { MonthlyStatsRead } from '../../types/analytics'
import { getCurrentMonth } from '../../utils/formatters'

export default function HomePage() {
  const [stats, setStats] = useState<MonthlyStatsRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [depositSaved, setDepositSaved] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadOverview() {
      setLoading(true)
      setError(null)
      const [year, month] = getCurrentMonth().split('-').map(Number)

      try {
        const data = await getMonthlyStats(year, month, controller.signal)
        if (!controller.signal.aborted) setStats(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setStats(null)
          setError(error instanceof Error ? error.message : 'The monthly overview could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadOverview()
    return () => controller.abort()
  }, [reloadKey])

  return (
    <section>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <h1>Overview</h1>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button color="inherit" disabled={loading} onClick={() => setReloadKey((value) => value + 1)}>
            Refresh
          </Button>
          <Button component={RouterLink} to="/analyse" variant="contained">
            Explore monthly analysis
          </Button>
        </Box>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your current month's income, expenses and remaining budget.
      </Typography>
      {depositSaved && (
        <Alert severity="success" onClose={() => setDepositSaved(null)} sx={{ mb: 2 }}>
          Savings deposit recorded for {depositSaved}.
        </Alert>
      )}
      {loading && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} aria-hidden="true" />Loading monthly overview…
        </Box>
      )}
      {!loading && error && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {!loading && !error && stats && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Period: {stats.period_start} to {stats.period_end}, inclusive. Currency: {stats.currency}.
          </Typography>
          {Number(stats.total_income) === 0 && Number(stats.total_expenses) === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No income or expenses in {stats.currency} recorded for this month yet.
            </Alert>
          )}
          <MonthlyStatsSummary stats={stats} />
          <SavingsDepositPanel
            stats={stats}
            onDeposited={(movement) => {
              setDepositSaved(movement.movement_date)
              setReloadKey((value) => value + 1)
            }}
          />
          <MonthlyStatsCharts stats={stats} />
          <Alert severity="info" sx={{ mt: 3 }}>
            Each month's budget is independent. Unused amounts are not carried
            forward as next month's income. Other currencies, transfers and
            future transactions are excluded from these totals.
          </Alert>
        </>
      )}
      <Box sx={{ mt: 3 }}>
        <MonthlyHistoryChart refreshKey={reloadKey} />
      </Box>
    </section>
  )
}
