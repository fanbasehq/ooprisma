function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const makeUtilTypes = (rawPrismaModelName: string) => {
  const capitalized = capitalize(rawPrismaModelName)

  return `type Constructor<T> = {
  new (): T
  relations: Record<keyof Prisma.${capitalized}Include, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.${capitalized}Include, ClassConstructor<any>>
}

interface I${capitalized}WithPrismaClient {
  prismaModel: typeof prismaClient.${rawPrismaModelName}
  mapQueryResultToInstances: typeof ${capitalized}PrismaBase.mapQueryResultToInstances
}`
}

export const makePrismaBase = (
  modelName: string,
  prismaModelName: string,
  relationsMap = '{}'
) => {
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

    for (const keyRaw of Object.keys(raw)) {
      const key = keyRaw as keyof Prisma.PostInclude
      if (include[key] && raw[key]) {
        console.log('~ this', this.relations, key)

        if (typeof include[key] === 'object') {
          // @ts-expect-error
          raw[key] = mapQueryResultToInstances(raw[key], include[key])
        } else {
          if (this?.relations && this?.relations[key]) {
            raw[key] = plainToInstance(this?.relations[key], raw[key])
          } else {
            raw[key] = plainToInstance(
              PostPrismaBase.baseRelations[key],

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

  ${makeInstanceMethods(prismaModelName)}
}`
}

export const makeInstanceMethods = (modelName: string) => {
  const lowercaseModelName = modelName.toLowerCase()
  return `async $patchAndFetch(data: Prisma.PostUncheckedUpdateInput) {
    const res = await prismaClient.${lowercaseModelName}.update({
    where: { id: this.id },
        data
    })
    Object.assign(this, res)

    return this
}

async delete() {
    await prismaClient.${lowercaseModelName}.delete({ where: { id: this.id } })
}

async fetchGraph(relations: Record<keyof Prisma.${modelName}Include, boolean>) {
    const withFetched = await prismaClient.${lowercaseModelName}.findUnique({
        where: { id: this.id },
        include: relations
    })

    const mappedToInstances = mapQueryResultToInstances.apply(this, [
        // @ts-expect-error
        withFetched,
        relations
    ])

    for (const relation of Object.keys(relations)) {
        // @ts-expect-error
        this[relation] = mappedToInstances[relation]
    }
    return mappedToInstances
}`
}
