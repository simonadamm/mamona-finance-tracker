import { useState } from 'react'

import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

import TransactionAiInput from './TransactionAiInput'
import TransactionForm from './TransactionForm'
import type { CategoryRead } from '../../types/category'

interface AddTransactionDialogProps {
  categories: CategoryRead[]
  onClose: () => void
  onCreated: () => void
}

type InputMode = 'ai' | 'manual'

export default function AddTransactionDialog({
  categories,
  onClose,
  onCreated,
}: AddTransactionDialogProps) {
  const [mode, setMode] = useState<InputMode>('ai')
  const [saving, setSaving] = useState(false)

  function handleClose() {
    if (!saving) onClose()
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="add-transaction-title"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle id="add-transaction-title" sx={{ pr: 7, pb: 1 }}>
        Add transaction
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={handleClose}
        disabled={saving}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Describe your transaction or enter its details manually.
        </Typography>
        <Tabs
          value={mode}
          onChange={(_, value: InputMode) => setMode(value)}
          variant="fullWidth"
          aria-label="Transaction input method"
          sx={{
            mb: 3,
            p: 0.5,
            borderRadius: 2,
            backgroundColor: '#f1f5f9',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 48,
              borderRadius: 1.5,
              textTransform: 'none',
            },
            '& .MuiTab-root.Mui-selected': {
              backgroundColor: '#171717',
              color: '#ffffff',
            },
          }}
        >
          <Tab
            id="transaction-ai-tab"
            aria-controls="transaction-ai-panel"
            value="ai"
            label="AI Input"
            icon={<AutoAwesomeOutlinedIcon />}
            iconPosition="start"
            disabled={saving}
          />
          <Tab
            id="transaction-manual-tab"
            aria-controls="transaction-manual-panel"
            value="manual"
            label="Manual input"
            icon={<EditOutlinedIcon />}
            iconPosition="start"
            disabled={saving}
          />
        </Tabs>
        <Box
          role="tabpanel"
          id="transaction-ai-panel"
          aria-labelledby="transaction-ai-tab"
          hidden={mode !== 'ai'}
        >
          <TransactionAiInput />
        </Box>
        <Box
          role="tabpanel"
          id="transaction-manual-panel"
          aria-labelledby="transaction-manual-tab"
          hidden={mode !== 'manual'}
        >
          <TransactionForm
            categories={categories}
            onCreated={onCreated}
            onSavingChange={setSaving}
          />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
