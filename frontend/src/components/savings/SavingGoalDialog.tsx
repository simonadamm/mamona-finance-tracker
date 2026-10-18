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

import { createSavingGoal } from '../../services/savingGoals'
import type { SavingGoalRead } from '../../types/savingGoal'

interface Props {
  currency?: string
  onClose: () => void
  onCreated: (goal: SavingGoalRead) => void
}

export default function SavingGoalDialog({ currency, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
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
    if (!name.trim()) {
      setError('Enter a goal name.')
      return
    }
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalizedAmount) || Number(normalizedAmount) <= 0) {
      setError('Enter a positive amount with up to 10 integer digits and 2 decimal places.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Choose a target date.')
      return
    }
    setSaving(true)
    let goal: SavingGoalRead
    try {
      goal = await createSavingGoal({ name: name.trim(), target_amount: normalizedAmount, target_date: date })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The goal could not be created.')
      return
    } finally {
      setSaving(false)
    }
    onCreated(goal)
  }

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose} aria-labelledby="saving-goal-title">
      <DialogTitle id="saving-goal-title">Add a savings goal</DialogTitle>
      <DialogContent>
        <Box component="form" id="saving-goal-form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3, pt: 1 }}>
          <Alert severity="info">
            A new goal starts at zero. Creating it does not move money or change your monthly budget.
            The goal uses your profile currency{currency ? ` (${currency})` : ''}.
          </Alert>
          <TextField required label="Goal name" value={name} disabled={saving}
            onChange={(event) => setName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 255 } }} autoFocus />
          <TextField required label={currency ? `Target amount (${currency})` : 'Target amount'}
            value={amount} disabled={saving} onChange={(event) => setAmount(event.target.value)}
            helperText="For example: 3000.00 or 3000,00"
            slotProps={{ htmlInput: { inputMode: 'decimal' } }} />
          <TextField required type="date" label="Target date" value={date} disabled={saving}
            onChange={(event) => setDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: '9999-12-31' } }} />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" type="submit" form="saving-goal-form" disabled={saving}>
          {saving ? 'Saving…' : 'Create goal'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
