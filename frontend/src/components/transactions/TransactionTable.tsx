import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
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
    <TableContainer component={Paper} variant="outlined">
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

              <TableCell>
                {transaction.description || '—'}
              </TableCell>

              <TableCell>
                {categories.find(
                  (category) => category.id === transaction.category_id,
                )?.name ?? '—'}
              </TableCell>

              <TableCell>
                {transaction.merchant_name || '—'}
              </TableCell>

              <TableCell>
                {typeLabels[transaction.type]}
              </TableCell>

              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
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
