export interface FinancialCopilotRequest {
  query: string
  thread_id?: string
}

export interface FinancialCopilotResponse {
  thread_id: string
  route: 'financial' | 'out_of_scope' | 'clarification'
  answer: string
}

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}
