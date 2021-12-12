// this file is used for prototyping
import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './generated/User'
import { Prisma, PrismaClient, Post, prisma } from '@prisma/client'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { prismaClient } from '../prisma/prismaClient'

type Constructor<T> = {
  new (): T
  relations: Record<keyof Prisma.PostInclude, ClassConstructor<any>>
  baseRelations: Record<keyof Prisma.PostInclude, ClassConstructor<any>>
}

interface IPostWithPrismaClient {
  prismaModel: typeof prismaClient.post
  mapQueryResultToInstances: typeof PostPrismaBase.mapQueryResultToInstances
}

class PostPrismaBase {
  static prismaModel = prismaClient.post

  static baseRelations = {
    author: UserGQL as ClassConstructor<any>
  }

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
}

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
}

export class PostGQL extends PostGQLScalars {
  @Field(() => UserGQL, { nullable: true })
  author?: UserGQL

  // skip overwrite 👇
}

class CustomUser extends UserGQL {
  methodOnCustomUser() {
    console.log('yes!!!!')
  }
}

class CustomPost extends PostGQL {
  author?: CustomUser
  static relations = {
    author: CustomUser
  }
}

;(async () => {
  await prismaClient.post.deleteMany()
  await prismaClient.user.deleteMany()
  const post1 = await CustomPost.create({
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
  // const gpr = await PostGQL.groupBy({
  //   _sum: {
  //     id: true
  //   },
  //   by: ['title']
  // })

  // const post = await PostGQLScalars.findFirst({ include: { author: true } });
  // post1.myMethod()
  console.log(post1)
  post1.author?.methodOnCustomUser()
  // post1.author.login()
  // console.log(post);
})()

// const gpr2 = prismaClient.post.groupBy({
//   _sum: {
//     id: true
//   },
//   by: ['title']
// })
