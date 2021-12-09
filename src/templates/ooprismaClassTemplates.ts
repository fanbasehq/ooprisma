export const makeMapQueryResultToInstances = (modelName: string) => {
  return `function mapQueryResultToInstances<T extends Prisma.${modelName}Include | null>(
raw: ${modelName} & Partial<typeof ${modelName}PrismaBase['baseRelations']>,
include?: T
): PostGQL {
    if (!include) {
        return plainToInstance(PostGQL, raw)
    }
    for (const key of Object.keys(raw)) {
    // @ts-expect-error
    if (include[key] && raw[key]) {
      // @ts-expect-error
      if (typeof include[key] === 'object') {
        // @ts-expect-error
        raw[key] = mapQueryResultToInstances(raw[key], include[key])
      } else {
        // @ts-expect-error
        if (this?.constructor.relations && this?.constructor.relations[key]) {
          // @ts-expect-error
          raw[key] = plainToInstance(this?.constructor.relations[key], raw[key])
        } else {
          // @ts-expect-error
          raw[key] = plainToInstance(
            // @ts-expect-error
            PostPrismaBase.baseRelations[key],
            // @ts-expect-error
            raw[key]
          )
        }
      }
    }
  }

    return plainToInstance(${modelName}GQL, raw)
}`
}

export const makePrismaBase = (modelName: string, relationsMap = '{}') => {
  return `const baseRelations = ${relationsMap}
class ${modelName}PrismaBase {
    static prismaModel = prismaClient.${modelName.toLowerCase()}

    static baseRelations = baseRelations

    static async findFirst(
    ...args: Parameters<typeof this.prismaModel.findFirst>
    ) {
    const res = await this.prismaModel.findFirst(...args)
    if (!res) {
        return null
    }
    return mapQueryResultToInstances(res, args[0]?.include)
    }

    static async create(...args: Parameters<typeof this.prismaModel.create>) {
    const res = await this.prismaModel.create(...args)

    return mapQueryResultToInstances(res, args[0]?.include)
    }

    static async aggregate(
    ...args: Parameters<typeof this.prismaModel.aggregate>
    ) {
    return this.prismaModel.aggregate(...args)
    }

    static async count(...args: Parameters<typeof this.prismaModel.count>) {
    return this.prismaModel.count(...args)
    }

    static async findMany(...args: Parameters<typeof this.prismaModel.findMany>) {
    const res = await this.prismaModel.findMany(...args)
    return res.map((res) => mapQueryResultToInstances(res, args[0]?.include))
    }
    static async findUnique(
    ...args: Parameters<typeof this.prismaModel.findUnique>
    ) {
    return this.prismaModel.findUnique(...args)
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

    static async update(...args: Parameters<typeof this.prismaModel.update>) {
    const res = await this.prismaModel.update(...args)
    return mapQueryResultToInstances(res, args[0]?.include)
    }
    static async updateMany(
    ...args: Parameters<typeof this.prismaModel.updateMany>
    ) {
    return this.prismaModel.updateMany(...args)
    }

    static async upsert(...args: Parameters<typeof this.prismaModel.upsert>) {
    const res = await this.prismaModel.upsert(...args)

    return mapQueryResultToInstances(res, args[0]?.include)
    }
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

async fetchGraph(relations: Record<keyof typeof baseRelations, boolean>) {
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
