import { BrowserRouter, Route, Routes } from 'react-router'
import { lazy, Suspense } from 'react'

import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage'
import NotFoundPage from './pages/NotFoundPage'
import AnalysePage from './pages/AnalysePage'
import SavingsPage from './pages/SavingsPage'

const FinancialCopilotPage = lazy(() => import('./pages/FinancialCopilotPage'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          <Route index element={<HomePage />} />

          <Route
            path="transactions"
            element={<TransactionsPage />}
          />

          <Route path="analyse" element={<AnalysePage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="copilot" element={<Suspense fallback={<p role="status">Loading Financial Copilot…</p>}><FinancialCopilotPage /></Suspense>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
