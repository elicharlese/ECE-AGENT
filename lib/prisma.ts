import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in dev due to HMR
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as any

export const prisma: PrismaClient = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
