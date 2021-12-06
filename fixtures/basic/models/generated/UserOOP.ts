import { prisma } from '@prisma/client'
import { Field, ID, ObjectType } from 'type-graphql'
import { prismaClient } from '../../prisma/prismaClient'

import { PostGQL } from './Post'

class Base {
  static prismaModel: typeof prismaClient.user
}

@ObjectType()
export class UserGQLScalars extends Base {
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
}

export class UserGQL extends UserGQLScalars {
  @Field(() => [PostGQL])
  posts: PostGQL[]

  // skip overwrite 👇

  login() {
    console.log('user method for log in')
  }
}
