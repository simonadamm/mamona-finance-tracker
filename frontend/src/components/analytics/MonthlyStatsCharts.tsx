import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import type { MonthlyStatsRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

export default function MonthlyStatsCharts({ stats }: { stats: MonthlyStatsRead }) {
  const income = Number(stats.total_income)
  const expenses = Number(stats.total_expenses)
  const maximum = Math.max(income, expenses) || 1
  const totalExpenses = expenses || 1

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 3, minWidth: 0 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>Income vs. expenses</Typography>
        {[
          { label: 'Income', amount: stats.total_income, color: '#008a4b' },
          { label: 'Expenses', amount: stats.total_expenses, color: '#d32f2f' },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1 }}>
              <Typography>{item.label}</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatMoney(item.amount, stats.currency)}</Typography>
            </Box>
            <Box aria-hidden="true" sx={{ height: 16, borderRadius: 2, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
              <Box sx={{ width: `${Number(item.amount) / maximum * 100}%`, height: '100%', backgroundColor: item.color }} />
            </Box>
          </Box>
        ))}
        <Typography variant="body2" color="text.secondary">
          Both bars use the same scale for the selected period.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, minWidth: 0 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>Spending by category</Typography>
        {stats.expenses_by_category.length === 0 ? (
          <Typography color="text.secondary">No expenses in {stats.currency} for this period.</Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {stats.expenses_by_category.map((category) => (
              <Box component="li" key={category.category_id} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Typography>{category.category_name}</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatMoney(category.amount, stats.currency)}</Typography>
                </Box>
                <Box aria-hidden="true" sx={{ height: 8, borderRadius: 2, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <Box sx={{ width: `${Math.min(Number(category.amount) / totalExpenses * 100, 100)}%`, height: '100%', backgroundColor: '#171717' }} />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
