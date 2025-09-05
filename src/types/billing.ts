// Central billing-related types aligned with Prisma enums and services usage

export type UserTier = 'TRIAL' | 'PERSONAL' | 'TEAM' | 'ENTERPRISE'

export type PaymentMethod = 'STRIPE' | 'CRYPTO_ETH' | 'CRYPTO_USDC' | 'CRYPTO_SOL'

export type BillingAction =
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPDATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'USAGE_OVERAGE'
  | 'MANUAL_ADJUSTMENT'
  | 'REFUND'

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
