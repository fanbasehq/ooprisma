import { DMMF } from '@prisma/generator-helper'
import { removeDuplicates } from './removeDuplicates'

export const modulesThatIsUsed = (
  dataModel: DMMF.Model[],
  modelName: string
) => {
  const model = dataModel.find((e) => e.name === modelName)!

  const used = model.fields
    .filter((field) => {
      return field.kind === 'object' || field.kind === 'enum'
    })
    .map((e) => ({ name: e.type, kind: e.kind }))

  return removeDuplicates(used, 'name')
}
