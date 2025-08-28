export type CreditTransactionType = 'purchase' | 'consume' | 'refund'

export interface CreditBalance {
  userId: string
  balance: number
  updatedAt?: string
}

export interface CreditTransaction {
  id: string
  userId: string
  type: CreditTransactionType
  amount: number
  createdAt: string
  metadata?: Record<string, unknown>
}
