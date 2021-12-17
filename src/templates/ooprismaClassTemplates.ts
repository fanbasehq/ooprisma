import { DMMF } from '@prisma/generator-helper'

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const makeUtilTypes = (rawPrismaModelName: string) => {
  const capitalized = capitalize(rawPrismaModelName)

  return `type Constructor<T> = {
  new (): T
  relations?: Record<keyof Prisma.${capitalized}Include, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.${capitalized}Include, ClassConstructor<any>>
}

interface I${capitalized}WithPrismaClient {
  prismaModel: typeof prismaClient.${rawPrismaModelName}
  mapQueryResultToInstances: typeof ${capitalized}PrismaBase.mapQueryResultToInstances
}`
}

export const makePrismaBase = (
  modelName: string,
  model: DMMF.Model,
  relationsMap = '{}'
) => {
  const prismaModelName = model.name
  return `class ${prismaModelName}PrismaBase {
  static prismaModel = prismaClient.${prismaModelName.toLowerCase()}

  static baseRelations = ${relationsMap}

  static mapQueryResultToInstances<
    IT extends Prisma.${prismaModelName}Include | null,
    CT extends ${prismaModelName}PrismaBase
  >(
    this: Constructor<CT>,
    raw: ${prismaModelName} & Partial<typeof this['baseRelations']>,
    include?: IT
  ): CT {
    if (!include) {
      return plainToInstance(this, raw)
    }
    // @ts-expect-error
    if (include.include) {
      // prisma uses nested "include"
      // @ts-expect-error
      include = include.include
    }

    for (const keyRaw of Object.keys(raw)) {
      const key = keyRaw as keyof Prisma.${prismaModelName}Include

      if (include![key] && raw[key]) {
        if (typeof include![key] === 'object' && this?.relations && this.relations[key]) {
          // @ts-expect-error
          raw[key] = this.relations[key].mapQueryResultToInstances(
            raw[key],
            include![key]
          )
        } else {
          if (this?.relations && this?.relations[key]) {
            raw[key] = plainToInstance(this?.relations[key], raw[key])
          } else if (this?.baseRelations && this?.baseRelations[key]) {
            raw[key] = plainToInstance(
              // @ts-expect-error
              ${modelName}PrismaBase.baseRelations[key],
              raw[key]
            )
          }
        }
      }
    }

    return plainToInstance(this, raw)
  }

  static async findFirst<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findFirst>
  ): Promise<T | null> {
    const res = await this.prismaModel.findFirst(...args)
    if (!res) {
      return null
    }
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  static async create<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.create>
  ): Promise<T> {
    const res = await this.prismaModel.create(...args)

    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  static async aggregate(
    ...args: Parameters<typeof this.prismaModel.aggregate>
  ) {
    return this.prismaModel.aggregate(...args)
  }

  static async count(...args: Parameters<typeof this.prismaModel.count>) {
    return this.prismaModel.count(...args)
  }

  static async findMany<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findMany>
  ) {
    const res = await this.prismaModel.findMany(...args)
    return res.map((res) =>
      this.mapQueryResultToInstances(res, args[0]?.include)
    )
  }
  static async findUnique<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findUnique>
  ) {
    const res = await this.prismaModel.findUnique(...args)
    if (!res) {
      return null
    }
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }
  static async delete(...args: Parameters<typeof this.prismaModel.delete>) {
    return this.prismaModel.delete(...args)
  }
  static async deleteMany(
    ...args: Parameters<typeof this.prismaModel.deleteMany>
  ) {
    return this.prismaModel.deleteMany(...args)
  }
  static async groupBy(...args: Parameters<typeof this.prismaModel.groupBy>) {
    return this.prismaModel.groupBy(...args)
  }

  static async update<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.update>
  ) {
    const res = await this.prismaModel.update(...args)
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }
  static async updateMany(
    ...args: Parameters<typeof this.prismaModel.updateMany>
  ) {
    return this.prismaModel.updateMany(...args)
  }

  static async upsert<T extends ${prismaModelName}PrismaBase>(
    this: Constructor<T> & I${prismaModelName}WithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.upsert>
  ) {
    const res = await this.prismaModel.upsert(...args)

    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  ${makeInstanceMethods(prismaModelName, model.primaryKey?.name)}
}`
}

export const makeInstanceMethods = (
  modelName: string,
  idField?: string | null
) => {
  const lowercaseModelName = modelName.toLowerCase()
  return `  async $patchAndFetch<T extends ${modelName}PrismaBase & { ${idField}: any }>(
    this: T,
    data: Prisma.${modelName}UncheckedUpdateInput
  ) {
    const res = await prismaClient.${lowercaseModelName}.update({
      where: { ${idField}: this.${idField} },
      data
    })
    Object.assign(this, res)

    return this
  }

  async delete<T extends ${modelName}PrismaBase & { ${idField}: any }>(this: T) {
    return prismaClient.${lowercaseModelName}.delete({ where: { ${idField}: this.${idField} } })
  }

async fetchGraph<T extends ${modelName}PrismaBase & { ${idField}: any }>(
  this: T,
  relations: Record<keyof Prisma.${modelName}Include, boolean>
) {
  const withFetched = await prismaClient.${lowercaseModelName}.findUnique({
    where: { ${idField}: this.${idField} },
    include: relations
  })
  const mappedToInstances = ${modelName}PrismaBase.mapQueryResultToInstances.apply(
    // @ts-expect-error
    this.constructor,
    [withFetched, relations]
  )

  for (const relation of Object.keys(relations)) {
    // @ts-expect-error
    this[relation] = mappedToInstances[relation]
  }
  return mappedToInstances
}`
}
