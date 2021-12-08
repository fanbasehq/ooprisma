export interface IFieldsWithMetaData {
  fieldName: string
  modelName: string
  forceNullable?: boolean
  skip?: boolean
}

export const ExtractFieldsModifications = (dataModel: string) => {
  let skipField = false
  let forceNullableField = false
  let currentCodeBlock: { name: string; type: 'model' | 'enum' }

  const extractedData: IFieldsWithMetaData[] = []

  dataModel.split('\n').forEach((line) => {
    if (line.includes('@skip')) {
      return (skipField = true)
    } else if (line.includes('@nullable')) {
      return (forceNullableField = true)
    }

    if (line.includes('model')) {
      currentCodeBlock = { name: line.split(' ')[1], type: 'model' }
    } else if (line.includes('enum')) {
      currentCodeBlock = { name: line.split(' ')[1], type: 'enum' }
    }

    const fieldName = line
      .split(' ')
      .filter((e) => e !== '')
      .map((e) => e.replace('\r', ''))[0]

    if (skipField) {
      extractedData.push({
        fieldName,
        skip: true,
        modelName: currentCodeBlock.name
      })

      // Reset
      skipField = false
    } else if (forceNullableField) {
      extractedData.push({
        fieldName,
        forceNullable: true,
        modelName: currentCodeBlock.name
      })

      // Reset
      forceNullableField = false
    }
  })

  return extractedData
}

export const hideOrPrivate = (
  extractedData: IFieldsWithMetaData[],
  fieldName: string,
  modelName: string
) => {
  const isSkip = !!extractedData.find(
    (e: any) => e.fieldName === fieldName && modelName === e.modelName
  )?.forceNullable

  const isForceNullable = !!extractedData.find(
    (e: any) => e.fieldName === fieldName && modelName === e.modelName
  )?.skip

  return { isForceNullable, isSkip }
}
