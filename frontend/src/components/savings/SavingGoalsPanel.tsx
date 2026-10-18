import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { getSavingGoals } from '../../services/savingGoals'
import type { SavingGoalRead } from '../../types/savingGoal'
import { formatMoney } from '../../utils/formatters'
import SavingGoalDialog from './SavingGoalDialog'
import SavingGoalAllocationDialog from './SavingGoalAllocationDialog'

interface Props {
  currency?: string
  refreshKey: number
  onAllocationChanged: () => void
}

export default function SavingGoalsPanel({ currency, refreshKey, onAllocationChanged }: Props) {
  const [goals, setGoals] = useState<SavingGoalRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [allocation, setAllocation] = useState<{ goal: SavingGoalRead; mode: 'assign' | 'release' } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getSavingGoals(controller.signal)
        if (!controller.signal.aborted) setGoals(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : 'Savings goals could not be loaded.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [refreshKey, reloadKey])

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography component="h2" variant="h6">Savings goals</Typography>
          <Typography variant="body2" color="text.secondary">Set a target amount and date for what matters to you.</Typography>
        </Box>
        <Button variant="contained" onClick={() => { setSuccess(null); setOpen(true) }}>Add goal</Button>
      </Box>
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} aria-hidden="true" />Loading goals…
        </Box>
      ) : error ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => setReloadKey((value) => value + 1)}>Retry</Button>}>{error}</Alert>
      ) : goals.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography>No savings goals yet. Add your first goal, such as a holiday or an emergency fund.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          {goals.map((goal) => {
            const progress = Math.max(0, Math.min(100, Number(goal.current_amount) / Number(goal.target_amount) * 100))
            return (
              <Paper key={goal.id} variant="outlined" sx={{ p: 3, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1, mb: 1 }}>
                  <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{goal.name}</Typography>
                  <Chip size="small" label={goal.status} color={goal.status === 'completed' ? 'success' : 'default'} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Target date: {goal.target_date}</Typography>
                <Typography variant="h5">{formatMoney(goal.current_amount, goal.currency)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>of {formatMoney(goal.target_amount, goal.currency)}</Typography>
                <LinearProgress variant="determinate" value={progress} aria-label={`Progress for ${goal.name}`} color="success" sx={{ height: 6, borderRadius: 1, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">{progress.toFixed(1)}% of target</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  <Button variant="contained" disabled={goal.status === 'cancelled'}
                    aria-label={`Assign money to ${goal.name}`}
                    onClick={() => { setSuccess(null); setAllocation({ goal, mode: 'assign' }) }}>
                    Assign money
                  </Button>
                  <Button variant="outlined" color="inherit" disabled={Number(goal.current_amount) <= 0}
                    aria-label={`Release money from ${goal.name}`}
                    onClick={() => { setSuccess(null); setAllocation({ goal, mode: 'release' }) }}>
                    Release money
                  </Button>
                </Box>
              </Paper>
            )
          })}
        </Box>
      )}
      {open && <SavingGoalDialog currency={currency} onClose={() => setOpen(false)} onCreated={(goal) => {
        setOpen(false)
        setSuccess(`Goal “${goal.name}” created. No money has been assigned yet.`)
        setReloadKey((value) => value + 1)
      }} />}
      {allocation && <SavingGoalAllocationDialog goal={allocation.goal} mode={allocation.mode}
        onClose={() => setAllocation(null)} onUpdated={(goal) => {
          const releasing = allocation.mode === 'release'
          setAllocation(null)
          setSuccess(`${releasing ? 'Released money from' : 'Assigned money to'} “${goal.name}”. Total Savings is unchanged.`)
          setReloadKey((value) => value + 1)
          onAllocationChanged()
        }} />}
    </Box>
  )
}
