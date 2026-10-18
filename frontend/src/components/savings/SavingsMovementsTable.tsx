import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'

import type { SavingsMovementPage } from '../../types/savings'
import { formatMoney } from '../../utils/formatters'

interface SavingsMovementsTableProps {
  data: SavingsMovementPage | null
  loading: boolean
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

export default function SavingsMovementsTable({
  data, loading, page, rowsPerPage, onPageChange, onRowsPerPageChange,
}: SavingsMovementsTableProps) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table aria-label="Savings movement history" sx={{ minWidth: 450 }}>
          {data && <caption>Recorded movements in {data.currency} through {data.as_of}. Newest first.</caption>}
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}><span role="status">Loading Savings history…</span></TableCell></TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow><TableCell colSpan={3}>No Savings movements recorded.</TableCell></TableRow>
            ) : data.items.map((movement) => (
              <TableRow key={movement.id} hover>
                <TableCell>{movement.movement_date}</TableCell>
                <TableCell>{movement.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap', color: movement.type === 'deposit' ? '#008a4b' : '#d32f2f' }}>
                  {movement.type === 'deposit' ? '+' : '−'}{formatMoney(movement.amount, movement.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data?.total ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        disabled={loading}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
      />
    </Paper>
  )
}
