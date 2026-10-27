import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function CopilotAnswer({ content }: { content: string }) {
  return (
    <div className="copilot-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={{
        a: ({ href, children }) => href && /^https?:\/\//i.test(href)
          ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          : <span>{children}</span>,
        // Answers may contain links, but must not load remote images or raw HTML.
        img: () => null,
      }}>{content}</Markdown>
    </div>
  )
}
