import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import { generateTransactionDraft } from '../../services/transactions'
import type { TransactionDraft } from '../../types/transaction'

interface TransactionAiInputProps {
  onDraftReady: (draft: TransactionDraft) => void
  onBusyChange: (busy: boolean) => void
}

export default function TransactionAiInput({
  onDraftReady,
  onBusyChange,
}: TransactionAiInputProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
      controllerRef.current = null
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = query.trim()

    if (loading || text.length < 3) return

    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)
    onBusyChange(true)

    try {
      const draft = await generateTransactionDraft(
        text,
        controller.signal,
      )

      if (controller.signal.aborted) return

      const isEmpty = Object.values(draft).every(
        (value) => value === null,
      )

      if (isEmpty) {
        setError(
          'No transaction was recognized. Try a more specific description.',
        )
        return
      }

      onDraftReady(draft)
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : 'The transaction could not be analyzed.',
        )
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setLoading(false)
        onBusyChange(false)
      }
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'grid', gap: 3 }}
    >
      <TextField
        multiline
        minRows={4}
        fullWidth
        required
        label="Describe your transaction"
        placeholder="For example: I spent 24 EUR on dinner yesterday."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={loading}
        slotProps={{
          htmlInput: { maxLength: 2000 },
        }}
      />

      <Alert severity="info">
        AI will prepare a draft. Review and complete its details
        before saving.
      </Alert>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Alert severity="info" role="status">
          Analyzing your transaction. Waiting for the AI response…
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={loading || query.trim().length < 3}
      >
        {loading ? 'Analyzing…' : 'Preview transaction'}
      </Button>
    </Box>
  )
}