import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

import type { MonthlyStatsRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

export default function MonthlyStatsSummary({ stats }: { stats: MonthlyStatsRead }) {
  const items = [
    { label: 'Income', amount: stats.total_income, color: '#008a4b', description: 'Recorded income for this month.' },
    { label: 'Expenses', amount: stats.total_expenses, color: '#d32f2f', description: 'Recorded expenses; savings deposits are not expenses.' },
    { label: 'Monthly balance', amount: stats.net_cash_flow, color: '#171717', description: 'Income minus expenses, before savings.' },
    { label: 'Transferred to Savings (net)', amount: stats.net_savings, color: '#171717', description: 'Savings deposits minus withdrawals for this month.' },
    { label: 'Remaining budget', amount: stats.remaining_budget, color: Number(stats.remaining_budget) < 0 ? '#d32f2f' : '#171717', description: 'Monthly balance minus net transfers to Savings.' },
  ]

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: 2 }}>
        {items.map((item) => (
          <Paper key={item.label} variant="outlined" sx={{ p: 3, minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>{item.label}</Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700, color: item.color, overflowWrap: 'anywhere' }}>
              {formatMoney(item.amount, stats.currency)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {item.description}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Average daily expenses: {formatMoney(stats.average_daily_expenses, stats.currency)} over {stats.days_counted} calendar days, including days without expenses.
        {' '}Savings deposits: {formatMoney(stats.savings_deposits, stats.currency)}; withdrawals: {formatMoney(stats.savings_withdrawals, stats.currency)}.
      </Typography>
      {Number(stats.remaining_budget) < 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Your expenses and net Savings transfers exceed this month's income.
          This is a monthly budget deficit, not a bank overdraft. Recorded Savings deposits remain unchanged.
        </Alert>
      )}
    </Box>
  )
}
