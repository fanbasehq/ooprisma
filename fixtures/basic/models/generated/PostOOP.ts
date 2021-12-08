import 'reflect-metadata'

import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './UserOOP'
import { makeOOPrisma } from '../../../../src/orm/OOPrismaBase'
import { Post, Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { prismaClient as prismaClient } from '../../prisma/prismaClient'

function mapQueryResultToInstances<T extends Prisma.PostInclude | null>(
  raw: Post & Partial<typeof PostPrismaBase['baseRelations']>,
  include?: T
  // TODO figure out a type which will infer nullability of relations from the include payload, PostGQL & NonNullable<Pick<Relations, keyof Prisma.PostInclude>>
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
  return plainToInstance(PostGQL, raw)
}

const baseRelations = {
  author: UserGQL
}
class PostPrismaBase {
  static prismaModel = prismaClient.post

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

  @Field(() => Int, { nullable: true }) d
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

  async fetchGraph(relations: Record<keyof typeof baseRelations, boolean>) {
    // TODO
    const withFetched = await prismaClient.post.findUnique({
      where: { id: this.id },
      include: relations
    })
    console.log('~ this11', this)

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
  }

  async myMethod() {
    console.log('myMethod')
  }
}

class CustomUserClass extends UserGQL {
  superCustomMethod() {
    console.log('superCustomMethod')
  }
}

export class PostGQL extends PostGQLScalars {
  @Field(() => UserGQL, { nullable: true })
  author?: CustomUserClass
  static relations = {
    author: CustomUserClass
  }
  // skip overwrite 👇
}

;(async () => {
  await prismaClient.user.deleteMany()
  PostGQL.deleteMany()
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
  const onlyPost = await PostGQL.findFirst()
  await onlyPost?.fetchGraph({ author: true })
  console.log('fetchGraph', onlyPost)
  onlyPost?.author?.superCustomMethod()
  // console.log(post1)

  // // postUpdated.delete()

  // const posts = await PostGQL.findMany({ include: { author: true } })
  // console.log(posts)
})()
