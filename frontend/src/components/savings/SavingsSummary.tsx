import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import type { SavingsSummaryRead } from '../../types/savings'
import { formatMoney } from '../../utils/formatters'

export default function SavingsSummary({ summary }: { summary: SavingsSummaryRead }) {
  const negative = Number(summary.available_savings) < 0
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <div className="balance-hero" style={{ minHeight: 230 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <span className="eyebrow" style={{ margin: 0 }}>THE BIGGER PICTURE</span>
              <SavingsOutlinedIcon sx={{ color: '#c9fc77', fontSize: 24 }} />
            </div>
            <h2>Total Savings</h2>
            <p className="balance-value" style={{ color: Number(summary.total_savings) < 0 ? '#ff9298' : '#fff' }}>
              {formatMoney(summary.total_savings, '').trim()}<small>{summary.currency}</small>
            </p>
          </div>
          <div className="hero-bottom"><span className="hero-pill">Across all months</span><span>Deposits − withdrawals</span></div>
        </div>
        <div className="metric-card">
          <span className="metric-icon" style={{ background: '#edf2ff', color: '#245bff' }}><FlagOutlinedIcon sx={{ fontSize: 20 }} /></span>
          <p className="metric-label">Assigned to goals</p>
          <p className="metric-amount">{formatMoney(summary.assigned_savings, summary.currency)}</p>
          <p className="metric-description">Reserved for the things you're working towards.</p>
        </div>
        <div className="metric-card" style={{ background: '#f0f5e8', borderColor: '#e3ead8' }}>
          <span className="metric-icon" style={{ background: '#d8edbc', color: '#34581d' }}><NorthEastIcon sx={{ fontSize: 20 }} /></span>
          <p className="metric-label">Available Savings</p>
          <p className="metric-amount" style={{ color: negative ? '#d73543' : '#274219' }}>{formatMoney(summary.available_savings, summary.currency)}</p>
          <p className="metric-description">Ready to assign to your next goal.</p>
        </div>
      </Box>
      <Typography variant="body2" color="text.secondary" className="page-content-note">
        Total deposits: {formatMoney(summary.total_deposits, summary.currency)}
        {' · '}Total withdrawals: {formatMoney(summary.total_withdrawals, summary.currency)}
      </Typography>
      {negative && <Alert severity="warning" sx={{ mt: 2 }}>
        More money is assigned to goals than your current total Savings.
        Release money from goals or record a deposit to cover the difference.
      </Alert>}
    </Box>
  )
}
