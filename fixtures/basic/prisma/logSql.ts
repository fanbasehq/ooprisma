import { Prisma } from '@prisma/client'
import { format } from 'sql-formatter'
import { highlight } from 'sql-highlight'
import { log } from './prismaClient'

export function getLoggerFn(prismaClient: any) {
  const isSqlite = prismaClient._engine.config.activeProvider === 'sqlite'

  return (event: Prisma.LogEvent) => {
    // @ts-expect-error prisma has bad typings
    const { params, query } = event
    const paramsAsArray = params.substring(1, params.length - 1).split(',')

    if (isSqlite) {
      const formatted = format(query)
      const highlighted = highlight(formatted)
      log(highlighted)
      log(params)
    } else {
      const queryWithVarsReplaced = query.replaceAll(/\$\d/g, (m: string) => {
        const param = paramsAsArray[Number(m.substring(1)) - 1]
        return param
      })
      log(highlight(format(queryWithVarsReplaced)))
    }
  }
}
