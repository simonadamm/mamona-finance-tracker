import { useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

import { updateOpeningBalance } from '../../services/balance'
import type { OpeningBalanceRead } from '../../types/balance'

interface OpeningBalanceDialogProps {
  settings: OpeningBalanceRead
  onClose: () => void
  onSaved: () => void
}

function getToday() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) => parts.find((value) => value.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export default function OpeningBalanceDialog({
  settings,
  onClose,
  onSaved,
}: OpeningBalanceDialogProps) {
  const [amount, setAmount] = useState(settings.opening_balance ?? '')
  const [date, setDate] = useState(settings.opening_date ?? getToday())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (!saving) onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)
    const normalizedAmount = amount.trim().replace(',', '.')

    if (!/^[+-]?\d{1,10}(\.\d{1,2})?$/.test(normalizedAmount)) {
      setError('Enter an amount with up to 10 integer digits and 2 decimal places.')
      return
    }

    if (!date || date > getToday()) {
      setError('Choose an opening date that is not in the future.')
      return
    }

    setSaving(true)
    try {
      await updateOpeningBalance({
        opening_balance: normalizedAmount,
        opening_date: date,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The opening balance could not be saved.')
      return
    } finally {
      setSaving(false)
    }
    onSaved()
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="opening-balance-title"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle id="opening-balance-title">Opening balance</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="opening-balance-form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 3, pt: 1 }}
        >
          <Alert severity="info">
            Enter the balance at the start of the selected day. Income and
            expenses from that day onward will be included. Saving replaces
            this starting point; it does not create a transaction.
          </Alert>
          <TextField
            required
            label={`Opening balance (${settings.currency})`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={saving}
            helperText="Zero and negative balances are allowed."
            slotProps={{ htmlInput: { inputMode: 'text' } }}
          />
          <TextField
            required
            label="Opening date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={saving}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: '0001-01-01', max: getToday() },
            }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button
          type="submit"
          form="opening-balance-form"
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save opening balance'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
