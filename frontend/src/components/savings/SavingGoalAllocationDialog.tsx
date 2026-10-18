import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { assignSavingsToGoal, releaseSavingsFromGoal } from '../../services/savingGoals'
import type { SavingGoalRead } from '../../types/savingGoal'
import { formatMoney } from '../../utils/formatters'

interface Props {
  goal: SavingGoalRead
  mode: 'assign' | 'release'
  onClose: () => void
  onUpdated: (goal: SavingGoalRead) => void
}

export default function SavingGoalAllocationDialog({ goal, mode, onClose, onUpdated }: Props) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitting = useRef(false)
  const releasing = mode === 'release'

  function handleClose() {
    if (!submitting.current) onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    setError(null)
    const normalized = amount.trim().replace(',', '.')
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0) {
      setError('Enter a positive amount with up to 10 integer digits and 2 decimal places.')
      return
    }
    if (releasing && Number(normalized) > Number(goal.current_amount)) {
      setError('Cannot release more than the amount assigned to this goal.')
      return
    }
    submitting.current = true
    setSaving(true)
    let updated: SavingGoalRead
    try {
      const update = releasing ? releaseSavingsFromGoal : assignSavingsToGoal
      updated = await update(goal.id, { amount: normalized })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The allocation could not be updated.')
      return
    } finally {
      submitting.current = false
      setSaving(false)
    }
    onUpdated(updated)
  }

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose} aria-labelledby="goal-allocation-title">
      <DialogTitle id="goal-allocation-title">{releasing ? 'Release from goal' : 'Assign to goal'}</DialogTitle>
      <DialogContent>
        <Box component="form" id="goal-allocation-form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3, pt: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{goal.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Currently assigned: {formatMoney(goal.current_amount, goal.currency)}
            </Typography>
          </Box>
          <Alert severity="info">
            {releasing
              ? 'Return money from this goal to your unassigned Savings.'
              : 'Reserve money from your unassigned Savings for this goal. You can assign only as much as is available.'}
            {' '}Total Savings and your monthly budget stay the same.
          </Alert>
          <TextField required autoFocus label={`Amount (${goal.currency})`} value={amount}
            onChange={(event) => setAmount(event.target.value)} disabled={saving}
            helperText="For example: 50.00 or 50,00"
            slotProps={{ htmlInput: { inputMode: 'decimal' } }} />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button type="submit" form="goal-allocation-form" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : releasing ? 'Release money' : 'Assign money'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
