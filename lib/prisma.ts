// lib/prisma.ts
import { PrismaClient } from '../app/generated/prisma/client'   
//Earlier we were using @prims/client, but now we are using the generated client from app/generated/prisma/client due to errors

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, // pooled URL for queries
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}