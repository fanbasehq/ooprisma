import 'reflect-metadata'

import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './UserOOP'
import { makeOOPrisma } from '../../../../src/orm/OOPrismaBase'
import { Post, Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { prismaClient } from '../../prisma/prismaClient'
type GlobalReject = any

const mapQueryResultToInstances = <T extends Prisma.PostInclude | null>(
  res: Post & Partial<typeof PostPrismaBase['baseRelations']>,
  include?: T
  // TODO figure out a type which will infer nullability of relations from the include payload, PostGQL & NonNullable<Pick<Relations, keyof Prisma.PostInclude>>
): PostGQL => {
  if (!include) {
    return plainToInstance(PostGQL, res)
  }
  for (const key of Object.keys(res)) {
    // @ts-expect-error
    if (res[key]) {
      // @ts-expect-error
      if (typeof include[key] === 'object') {
        // @ts-expect-error
        res[key] = mapQueryResultToInstances(res[key], include[key])
      } else {
        // @ts-expect-error
        res[key] = plainToInstance(PostPrismaBase.baseRelations[key], res[key])
      }

      // TODO call mapQueryResultToInstances recursively for each relation
    }
  }
  return plainToInstance(PostGQL, res)
}

class PostPrismaBase {
  static prismaModel: typeof prismaClient.post

  static baseRelations = {
    author: UserGQL
  }

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
}

@ObjectType()
export class PostGQLScalars extends PostPrismaBase {
  static prismaModel = prismaClient.post

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

  // inspired by objection
  async patchAndFetch(data: Prisma.PostUncheckedUpdateInput) {
    const res = await prismaClient.post.update({
      where: { id: this.id },
      data
    })
    Object.assign(this, res)

    return this
  }

  async delete() {
    await prismaClient.post.delete({ where: { id: this.id } })
  }

  async myMethod() {
    console.log('myMethod')
  }
}

export class PostGQL extends PostGQLScalars {
  @Field(() => UserGQL, { nullable: true })
  author?: UserGQL

  // skip overwrite 👇
}

;(async () => {
  // await prismaClient.post.deleteMany()
  await prismaClient.user.deleteMany()
  const post1 = await PostGQL.create({
    data: {
      title: 'Hello World',
      published: true,
      author: {
        create: {
          email: 'test@sample.com'
        }
      }
    },
    include: {
      author: true
    }
  })
  // const post = await PostGQLScalars.findFirst({ include: { author: true } });
  post1.myMethod()
  console.log(post1)
  post1.author?.login()

  const postUpdated = await post1.patchAndFetch({
    title: 'Hello World 2'
  })

  console.log(post1)

  // postUpdated.delete()

  const posts = await PostGQL.findMany({ include: { author: true } })
  console.log(posts)
})()
