import { PrismaClient, Prisma } from '@prisma/client'

import debug from 'debug'
import { getLoggerFn } from './logSql'

export const log = debug('prisma:sql')

export const prismaClient = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    } as Prisma.LogDefinition,
    'info' as Prisma.LogLevel,
    'warn' as Prisma.LogLevel
  ]
})
console.log('~ prismaClient', prismaClient.engine.config.activeProvider)

// @ts-expect-error Prisma has bad typings
prismaClient.$on('query', getLoggerFn(prismaClient))
