import { Field, ID, ObjectType } from 'type-graphql';
import { PostGQL } from './PostTweaked';

@ObjectType()
export class UserGQLScalars {
  @Field(() => ID)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  role: string;
}

export class UserGQL extends UserGQLScalars {
  @Field(() => [PostGQL])
  posts: PostGQL[];

  // skip overwrite 👇
}
