import 'reflect-metadata'

import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './User'
import { makeOOPrisma } from '../../../../src/orm/OOPrismaBase'
import { Prisma, PrismaClient } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
const prisma = new PrismaClient()
type GlobalReject = any

const mapResToInstances = (res, include: Prisma.PostInclude) => {
  if (!include) {
    plainToInstance(PostGQLScalars, res)
  }
  for (const key of Object.keys(res)) {
    // TODO map
  }
}

class Base {
  static prismaModel: typeof prisma.post

  static relations = {
    author: prisma.user
  }

  static async findFirst(
    ...args: Parameters<typeof this.prismaModel.findFirst>
  ) {
    const res = this.prismaModel.findFirst(...args)
    if (!res) {
      return null
    }
    return plainToInstance(PostGQLScalars, res)
  }

  static async create(...args: Parameters<typeof this.prismaModel.create>) {
    const res = await this.prismaModel.create(...args)

    return plainToInstance(PostGQLScalars, res)
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
    return this.prismaModel.findMany(...args)
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
    return this.prismaModel.update(...args)
  }
  static async updateMany(
    ...args: Parameters<typeof this.prismaModel.updateMany>
  ) {
    return this.prismaModel.updateMany(...args)
  }

  static async upsert(...args: Parameters<typeof this.prismaModel.upsert>) {
    const res = this.prismaModel.upsert(...args)

    return plainToInstance(PostGQLScalars, res)
  }
}

@ObjectType()
export class PostGQLScalars extends Base {
  static prismaModel = prisma.post

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
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()
  const post1 = await PostGQLScalars.create({
    data: {
      title: 'Hello World',
      published: true,
      author: {
        create: {
          email: 'test@sample.com'
        }
      }
    }
  })
  const post = await PostGQLScalars.findFirst({ include: { author: true } })
  post1.myMethod()
  console.log(post1)
  console.log(post)
})()
