import { DMMF, GeneratorOptions } from '@prisma/generator-helper'
import path from 'path'
import { INDEX_TEMPLATE } from './templates'
import { DECORATOR_TEMPLATE } from './templates/decorator'
import { FIELD_TEMPLATE } from './templates/field'
import { IMPORT_TEMPLATE } from './templates/import'
import { MODEL_TEMPLATE } from './templates/model'
import { convertType } from './utils/convertType'
import {
  hideOrPrivate,
  IFieldsWithMetaData
} from './utils/extractFieldsModifications'

import { modulesThatIsUsed } from './utils/modulesThatIsUsed'
import { objToString } from './utils/objectToString'
import { replaceAll } from './utils/replaceAll'
import { restoreClassChanges } from './utils/restoreClassChanges'
import { restoreImportsChanges } from './utils/restoreImportsSection'
import { restoreDecoratorObjects } from './utils/restoreDecoratorObjects'
import { format } from './utils/format'
import { installPackage } from './utils/installPackage'

interface IGenerateModelClassOptions {
  modelsWriteLocation: string
  exportedNamePrefix: string
  exportedNameSuffix: string
  enumWriteLocation: string
}

export function generateModelClass(
  extractedData: IFieldsWithMetaData[],
  options: GeneratorOptions,
  namingOptions: IGenerateModelClassOptions
) {
  const {
    modelsWriteLocation,
    exportedNamePrefix,
    exportedNameSuffix,
    enumWriteLocation
  } = namingOptions
  return async (model: DMMF.Model) => {
    const fileName = model.name + '.ts'

    const writeLocation = path.join(modelsWriteLocation, fileName)

    const allFields: { field: string; type: string }[] = []

    model.fields.map((field: DMMF.Field) => {
      const optionalCondition = !field.isRequired
      const fieldName = `${field.name}${optionalCondition ? '?' : ''}`
      const fieldType = `${convertType(field.type as string)!}${
        field.isList ? '[]' : ''
      }`
      allFields.push({ field: fieldName, type: fieldType })
    })

    const decoratorObjects = restoreDecoratorObjects(
      writeLocation,
      allFields.map((e) => ({
        field: e.field.replace('?', ''),
        type: e.type
      }))
    )

    let dynamicImports = ''

    const formattedFields = model.fields.map((field: DMMF.Field, index) => {
      const { isForceNullable, isSkip } = hideOrPrivate(
        extractedData,
        field.name,
        model.name
      )

      if (isForceNullable) return { hide: true, type: field.type }

      const fieldType = `${convertType(
        field.type as string,
        exportedNamePrefix,
        exportedNameSuffix
      )!}${field.isList ? '[]' : ''}`

      const decoratorType = () => {
        // Special Cases
        const type = (type: DMMF.Field['type']) =>
          `(${
            options.generator.config.removeTypeInFieldDecorator ? '' : '_type'
          }) => ${type}`

        const modifiedFieldType =
          field.kind === 'scalar'
            ? field.type
            : `${exportedNamePrefix}${field.type}${exportedNameSuffix}`

        const addDynamicImports = (exported: string) => {
          if (dynamicImports.split(',').find((e) => e.trim() === exported)) {
            return
          }
          dynamicImports += `, ${exported}`
        }
        const getEquivalentType = () => {
          const convertedType = convertType(field.type)
          if (field.isId) {
            return 'ID'
          } else if (field.type === 'Int') {
            addDynamicImports('Int')
            return 'Int'
          } else if (field.type === 'Float') {
            addDynamicImports('Float')
            return 'Float'
          } else if (convertedType === 'Prisma.JsonValue') {
            return 'GraphQLScalars.JSONResolver'
          } else if (convertedType === 'Buffer') {
            return 'GraphQLScalars.ByteResolver'
          } else {
            return modifiedFieldType
          }
        }

        const typeGraphQLType = getEquivalentType()

        if (field.isList) {
          return type(`[${typeGraphQLType}]`)
        } else if (field.kind === 'object' && !field.isList) {
          return type(modifiedFieldType)
        }

        if (
          (typeof typeGraphQLType === 'string' &&
            typeGraphQLType.length === 0) ||
          (field.kind === 'scalar' &&
            !field.isId &&
            field.type !== 'Json' &&
            !dynamicImports
              .split(',')
              .find((e) => e.trim() === typeGraphQLType))
        ) {
          return ''
        }

        return type(typeGraphQLType)
      }

      const optionalCondition = !field.isRequired
      const fieldName = `${field.name}${optionalCondition ? '?' : ''}`

      const decoratorObject = () => {
        let object: any = {}

        const editedOptions = decoratorObjects?.find(
          (e) => e.field === fieldName.replace('?', '')
        )

        if (editedOptions) {
          // Remove undefined keys
          Object.keys(editedOptions.decorator).forEach(
            (key) =>
              editedOptions.decorator[key] === undefined &&
              delete editedOptions.decorator[key]
          )
        }

        if (
          editedOptions &&
          Object.keys(editedOptions?.decorator || {}).length > 0
        ) {
          const value = editedOptions.decorator

          object = { ...object, ...value }
        }

        if (optionalCondition || isSkip) {
          object.nullable = true
        } else {
          object.nullable = undefined
        }

        // Remove undefined keys
        Object.keys(object).forEach(
          (key) => object[key] === undefined && delete object[key]
        )

        if (Object.keys(object).length === 0) {
          return undefined
        }

        // console.log(object, objToString(object))
        return objToString(object)
      }

      const Decorator = DECORATOR_TEMPLATE(decoratorType(), decoratorObject())
      const Field = FIELD_TEMPLATE(Decorator, '\n  ' + fieldName, fieldType)

      return { field: Field, kind: field.kind }
    })

    const hidden = formattedFields.filter((e) => {
      if (typeof e !== 'string') return true
      else return false
    })

    const scalarFields = formattedFields
      .filter((e) => {
        if (!e?.field || e.kind === 'object') return false
        else return true
      })
      .map((e) => e.field)

    const objectsFields = formattedFields
      .filter((e) => {
        if (!e?.field || e.kind === 'scalar') return false
        else return true
      })
      .map((e) => e.field)

    const dependsOn = modulesThatIsUsed(
      options.dmmf.datamodel.models,
      model.name
    )

    let imports: string[] = []

    // Import TypeGraphQL Stuff
    imports.push(
      IMPORT_TEMPLATE(
        `{ Field, ID, ObjectType${dynamicImports} }`,
        `type-graphql`
      )
    )
    const modelName = `${exportedNamePrefix}${model.name}${exportedNameSuffix}`

    imports = [
      ...imports,
      ...(dependsOn
        .map(({ kind, name }) => {
          if (!hidden.find((e: any) => e.type === name)) {
            if (kind === 'object') {
              const importModelName = `${exportedNamePrefix}${name}${exportedNameSuffix}`

              // If the Model referenced itself -> return
              if (importModelName === modelName) {
                return
              }

              return IMPORT_TEMPLATE(`{ ${importModelName} }`, `./${name}`)
            } else if (kind === 'enum') {
              const relativePathToEnums = replaceAll(
                path.relative(
                  path.join(process.cwd(), modelsWriteLocation),
                  path.join(process.cwd(), enumWriteLocation)
                ),
                '\\',
                '/'
              )
              const enumName = `${exportedNamePrefix}${name}${exportedNameSuffix}`
              return IMPORT_TEMPLATE(
                `{ ${enumName} }`,
                `${relativePathToEnums}/${name}`
              )
            }
          } else {
            return 'remove'
          }
        })
        .filter((e) => e !== 'remove') as string[])
    ]

    if (scalarFields.join('\n').includes('Prisma.')) {
      imports.push(IMPORT_TEMPLATE(`{ Prisma }`, `@prisma/client`))
    }

    // Install needed Packages
    if (scalarFields.join('\n').includes('GraphQLScalars.')) {
      installPackage(options.generator.config.useYarn, 'graphql-scalars')
      imports.push(IMPORT_TEMPLATE(`GraphQLScalars`, `graphql-scalars`))
    }

    const classChanges = restoreClassChanges(writeLocation)
    const importsChanges = restoreImportsChanges(writeLocation)

    if (!importsChanges) {
      imports.push(`\n@ObjectType()`)
    }

    const actualImportsThatChanged = importsChanges
      ? (
          await format(
            importsChanges
              .split('\n')
              .filter((e) => {
                return e.includes('import ') || e.includes('require(')
              })
              .join('\n')
          )
        ).split('\n')
      : null

    const otherCodeThatChanged = importsChanges
      ? '\n' +
        importsChanges
          ?.split('\n')
          .filter((e) => {
            return !e.includes('import ') && !e.includes('require(')
          })
          .join('\n')
      : ''

    let mergedImports = !importsChanges
      ? imports
      : [
          ...new Set([
            ...actualImportsThatChanged!,
            ...(await format(imports.join('\n'))).split('\n')
          ])
        ]

    // Add empty line between imports and code
    const codeSplitted = (
      mergedImports.join('\n') + otherCodeThatChanged
    ).split('\n')

    const ObjectTypeIndex = codeSplitted.findIndex((e) =>
      e.includes('@ObjectType')
    )

    if (codeSplitted[ObjectTypeIndex - 1].length !== 0) {
      if (otherCodeThatChanged.length) {
        mergedImports.push('')
      }
    }

    const scalarsClass = MODEL_TEMPLATE(
      `${modelName}Scalars`,
      scalarFields.join('\n')
    )

    const objectsClass = MODEL_TEMPLATE(
      modelName,
      objectsFields.join('\n'),
      classChanges,
      ` extends ${modelName}Scalars`
    )

    const generatedModel = INDEX_TEMPLATE(
      [scalarsClass, objectsClass].join('\n\n'),
      mergedImports.join('\n') + otherCodeThatChanged
    )

    return {
      writeLocation,
      code: generatedModel
    }
  }
}
