import { Field, ID, ObjectType, Int } from 'type-graphql'
import { UserGQL } from './User'

@ObjectType()
export class PostGQLScalars {
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
