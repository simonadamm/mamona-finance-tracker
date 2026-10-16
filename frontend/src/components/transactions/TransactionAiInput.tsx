import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

export default function TransactionAiInput() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TextField
        multiline
        minRows={4}
        fullWidth
        disabled
        label="Describe your transaction"
        placeholder="For example: I spent 24 EUR on dinner yesterday."
      />
      <Alert severity="info">
        AI input is not available yet. Use Manual input to add a transaction.
      </Alert>
      <Button variant="contained" disabled>
        Preview transaction
      </Button>
    </Box>
  )
}
