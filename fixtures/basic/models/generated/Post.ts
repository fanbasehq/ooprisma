import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './User'
import { Prisma, PrismaClient, Post } from '@prisma/client'
import { plainToInstance, ClassConstructor } from 'class-transformer'
import { prismaClient } from './../../prisma/prismaClient'
import { ImageGQL } from './Image'

type Constructor<T> = {
  new (): T
  relations?: Record<keyof Prisma.PostInclude, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.PostInclude, ClassConstructor<any>>
}

interface IPostWithPrismaClient {
  prismaModel: typeof prismaClient.post
  mapQueryResultToInstances: typeof PostPrismaBase.mapQueryResultToInstances
}
class PostPrismaBase {
  static prismaModel = prismaClient.post

  static baseRelations = { author: UserGQL, headerPic: ImageGQL }

  static mapQueryResultToInstances<
    IT extends Prisma.PostInclude | null,
    CT extends PostPrismaBase
  >(
    this: Constructor<CT>,
    raw: Post & Partial<typeof this['baseRelations']>,
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

  static async findFirst<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findFirst>
  ): Promise<T | null> {
    const res = await this.prismaModel.findFirst(...args)
    if (!res) {
      return null
    }
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  static async create<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
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

  static async findMany<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findMany>
  ) {
    const res = await this.prismaModel.findMany(...args)
    return res.map((res) =>
      this.mapQueryResultToInstances(res, args[0]?.include)
    )
  }
  static async findUnique<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
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

  static async update<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
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

  static async upsert<T extends PostPrismaBase>(
    this: Constructor<T> & IPostWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.upsert>
  ) {
    const res = await this.prismaModel.upsert(...args)

    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  async $patchAndFetch<T extends PostPrismaBase & { id: any }>(
    this: T,
    data: Prisma.PostUncheckedUpdateInput
  ) {
    const res = await prismaClient.post.update({
      where: { id: this.id },
      data
    })
    Object.assign(this, res)

    return this
  }

  async delete<T extends PostPrismaBase & { id: any }>(this: T) {
    return prismaClient.post.delete({ where: { id: this.id } })
  }

  async fetchGraph<T extends PostPrismaBase & { id: any }>(
    this: T,
    relations: Record<keyof Prisma.PostInclude, boolean>
  ) {
    const withFetched = await prismaClient.post.findUnique({
      where: { id: this.id },
      include: relations
    })
    const mappedToInstances = PostPrismaBase.mapQueryResultToInstances.apply(
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
export class PostGQLScalars extends PostPrismaBase {
  @Field(() => ID)
  id: number

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field()
  published: boolean

  @Field()
  title: string

  @Field(() => Int, { nullable: true })
  authorId?: number

  @Field(() => Int, { nullable: true })
  headerPicId?: number
}

@ObjectType()
export class PostGQL extends PostGQLScalars {
  @Field(() => UserGQL, { nullable: true })
  author?: UserGQL

  @Field(() => ImageGQL, { nullable: true })
  headerPic?: ImageGQL

  // skip overwrite 👇
}
