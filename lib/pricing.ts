// Pricing and credit configuration
// Server and client-safe values (avoid secrets here)

export type CreditPackage = {
  id: string
  credits: number
  amountUsd: number
  label: string
  // Optional Stripe price id
  stripePriceId?: string
}

export const CREDITS_ENABLED = (process.env.NEXT_PUBLIC_CREDITS_ENABLED === 'true')

export const CREDITS_PER_AI_REQUEST = Number(process.env.NEXT_PUBLIC_CREDITS_PER_AI_REQUEST || 1)

// Default packages. If STRIPE_PRICE_ID_* envs are set on server, they will be injected in API layer
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'credits_100', credits: 100, amountUsd: 5, label: '100 credits' },
  { id: 'credits_500', credits: 500, amountUsd: 20, label: '500 credits' },
  { id: 'credits_2000', credits: 2000, amountUsd: 60, label: '2,000 credits' },
]

export function resolvePackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(p => p.id === id)
}
