import { Link, useLocation } from 'react-router'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'

const menuItems = [
  { label: 'Overview', path: '/', icon: GridViewOutlinedIcon },
  { label: 'Transactions', path: '/transactions', icon: ReceiptLongOutlinedIcon },
  { label: 'Analysis', path: '/analyse', icon: BarChartOutlinedIcon },
  { label: 'Savings', path: '/savings', icon: SavingsOutlinedIcon },
  { label: 'Copilot', path: '/copilot', icon: AutoAwesomeOutlinedIcon },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="Mamona home">
        <span className="brand-mark"><NorthEastIcon sx={{ fontSize: 24 }} /></span>
        <span className="brand-name">mamona<span className="brand-dot">.</span></span>
      </Link>
      <p className="nav-caption">YOUR WORKSPACE</p>
      <nav aria-label="Main navigation">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className="nav-item" aria-current={pathname === path ? 'page' : undefined}>
            <Icon sx={{ fontSize: 21 }} /><span>{label}</span><ArrowForwardIcon className="nav-arrow" />
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-note">
          <AllInclusiveIcon sx={{ color: '#245bff', fontSize: 27 }} />
          <strong>Small steps. Bigger plans.</strong>
          <p>A little clarity for your everyday money.</p>
        </div>
        <div className="profile">
          <span className="profile-avatar">D</span>
          <div><strong>Demo workspace</strong><small>Personal budget tracker</small></div>
        </div>
      </div>
    </aside>
  )
}
