import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import MonthlyStatsSummary from '../../components/analytics/MonthlyStatsSummary'
import MonthlyStatsCharts from '../../components/analytics/MonthlyStatsCharts'
import { getMonthlyStats } from '../../services/analytics'
import type { MonthlyStatsRead } from '../../types/analytics'

function getCurrentMonth() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return `${year}-${month}`
}

export default function AnalysePage() {
  const [periodInput, setPeriodInput] = useState(getCurrentMonth)
  const [period, setPeriod] = useState(getCurrentMonth)
  const [reloadKey, setReloadKey] = useState(0)
  const [stats, setStats] = useState<MonthlyStatsRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStats() {
      setLoading(true)
      setError(null)
      const [year, month] = period.split('-').map(Number)

      try {
        const data = await getMonthlyStats(year, month, controller.signal)
        if (!controller.signal.aborted) setStats(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setStats(null)
          setError(error instanceof Error ? error.message : 'Monthly statistics could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadStats()
    return () => controller.abort()
  }, [period, reloadKey])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const [year, month] = periodInput.split('-').map(Number)
    if (!/^\d{4}-\d{2}$/.test(periodInput) || year < 1 || year > 9998 || month < 1 || month > 12 || periodInput > getCurrentMonth()) {
      setInputError('Choose the current month or a previous month.')
      return
    }
    setInputError(null)
    setPeriod(periodInput)
    setReloadKey((value) => value + 1)
  }

  return (
    <section>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <h1>Analyse</h1>
          <Typography color="text.secondary">Monthly income, expenses and cash flow.</Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            required
            type="month"
            label="Month"
            value={periodInput}
            onChange={(event) => {
              setPeriodInput(event.target.value)
              setInputError(null)
            }}
            error={Boolean(inputError)}
            helperText={inputError}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: '0001-01', max: getCurrentMonth() } }}
            size="small"
          />
          <Button type="submit" variant="contained" disabled={loading || !periodInput}>
            Show statistics
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} aria-hidden="true" />Loading monthly statistics…
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
            <Alert severity="info" sx={{ mb: 2 }}>No income or expenses in {stats.currency} for this period.</Alert>
          )}
          <MonthlyStatsSummary stats={stats} />
          <MonthlyStatsCharts stats={stats} />
          <Alert severity="info" sx={{ mt: 3 }}>
            Only recorded income and expenses in {stats.currency} are included.
            Other currencies, transfers and future transactions are excluded.
            Monthly statistics include records before your opening balance date.
          </Alert>
        </>
      )}
    </section>
  )
}
