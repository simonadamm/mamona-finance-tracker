import { Outlet } from 'react-router'
import Sidebar from '../../components/layout/Sidebar'

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-content" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}