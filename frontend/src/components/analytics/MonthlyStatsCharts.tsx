import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import type { MonthlyStatsRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

const categoryColors = ['#161716', '#245bff', '#0ba66b', '#fa6959', '#a0c966', '#8b72d8']

export default function MonthlyStatsCharts({ stats }: { stats: MonthlyStatsRead }) {
  const maximum = Math.max(Number(stats.total_income), Number(stats.total_expenses)) || 1
  const total = stats.expenses_by_category.reduce((sum, category) => sum + Number(category.amount), 0)
  let boundary = 0
  const segments = stats.expenses_by_category.map((category, index) => {
    const start = boundary
    boundary += total ? Number(category.amount) / total * 100 : 0
    return `${categoryColors[index % categoryColors.length]} ${start}% ${boundary}%`
  })
  const ring = total > 0 ? `conic-gradient(${segments.join(', ')})` : '#eeefeb'

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.15fr' }, gap: 2.5 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, minWidth: 0, borderRadius: '24px' }}>
        <div className="tile-heading">
          <div><p className="section-kicker" style={{ margin: '0 0 8px' }}>MONEY IN, MONEY OUT</p><Typography variant="h6" component="h2">Your monthly flow</Typography></div>
          <NorthEastIcon sx={{ fontSize: 20, color: '#8d9385' }} />
        </div>
        {[
          { label: 'Income', amount: stats.total_income, color: '#0ba66b' },
          { label: 'Expenses', amount: stats.total_expenses, color: '#fa6959' },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatMoney(item.amount, stats.currency)}</Typography>
            </Box>
            <Box aria-hidden="true" sx={{ height: 24, borderRadius: 99, backgroundColor: '#f2f3ef', overflow: 'hidden' }}>
              <Box sx={{ width: `${Number(item.amount) / maximum * 100}%`, height: '100%', backgroundColor: item.color, borderRadius: 99 }} />
            </Box>
          </Box>
        ))}
        <Typography variant="body2" color="text.secondary" className="page-content-note">A shared scale for income and expenses in this period.</Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, minWidth: 0, borderRadius: '24px' }}>
        <div className="tile-heading">
          <div><p className="section-kicker" style={{ margin: '0 0 8px' }}>A CLOSER LOOK</p><Typography variant="h6" component="h2">Where it goes</Typography></div>
          <DonutLargeOutlinedIcon sx={{ fontSize: 20, color: '#8d9385' }} />
        </div>
        {stats.expenses_by_category.length === 0 ? (
          <Typography color="text.secondary">No expenses in {stats.currency} for this period.</Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box role="img" aria-label={`Spending by category. Total expenses ${formatMoney(stats.total_expenses, stats.currency)}. Breakdown listed alongside.`}
              sx={{ width: 164, height: 164, flexShrink: 0, borderRadius: '50%', background: ring, display: 'grid', placeItems: 'center', mx: 'auto' }}>
              <Box sx={{ width: 124, height: 124, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 1.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 650, letterSpacing: '-0.04em', overflowWrap: 'anywhere', maxWidth: '100%' }}>{formatMoney(stats.total_expenses, stats.currency)}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5 }}>Total expenses</Typography>
              </Box>
            </Box>
            <Box component="ul" sx={{ flex: '1 1 190px', listStyle: 'none', m: 0, p: 0, minWidth: 0 }}>
              {stats.expenses_by_category.map((category, index) => (
                <Box component="li" key={category.category_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 1, borderBottom: '1px solid #f2f2ef' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, bgcolor: categoryColors[index % categoryColors.length] }} />
                    <Typography sx={{ fontSize: 12, overflowWrap: 'anywhere' }}>{category.category_name}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{formatMoney(category.amount, stats.currency)}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
