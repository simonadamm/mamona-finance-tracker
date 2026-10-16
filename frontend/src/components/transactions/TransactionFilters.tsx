import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { CategoryRead } from '../../types/category'

interface TransactionFiltersProps {
  year: string
  month: string
  categoryId: string
  categories: CategoryRead[]
  onYearChange: (value: string) => void
  onMonthChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

const currentYear = new Date().getFullYear()

const years = Array.from(
  { length: 7 },
  (_, index) => currentYear + 1 - index,
)

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function TransactionFilters({
  year,
  month,
  categoryId,
  categories,
  onYearChange,
  onMonthChange,
  onCategoryChange,
}: TransactionFiltersProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        select
        id="transaction-year"
        label="Year"
        value={year}
        onChange={(event) => onYearChange(event.target.value)}
        size="small"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">No year filter</MenuItem>

        {years.map((value) => (
          <MenuItem key={value} value={String(value)}>
            {value}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        id="transaction-month"
        label="Month"
        value={month}
        onChange={(event) => onMonthChange(event.target.value)}
        disabled={!year}
        helperText={!year ? 'Select a year first' : undefined}
        size="small"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">All months</MenuItem>

        {months.map((label, index) => (
          <MenuItem key={label} value={String(index + 1)}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        id="transaction-category"
        label="Category"
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        disabled={!year || categories.length === 0}
        helperText={!year ? 'Select a year first' : undefined}
        size="small"
        sx={{ minWidth: 240 }}
      >
        <MenuItem value="">All categories</MenuItem>

        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
