import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import OpeningBalanceDialog from '../../components/balance/OpeningBalanceDialog'
import { getBalance, getOpeningBalance } from '../../services/balance'
import type { BalanceRead, OpeningBalanceRead } from '../../types/balance'

function formatAmount(amount: string, currency: string) {
  return `${Number(amount).toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`
}

export default function HomePage() {
  const [balance, setBalance] = useState<BalanceRead | null>(null)
  const [settings, setSettings] = useState<OpeningBalanceRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadBalance() {
      setLoading(true)
      setError(null)

      const [balanceResult, settingsResult] = await Promise.allSettled([
        getBalance(controller.signal),
        getOpeningBalance(controller.signal),
      ])

      if (controller.signal.aborted) return

      // Keep settings accessible even if calculating the balance fails.
      setSettings(
        settingsResult.status === 'fulfilled'
          ? settingsResult.value
          : balanceResult.status === 'fulfilled'
            ? balanceResult.value
            : null,
      )

      if (balanceResult.status === 'fulfilled') {
        setBalance(balanceResult.value)
      } else {
        setBalance(null)
        setError(
          balanceResult.reason instanceof Error
            ? balanceResult.reason.message
            : 'The balance could not be loaded.',
        )
      }

      setLoading(false)
    }

    void loadBalance()
    return () => controller.abort()
  }, [reloadKey])

  const configured = balance?.current_balance != null

  return (
    <section>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <h1>Overview</h1>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button color="inherit" disabled={loading} onClick={() => setReloadKey((value) => value + 1)}>
            Refresh
          </Button>
          <Button
            variant="contained"
            disabled={loading || !settings}
            onClick={() => {
              setSaved(false)
              setDialogOpen(true)
            }}
          >
            {settings?.opening_balance != null ? 'Edit opening balance' : 'Set opening balance'}
          </Button>
        </Box>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Track your balance from your chosen starting date.
      </Typography>

      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)} sx={{ mb: 2 }}>
          Opening balance saved. Your balance is recalculated from this starting point.
        </Alert>
      )}

      {loading && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} aria-hidden="true" />
          Loading balance…
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error} You can retry with Refresh. If your opening date is in the
          future, edit it to a date that is not in the future.
        </Alert>
      )}

      {!loading && balance && (
        <>
          {!configured && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Set your opening balance and date to see your calculated balance.
              An unconfigured balance is different from a zero balance.
            </Alert>
          )}
          {configured && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2, mb: 2 }}>
                {[
                  { label: 'Current balance', amount: balance.current_balance },
                  { label: 'Income since opening', amount: balance.total_income },
                  { label: 'Expenses since opening', amount: balance.total_expenses },
                ].map((item) => (
                  <Paper key={item.label} variant="outlined" sx={{ p: 3, minWidth: 0 }}>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>{item.label}</Typography>
                    <Typography variant="h5" component="p" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                      {item.amount == null ? '—' : formatAmount(item.amount, balance.currency)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Opening balance: {balance.opening_balance == null ? '—' : formatAmount(balance.opening_balance, balance.currency)}.
                {' '}Period: {balance.opening_date} to {balance.as_of}, inclusive.
              </Typography>
            </>
          )}
          <Alert severity="info">
            Calculated from recorded income and expenses in {balance.currency} only.
            Transactions in other currencies, transfers and future transactions
            are excluded. This is not a bank-synchronized balance.
          </Alert>
        </>
      )}

      {dialogOpen && settings && (
        <OpeningBalanceDialog
          settings={settings}
          onClose={() => setDialogOpen(false)}
          onSaved={() => {
            setDialogOpen(false)
            setSaved(true)
            setReloadKey((value) => value + 1)
          }}
        />
      )}
    </section>
  )
}
