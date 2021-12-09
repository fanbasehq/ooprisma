import { PostCustom } from './models/Post'
import { prismaClient } from './prisma/prismaClient'
;(async () => {
  await prismaClient.post.deleteMany()
  await prismaClient.user.deleteMany()
  const post1 = await PostCustom.create({
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
  post1.myMethod() // TODO fix this
  console.log(post1)
  // post1.author.login() // TODO fix this
  // console.log(post);
})()
