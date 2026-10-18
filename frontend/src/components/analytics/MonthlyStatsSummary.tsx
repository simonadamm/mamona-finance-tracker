import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import type { MonthlyStatsRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

export default function MonthlyStatsSummary({ stats }: { stats: MonthlyStatsRead }) {
  const items = [
    { label: 'Income', amount: stats.total_income, color: '#008a4b' },
    { label: 'Expenses', amount: stats.total_expenses, color: '#d32f2f' },
    { label: 'Net cash flow', amount: stats.net_cash_flow, color: '#171717' },
    { label: 'Average daily expenses', amount: stats.average_daily_expenses, color: '#171717' },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
      {items.map((item) => (
        <Paper key={item.label} variant="outlined" sx={{ p: 3, minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>{item.label}</Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, color: item.color, overflowWrap: 'anywhere' }}>
            {formatMoney(item.amount, stats.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {item.label === 'Average daily expenses'
              ? `Based on ${stats.days_counted} calendar days, including days without expenses.`
              : item.label === 'Net cash flow'
                ? 'Income minus expenses; not your account balance or an allocation to savings.'
                : 'For the selected period.'}
          </Typography>
        </Paper>
      ))}
    </Box>
  )
}
