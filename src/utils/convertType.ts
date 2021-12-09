import { DMMF } from '@prisma/generator-helper'

export const prismaTypes = [
  'String',
  'Int',
  'Float',
  'Boolean',
  'DateTime',
  'BigInt',
  'Decimal',
  'Json',
  'Bytes'
]

export const convertType = (
  type: DMMF.Field['type'],
  prefix?: string,
  suffix?: string
) => {
  if (prismaTypes.includes(type as string)) {
    switch (type) {
      case 'String':
        return 'string'
      case 'Boolean':
        return 'boolean'
      case 'Int':
        return 'number'
      case 'BigInt':
        return 'number'
      case 'Decimal':
        return 'number'
      case 'Float':
        return 'number'
      case 'DateTime':
        return 'Date'
      case 'Json':
        return 'Prisma.JsonValue'
      case 'Bytes':
        return 'Buffer'
    }
  } else {
    return `${prefix || ''}${type}${suffix || ''}`
  }
}
