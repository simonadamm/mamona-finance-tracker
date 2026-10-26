import { useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import NorthEastIcon from '@mui/icons-material/NorthEast'

import { createSavingsDeposit } from '../../services/savings'
import type { MonthlyStatsRead } from '../../types/analytics'
import type { SavingsMovementRead } from '../../types/savings'

interface SavingsDepositPanelProps {
  stats: MonthlyStatsRead
  onDeposited: (movement: SavingsMovementRead) => void
}

function SavingsDepositDialog({ stats, onClose, onDeposited }: SavingsDepositPanelProps & { onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(stats.period_end)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedAmount = amount.trim().replace(',', '.')
  const exceedsBudget = Number(normalizedAmount) > 0 && Number(normalizedAmount) > Number(stats.remaining_budget)

  function handleClose() {
    if (!saving) onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null)

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalizedAmount) || Number(normalizedAmount) <= 0) {
      setError('Enter a positive amount with up to 10 integer digits and 2 decimal places.')
      return
    }
    if (!date || date < stats.period_start || date > stats.period_end) {
      setError(`Choose a date between ${stats.period_start} and ${stats.period_end}.`)
      return
    }

    setSaving(true)
    let movement: SavingsMovementRead
    try {
      movement = await createSavingsDeposit({
        amount: normalizedAmount,
        movement_date: date,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The savings deposit could not be recorded.')
      return
    } finally {
      setSaving(false)
    }
    onDeposited(movement)
  }

  return (
    <Dialog
      open fullWidth maxWidth="sm" onClose={handleClose}
      aria-labelledby="savings-deposit-title"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle id="savings-deposit-title">Add to Savings</DialogTitle>
      <DialogContent>
        <Box component="form" id="savings-deposit-form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3, pt: 1 }}>
          <Alert severity="info">
            Record money set aside in {stats.currency}. This reduces the remaining
            budget for the selected month, without creating an expense.
            Each submission records a new deposit.
          </Alert>
          <TextField
            required label={`Amount (${stats.currency})`} value={amount}
            onChange={(event) => setAmount(event.target.value)} disabled={saving}
            helperText="For example: 200.00 or 200,00"
            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          />
          <TextField
            required type="date" label="Deposit date" value={date}
            onChange={(event) => setDate(event.target.value)} disabled={saving}
            helperText={`Selected period: ${stats.period_start} to ${stats.period_end}.`}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: stats.period_start, max: stats.period_end } }}
          />
          {exceedsBudget && (
            <Alert severity="warning">
              This deposit exceeds the remaining monthly budget and can leave it
              negative. You can still record the deposit.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button type="submit" form="savings-deposit-form" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : 'Record deposit'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function SavingsDepositPanel({ stats, onDeposited }: SavingsDepositPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: '24px', backgroundColor: '#edf2ff', borderColor: '#e0e8fc' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" component="h2">Set money aside</Typography>
          <Typography variant="body2" color="text.secondary">
            A little today, a step towards tomorrow. Set aside money from this month's budget.
          </Typography>
        </Box>
        <Button variant="contained" endIcon={<NorthEastIcon />} onClick={() => setOpen(true)}>Add to Savings</Button>
      </Box>
      {open && (
        <SavingsDepositDialog
          stats={stats} onClose={() => setOpen(false)}
          onDeposited={(movement) => {
            setOpen(false)
            onDeposited(movement)
          }}
        />
      )}
    </Paper>
  )
}
