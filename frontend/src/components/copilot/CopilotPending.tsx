import { useEffect, useState } from 'react'

export default function CopilotPending() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const started = Date.now()
    const interval = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [])
  return (
    <div role="status" className="copilot-pending">
      <span className="copilot-thinking" aria-hidden="true"><i /><i /><i /></span>
      <span>{seconds < 25 ? 'Looking into your question…' : 'Still working on your answer…'}
        <small>{seconds}s · You can stop waiting with “New chat”.</small>
      </span>
    </div>
  )
}
