import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './User'
import { PostGQL } from './Post'
import { Prisma, PrismaClient, Image } from '@prisma/client'
import { plainToInstance, ClassConstructor } from 'class-transformer'
import { prismaClient } from './../../prisma/prismaClient'

type Constructor<T> = {
  new (): T
  relations?: Record<keyof Prisma.ImageInclude, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.ImageInclude, ClassConstructor<any>>
}

interface IImageWithPrismaClient {
  prismaModel: typeof prismaClient.image
  mapQueryResultToInstances: typeof ImagePrismaBase.mapQueryResultToInstances
}
class ImagePrismaBase {
  static prismaModel = prismaClient.image

  static baseRelations = { User: UserGQL, Post: PostGQL }

  static mapQueryResultToInstances<
    IT extends Prisma.ImageInclude | null,
    CT extends ImagePrismaBase
  >(
    this: Constructor<CT>,
    raw: Image & Partial<typeof this['baseRelations']>,
    include?: IT
  ): CT {
    if (!include) {
      return plainToInstance(this, raw)
    }

    for (const keyRaw of Object.keys(raw)) {
      const key = keyRaw as keyof Prisma.PostInclude

      const includeForRelation = include![key]
      if (includeForRelation && raw[key]) {
        if (
          typeof includeForRelation === 'object' &&
          this?.relations &&
          this.relations[key]
        ) {
          // @ts-expect-error
          raw[key] = this.relations[key].mapQueryResultToInstances(
            raw[key],
            includeForRelation.include
          )
        } else {
          if (this?.relations && this?.relations[key]) {
            raw[key] = plainToInstance(this?.relations[key], raw[key])
          } else if (this?.baseRelations && this?.baseRelations[key]) {
            raw[key] = plainToInstance(
              // @ts-expect-error
              PostGQLPrismaBase.baseRelations[key],
              raw[key]
            )
          }
        }
      }
    }

    return plainToInstance(this, raw)
  }

  static async findFirst<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findFirst>
  ): Promise<T | null> {
    const res = await this.prismaModel.findFirst(...args)
    if (!res) {
      return null
    }
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  static async create<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
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

  static async findMany<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findMany>
  ) {
    const res = await this.prismaModel.findMany(...args)
    return res.map((res) =>
      this.mapQueryResultToInstances(res, args[0]?.include)
    )
  }
  static async findUnique<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
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

  static async update<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
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

  static async upsert<T extends ImagePrismaBase>(
    this: Constructor<T> & IImageWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.upsert>
  ) {
    const res = await this.prismaModel.upsert(...args)

    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  async $patchAndFetch<T extends ImagePrismaBase & { id: any }>(
    this: T,
    data: Prisma.ImageUncheckedUpdateInput
  ) {
    const res = await prismaClient.image.update({
      where: { id: this.id },
      data
    })
    Object.assign(this, res)

    return this
  }

  async delete<T extends ImagePrismaBase & { id: any }>(this: T) {
    return prismaClient.image.delete({ where: { id: this.id } })
  }

  async fetchGraph<T extends ImagePrismaBase & { id: any }>(
    this: T,
    relations: Record<keyof Prisma.ImageInclude, boolean>
  ) {
    const withFetched = await prismaClient.image.findUnique({
      where: { id: this.id },
      include: relations
    })
    const mappedToInstances = ImagePrismaBase.mapQueryResultToInstances.apply(
      // @ts-expect-error
      this.constructor,
      [withFetched, relations]
    )

    for (const relation of Object.keys(relations)) {
      // @ts-expect-error
      this[relation] = mappedToInstances[relation]
    }
    return mappedToInstances
  }
}

@ObjectType()
export class ImageGQLScalars extends ImagePrismaBase {
  @Field(() => ID)
  id: number

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field(() => Int)
  height: number

  @Field(() => Int)
  width: number

  @Field()
  url: string
}

@ObjectType()
export class ImageGQL extends ImageGQLScalars {
  @Field(() => [UserGQL])
  User: UserGQL[]

  @Field(() => [PostGQL])
  Post: PostGQL[]

  // skip overwrite 👇
}
