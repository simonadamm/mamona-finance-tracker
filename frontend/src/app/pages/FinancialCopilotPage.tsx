import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import PieChartOutlineIcon from '@mui/icons-material/DonutLargeOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import LanguageIcon from '@mui/icons-material/Language'
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff'
import PageHeader from '../../components/layout/PageHeader'
import CopilotAnswer from '../../components/copilot/CopilotAnswer'
import CopilotPending from '../../components/copilot/CopilotPending'
import { askFinancialCopilot } from '../../services/copilot'
import type { CopilotMessage } from '../../types/copilot'
import { getCurrentMonth } from '../../utils/formatters'

function starterQuestions() {
  const month = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${getCurrentMonth()}-01T00:00:00Z`))
  return [
    { title: 'Understand my month', description: 'Income, spending and what is left.', query: `Summarize my income, expenses and remaining budget for ${month}.`, icon: PieChartOutlineIcon, color: 'blue' },
    { title: 'Look at the details', description: 'Take a closer look at recent spending.', query: `Show my 5 most recent expense transactions from ${month}.`, icon: ReceiptLongOutlinedIcon, color: 'green' },
    { title: 'See where it goes', description: 'Find the categories that stand out.', query: `What were my three largest expense categories in ${month}?`, icon: ShowChartIcon, color: 'coral' },
    { title: 'Get the wider picture', description: 'Explore current facts with sources.', query: 'Search the web for the latest euro-area inflation rate and cite official sources.', icon: LanguageIcon, color: 'blue' },
  ]
}

export default function FinancialCopilotPage() {
  // All conversation state belongs to this mounted page. Never persist or restore it.
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const threadId = useRef<string | null>(null)
  const request = useRef<AbortController | null>(null)
  const transcript = useRef<HTMLDivElement | null>(null)
  const form = useRef<HTMLFormElement | null>(null)
  const input = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => () => {
    request.current?.abort()
    request.current = null
    threadId.current = null
  }, [])

  useEffect(() => {
    const element = transcript.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages, pending, error])

  function newChat() {
    request.current?.abort()
    request.current = null
    threadId.current = null
    setMessages([])
    setDraft('')
    setPending(false)
    setError(null)
    input.current?.focus()
  }

  async function sendQuestion(text: string) {
    const query = text.trim()
    if (request.current || error || !query || query.length > 2000) return
    const controller = new AbortController()
    request.current = controller
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: 'user', content: query }])
    setDraft('')
    setError(null)
    setPending(true)
    try {
      const response = await askFinancialCopilot({
        query,
        ...(threadId.current ? { thread_id: threadId.current } : {}),
      }, controller.signal)
      if (controller.signal.aborted || request.current !== controller) return
      threadId.current = response.thread_id
      setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: 'assistant', content: response.answer }])
    } catch (error) {
      if (!controller.signal.aborted && request.current === controller) {
        setError(error instanceof Error ? error.message : 'The assistant could not be reached.')
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        setPending(false)
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendQuestion(draft)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      form.current?.requestSubmit()
    }
  }

  return (
    <section>
      <PageHeader eyebrow="YOUR FINANCIAL COPILOT" title="A little clarity. One question away."
        description="Explore your spending, understand your budget and follow up on what matters to you.">
        <Button color="inherit" variant="outlined" startIcon={<AddIcon />} onClick={newChat}
          disabled={!messages.length && !draft && !pending}>New chat</Button>
      </PageHeader>
      <div className="copilot-layout">
        <div className="copilot-chat">
          <div className="copilot-chat-header">
            <div className="copilot-chat-identity">
              <span className="copilot-avatar"><AutoAwesomeOutlinedIcon fontSize="small" /></span>
              <div><strong>Financial Copilot</strong><span>Your personal-finance assistant</span></div>
            </div>
            <span className="copilot-session-label"><HistoryToggleOffIcon sx={{ fontSize: 15 }} />Temporary chat</span>
          </div>
          <div className="copilot-transcript" ref={transcript} role="region" aria-label="Conversation" aria-busy={pending}>
            {messages.length === 0 ? (
              <div className="copilot-welcome">
                <span className="copilot-welcome-icon"><AutoAwesomeOutlinedIcon sx={{ fontSize: 30 }} /></span>
                <p className="eyebrow">START WITH A QUESTION</p>
                <h2>Your finances, in focus.</h2>
                <p>Ask about a month, a category or a transaction.<br />Then keep the conversation going.</p>
                <div className="copilot-starters">
                  {starterQuestions().map(({ icon: Icon, ...item }) => (
                    <button className="copilot-starter" key={item.title} type="button" onClick={() => void sendQuestion(item.query)}>
                      <span className={`copilot-starter-icon ${item.color}`}><Icon sx={{ fontSize: 20 }} /></span>
                      <span><strong>{item.title}</strong><small>{item.description}</small></span>
                      <ArrowForwardIcon sx={{ fontSize: 17, color: '#888d82' }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions" className="copilot-messages">
                {messages.map((message) => (
                  <article key={message.id} className={`copilot-message ${message.role}`} aria-label={message.role === 'user' ? 'Your message' : 'Copilot response'}>
                    {message.role === 'assistant' && <span className="copilot-avatar"><AutoAwesomeOutlinedIcon sx={{ fontSize: 17 }} /></span>}
                    <div className="copilot-message-body">
                      <span className="copilot-message-author">{message.role === 'user' ? 'You' : 'Financial Copilot'}</span>
                      {message.role === 'assistant' ? <CopilotAnswer content={message.content} /> : <p>{message.content}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
            {pending && <CopilotPending />}
            {error && <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={newChat}>New chat</Button>}>
              {error} Start a new chat before trying again.
            </Alert>}
          </div>
          <form ref={form} className="copilot-composer" onSubmit={handleSubmit}>
            <TextField fullWidth multiline minRows={2} maxRows={6} inputRef={input}
              label="Your question" placeholder="What would you like to know about your finances?"
              value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown}
              disabled={Boolean(error)} slotProps={{ htmlInput: { maxLength: 2000 } }} />
            <div className="copilot-composer-footer">
              <span>{draft.length}/2000 <span className="copilot-keyboard-hint">· Enter to send · Shift + Enter for a new line</span></span>
              <Button type="submit" variant="contained" endIcon={<ArrowUpwardIcon sx={{ fontSize: 17 }} />}
                disabled={pending || Boolean(error) || !draft.trim()}>{pending ? 'Thinking…' : 'Send'}</Button>
            </div>
            <p className="copilot-reset-note">This conversation resets when you leave this page or refresh.</p>
          </form>
        </div>
        <aside className="copilot-aside" aria-label="About the Copilot">
          <div className="copilot-info-dark">
            <span className="hero-pill"><AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />Made for your money</span>
            <h2>Less guesswork.<br />More perspective.</h2>
            <p>A conversation built around your recorded finances, with room for the bigger picture.</p>
            <ul><li>Understand monthly cash flow</li><li>Explore individual transactions</li><li>Look up current information</li></ul>
          </div>
          <div className="copilot-info-note">
            <HistoryToggleOffIcon sx={{ color: '#245bff', mb: 1 }} />
            <h3>A fresh start, every visit.</h3>
            <p>Follow-up questions keep their context while you're here. Leaving this page starts a fresh chat next time.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
