import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { getMonthlyHistory } from '../../services/analytics'
import type { MonthlyHistoryPoint, MonthlyHistoryRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

function monthKey(point: MonthlyHistoryPoint): string {
  return `${point.year}-${String(point.month).padStart(2, '0')}`
}

function monthLabel(point: MonthlyHistoryPoint): string {
  const date = new Date(`${monthKey(point)}-01T00:00:00Z`)
  return new Intl.DateTimeFormat('en', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date)
}

export default function MonthlyHistoryChart({ refreshKey }: { refreshKey: number }) {
  const [months, setMonths] = useState(12)
  const [history, setHistory] = useState<MonthlyHistoryRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadHistory() {
      setLoading(true)
      setError(null)

      try {
        const data = await getMonthlyHistory(months, controller.signal)
        if (!controller.signal.aborted) setHistory(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setHistory(null)
          setError(error instanceof Error ? error.message : 'Monthly history could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadHistory()
    return () => controller.abort()
  }, [months, refreshKey, retryKey])

  const points = history?.points ?? []
  const selected = points.find((point) => monthKey(point) === selectedKey) ?? points.at(-1)
  const maximum = Math.max(0, ...points.flatMap((point) => [
    Number(point.total_income), Number(point.total_expenses),
  ])) || 1
  const hasActivity = points.some((point) => Number(point.total_income) > 0 || Number(point.total_expenses) > 0)

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" component="h2">Monthly history</Typography>
          <Typography variant="body2" color="text.secondary">Compare recorded income and expenses over time.</Typography>
        </Box>
        <TextField
          select
          id="history-range"
          label="History range"
          size="small"
          value={months}
          onChange={(event) => setMonths(Number(event.target.value))}
          sx={{ minWidth: 190 }}
        >
          <MenuItem value={6}>6 months</MenuItem>
          <MenuItem value={12}>1 year · 12 months</MenuItem>
          <MenuItem value={24}>2 years · 24 months</MenuItem>
          <MenuItem value={60}>5 years · 60 months</MenuItem>
        </TextField>
      </Box>

      {loading && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 3 }}>
          <CircularProgress size={24} aria-hidden="true" />Loading monthly history…
        </Box>
      )}
      {!loading && error && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => setRetryKey((value) => value + 1)}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {!loading && !error && history && (
        <>
          {points.length === 0 ? (
            <Alert severity="info">No monthly history is available for this range.</Alert>
          ) : (
            <>
              {!hasActivity && (
                <Alert severity="info" sx={{ mb: 2 }}>No income or expenses in {history.currency} recorded for this range.</Alert>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#008a4b' }}>● Income</Typography>
                <Typography variant="body2" sx={{ color: '#d32f2f' }}>● Expenses</Typography>
                <Typography variant="body2" color="text.secondary">Shared scale, up to {formatMoney(String(maximum), history.currency)}</Typography>
              </Box>

              <Box
                role="group"
                aria-label="Monthly income and expenses. Select a month to view its values."
                tabIndex={0}
                sx={{ overflowX: 'auto', pb: 1, '&:focus-visible': { outline: '2px solid #171717', outlineOffset: 2 } }}
              >
                <Box sx={{ display: 'flex', height: 250, minWidth: points.length * 72 }}>
                  {points.map((point) => {
                    const key = monthKey(point)
                    const active = selected != null && monthKey(selected) === key
                    return (
                      <Box
                        component="button"
                        type="button"
                        key={key}
                        aria-pressed={active}
                        aria-label={`${monthLabel(point)}${point.is_current_month ? ', in progress' : ''}. Income ${formatMoney(point.total_income, history.currency)}; expenses ${formatMoney(point.total_expenses, history.currency)}; net cash flow ${formatMoney(point.net_cash_flow, history.currency)}.`}
                        onClick={() => setSelectedKey(key)}
                        onMouseEnter={() => setSelectedKey(key)}
                        onFocus={() => setSelectedKey(key)}
                        sx={{
                          flex: '1 0 72px', minWidth: 72, p: 0.75, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', background: active ? '#f1f5f9' : 'transparent',
                          color: 'inherit', font: 'inherit', border: 0, borderBottom: '2px solid',
                          borderBottomColor: active ? '#171717' : 'transparent', borderRadius: 1,
                          '&:focus-visible': { outline: '2px solid #171717', outlineOffset: -2 },
                        }}
                      >
                        <Box aria-hidden="true" sx={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.5, borderBottom: '1px solid #cbd5e1' }}>
                          <Box sx={{ width: 18, height: `${Number(point.total_income) / maximum * 100}%`, backgroundColor: '#008a4b', borderRadius: '3px 3px 0 0', opacity: point.is_current_month ? 0.65 : 1 }} />
                          <Box sx={{ width: 18, height: `${Number(point.total_expenses) / maximum * 100}%`, backgroundColor: '#d32f2f', borderRadius: '3px 3px 0 0', opacity: point.is_current_month ? 0.65 : 1 }} />
                        </Box>
                        <Typography variant="caption" component="span" sx={{ height: 38, pt: 0.75, lineHeight: 1.3 }}>
                          {monthLabel(point)}{point.is_current_month ? ' *' : ''}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {selected && (
                <Box aria-live="polite" sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    {monthLabel(selected)}{selected.is_current_month ? ` · In progress, through ${history.as_of}` : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Typography variant="body2">Income: {formatMoney(selected.total_income, history.currency)}</Typography>
                    <Typography variant="body2">Expenses: {formatMoney(selected.total_expenses, history.currency)}</Typography>
                    <Typography variant="body2">Net cash flow: {formatMoney(selected.net_cash_flow, history.currency)}</Typography>
                  </Box>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Hover over, focus or select a month to inspect it. Scroll horizontally for longer ranges.
                {' '}* The current month is still in progress; its bars show a partial month.
                Months without recorded activity are shown as zero.
              </Typography>
            </>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Only {history.currency} income and expenses through {history.as_of} are included.
            Transfers, other currencies and future transactions are excluded.
            Monthly balances are not carried forward as income.
          </Typography>
        </>
      )}
    </Paper>
  )
}
