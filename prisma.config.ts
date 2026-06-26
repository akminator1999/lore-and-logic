// prisma.config.ts
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL!,
  },
  migrations: {                    //  NSeeding configuration for migrations
    seed: 'tsx ./prisma/seed.ts',
  },

  //URL to my postgres database, using the DIRECT_URL environment variable from .env
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({
        connectionString: process.env.DIRECT_URL!,
      })
    },
  },
})