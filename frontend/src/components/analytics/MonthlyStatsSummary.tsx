import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import SouthWestIcon from '@mui/icons-material/SouthWest'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'

import type { MonthlyStatsRead } from '../../types/analytics'
import { formatMoney } from '../../utils/formatters'

export default function MonthlyStatsSummary({ stats }: { stats: MonthlyStatsRead }) {
  const deficit = Number(stats.remaining_budget) < 0
  const items = [
    { label: 'Income', amount: stats.total_income, color: '#087f4f', tint: '#e8f7ee', icon: SouthWestIcon, description: 'Money coming in this month.' },
    { label: 'Expenses', amount: stats.total_expenses, color: '#d73543', tint: '#fff0ef', icon: NorthEastIcon, description: 'Spending, excluding Savings deposits.' },
    { label: 'Monthly balance', amount: stats.net_cash_flow, color: '#245bff', tint: '#edf2ff', icon: SwapVertIcon, description: 'Income minus expenses, before Savings.' },
    { label: 'To Savings · net', amount: stats.net_savings, color: '#141414', tint: '#f2f3ee', icon: SavingsOutlinedIcon, description: 'Deposits minus withdrawals this month.' },
  ]

  return (
    <Box sx={{ mb: 3 }}>
      <div className="metric-grid">
        <div className="balance-hero">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <span className="eyebrow" style={{ margin: 0 }}>YOUR MONTHLY BUDGET</span>
              <AccountBalanceWalletOutlinedIcon sx={{ color: '#c9fc77', fontSize: 24 }} />
            </div>
            <h2>Remaining after Savings</h2>
            <p className="balance-value" style={{ color: deficit ? '#ff9298' : '#ffffff' }}>
              {formatMoney(stats.remaining_budget, '').trim()}<small>{stats.currency}</small>
            </p>
          </div>
          <div className="hero-bottom">
            <span className="hero-pill" style={deficit ? { background: '#ffd4d6', color: '#841d2d' } : undefined}>
              {deficit ? 'Monthly deficit' : 'After Savings'}
            </span>
            <span>Through {stats.period_end}</span>
          </div>
        </div>
        {items.map(({ icon: Icon, ...item }) => (
          <div key={item.label} className="metric-card">
            <span className="metric-icon" style={{ color: item.color, background: item.tint }}><Icon sx={{ fontSize: 19 }} /></span>
            <p className="metric-label">{item.label}</p>
            <p className="metric-amount" style={{ color: item.label === 'Income' || item.label === 'Expenses' ? item.color : undefined }}>
              {formatMoney(item.amount, stats.currency)}
            </p>
            <p className="metric-description">{item.description}</p>
          </div>
        ))}
      </div>
      <Typography variant="body2" color="text.secondary" className="page-content-note">
        Daily average: {formatMoney(stats.average_daily_expenses, stats.currency)} over {stats.days_counted} calendar days.
        {' '}Savings deposits: {formatMoney(stats.savings_deposits, stats.currency)} · Withdrawals: {formatMoney(stats.savings_withdrawals, stats.currency)}.
      </Typography>
      {deficit && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Your expenses and net Savings transfers exceed this month's income.
          This is a monthly budget deficit, not a bank overdraft. Recorded Savings deposits remain unchanged.
        </Alert>
      )}
    </Box>
  )
}
