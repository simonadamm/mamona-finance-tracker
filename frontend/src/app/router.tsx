import { BrowserRouter, Route, Routes } from 'react-router'

import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage'
import NotFoundPage from './pages/NotFoundPage'

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

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}