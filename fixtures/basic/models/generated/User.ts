import { Field, ID, ObjectType } from 'type-graphql'
import { PostGQL } from './Post'
import { Prisma, PrismaClient, User } from '@prisma/client'
import { plainToInstance, ClassConstructor } from 'class-transformer'
import { prismaClient } from './../../prisma/prismaClient'
import { Field, ID, ObjectType, Int } from 'type-graphql'
import { ImageGQL } from './Image'

type Constructor<T> = {
  new (): T
  relations?: Record<keyof Prisma.UserInclude, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.UserInclude, ClassConstructor<any>>
}

interface IUserWithPrismaClient {
  prismaModel: typeof prismaClient.user
  mapQueryResultToInstances: typeof UserPrismaBase.mapQueryResultToInstances
}
class UserPrismaBase {
  static prismaModel = prismaClient.user

  static baseRelations = { posts: PostGQL, profilePicture: ImageGQL }

  static mapQueryResultToInstances<
    IT extends Prisma.UserInclude | null,
    CT extends UserPrismaBase
  >(
    this: Constructor<CT>,
    raw: User & Partial<typeof this['baseRelations']>,
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
      const key = keyRaw as keyof Prisma.UserInclude

      if (include![key] && raw[key]) {
        if (
          typeof include![key] === 'object' &&
          this?.relations &&
          this.relations[key]
        ) {
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
              UserGQLPrismaBase.baseRelations[key],
              raw[key]
            )
          }
        }
      }
    }

    return plainToInstance(this, raw)
  }

  static async findFirst<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findFirst>
  ): Promise<T | null> {
    const res = await this.prismaModel.findFirst(...args)
    if (!res) {
      return null
    }
    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  static async create<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
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

  static async findMany<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.findMany>
  ) {
    const res = await this.prismaModel.findMany(...args)
    return res.map((res) =>
      this.mapQueryResultToInstances(res, args[0]?.include)
    )
  }
  static async findUnique<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
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

  static async update<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
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

  static async upsert<T extends UserPrismaBase>(
    this: Constructor<T> & IUserWithPrismaClient,
    ...args: Parameters<typeof this.prismaModel.upsert>
  ) {
    const res = await this.prismaModel.upsert(...args)

    return this.mapQueryResultToInstances(res, args[0]?.include)
  }

  async $patchAndFetch<T extends UserPrismaBase & { undefined: any }>(
    this: T,
    data: Prisma.UserUncheckedUpdateInput
  ) {
    const res = await prismaClient.user.update({
      where: { undefined: this.undefined },
      data
    })
    Object.assign(this, res)

    return this
  }

  async delete<T extends UserPrismaBase & { undefined: any }>(this: T) {
    return prismaClient.user.delete({ where: { undefined: this.undefined } })
  }

  async fetchGraph<T extends UserPrismaBase & { undefined: any }>(
    this: T,
    relations: Record<keyof Prisma.UserInclude, boolean>
  ) {
    const withFetched = await prismaClient.user.findUnique({
      where: { undefined: this.undefined },
      include: relations
    })
    const mappedToInstances = UserPrismaBase.mapQueryResultToInstances.apply(
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
export class UserGQLScalars extends UserPrismaBase {
  @Field(() => ID)
  id: number

  @Field()
  createdAt: Date

  @Field()
  email: string

  @Field({ nullable: true })
  name?: string

  @Field()
  role: string

  @Field(() => Int, { nullable: true })
  profilePictureId?: number
}

@ObjectType()
export class UserGQL extends UserGQLScalars {
  @Field(() => [PostGQL])
  posts: PostGQL[]

  @Field(() => ImageGQL, { nullable: true })
  profilePicture?: ImageGQL

  // skip overwrite 👇
}
