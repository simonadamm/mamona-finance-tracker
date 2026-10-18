import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import type { SavingsSummaryRead } from '../../types/savings'
import { formatMoney } from '../../utils/formatters'

export default function SavingsSummary({ summary }: { summary: SavingsSummaryRead }) {
  const items = [
    { label: 'Total Savings', value: summary.total_savings, description: 'All recorded deposits minus withdrawals.', color: Number(summary.total_savings) < 0 ? '#d32f2f' : '#008a4b' },
    { label: 'Assigned to goals', value: summary.assigned_savings, description: 'Part of your total Savings reserved for goals.', color: '#171717' },
    { label: 'Available Savings', value: summary.available_savings, description: 'Total Savings minus money assigned to goals.', color: Number(summary.available_savings) < 0 ? '#d32f2f' : '#171717' },
  ]

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2, mb: 2 }}>
      {items.map((item) => (
        <Paper key={item.label} variant="outlined" sx={{ p: 3, minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>{item.label}</Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, color: item.color, overflowWrap: 'anywhere' }}>
            {formatMoney(item.value, summary.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{item.description}</Typography>
        </Paper>
      ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Total deposits: {formatMoney(summary.total_deposits, summary.currency)}
        {' · '}Total withdrawals: {formatMoney(summary.total_withdrawals, summary.currency)}
      </Typography>
      {Number(summary.available_savings) < 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          More money is assigned to goals than your current total Savings.
          Release money from goals or record a deposit to cover the difference.
        </Alert>
      )}
    </Box>
  )
}
