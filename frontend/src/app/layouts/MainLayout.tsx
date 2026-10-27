import { Outlet, useLocation } from 'react-router'
import Sidebar from '../../components/layout/Sidebar'

const pageNames: Record<string, string> = {
  '/': 'Overview', '/transactions': 'Transactions', '/analyse': 'Analysis', '/savings': 'Savings', '/copilot': 'Financial Copilot',
}

export default function MainLayout() {
  const { pathname } = useLocation()
  const title = pageNames[pathname] ?? 'Page not found'
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  }).format(new Date())
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar />
      <div className="workspace">
        <header className="workspace-header">
          <div className="breadcrumb"><span>My workspace</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
          <div className="workspace-meta"><span className="workspace-date">{date}</span><span className="demo-pill">Demo mode</span></div>
        </header>
        <main className="app-content" id="main-content" tabIndex={-1}>
          <Outlet />
          <footer className="workspace-footer"><span>mamona. A little clarity goes a long way.</span><span>Personal finances, in perspective.</span></footer>
        </main>
      </div>
    </div>
  )
}
