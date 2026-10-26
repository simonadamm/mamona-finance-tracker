import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import SouthWestIcon from '@mui/icons-material/SouthWest'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

import type { CategoryRead } from '../../types/category'

import type {
  TransactionRead,
  TransactionType,
} from '../../types/transaction'

interface TransactionTableProps {
  transactions: TransactionRead[]
  categories: CategoryRead[]
  onEdit: (transaction: TransactionRead) => void
  onDelete: (transaction: TransactionRead) => void
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}

export default function TransactionTable({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '24px' }}>
      <Table aria-label="Transactions list" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                {transaction.transaction_date}
              </TableCell>

              <TableCell sx={{ minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 36, height: 36, borderRadius: '12px', bgcolor: transaction.type === 'income' ? '#e8f7ee' : transaction.type === 'expense' ? '#fff0ef' : '#edf2ff', color: transaction.type === 'income' ? '#087f4f' : transaction.type === 'expense' ? '#d73543' : '#245bff' }}>
                    {transaction.type === 'income' ? <SouthWestIcon fontSize="small" /> : transaction.type === 'expense' ? <NorthEastIcon fontSize="small" /> : <SwapHorizIcon fontSize="small" />}
                  </Box>
                  <span style={{ fontWeight: 550 }}>{transaction.description || '—'}</span>
                </Box>
              </TableCell>

              <TableCell>
                <Chip variant="outlined" label={categories.find(
                  (category) => category.id === transaction.category_id,
                )?.name ?? '—'} sx={{ borderColor: '#e5e7e1', maxWidth: 220, color: '#686d62', bgcolor: '#fafbf8' }} />
              </TableCell>

              <TableCell>
                {transaction.merchant_name || '—'}
              </TableCell>

              <TableCell>
                <span style={{ fontSize: 11, color: '#73786c' }}>{typeLabels[transaction.type]}</span>
              </TableCell>

              <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 650, color: transaction.type === 'income' ? '#087f4f' : '#141414' }}>
                {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '−' : ''}
                {Number(transaction.amount).toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {transaction.currency}
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Edit transaction">
                  <IconButton
                    aria-label="Edit transaction"
                    onClick={() => onEdit(transaction)}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete transaction">
                  <IconButton
                    aria-label="Delete transaction"
                    onClick={() => onDelete(transaction)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
