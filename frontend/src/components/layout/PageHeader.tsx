import type { ReactNode } from 'react'

interface Props {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export default function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  )
}
