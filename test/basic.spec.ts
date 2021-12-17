import { PostGQL } from '../fixtures/basic/models/generated/Post'
import { UserGQL } from '../fixtures/basic/models/generated/User'
import faker from 'faker'
import { ImageGQL } from '../fixtures/basic/models/generated/Image'

class CustomImage extends ImageGQL {
  methodOnPicture() {
    return 'picture method'
  }
}

class CustomUser extends UserGQL {
  profilePicture: CustomImage
  static relations = {
    profilePicture: CustomImage
  }
  methodOnCustomUser() {
    console.log('yes')
    return 'yes'
  }
}

class CustomPost extends PostGQL {
  author?: CustomUser
  static relations = {
    author: CustomUser
  }
  methodOnCustomPost() {
    return 'works'
  }
}

describe('basic', () => {
  it('creates and maps instances to their types', async () => {
    const post1 = await CustomPost.create({
      data: {
        title: 'Hello World',
        published: true,
        author: {
          create: {
            email: faker.internet.email(),
            profilePicture: {
              create: {
                url: faker.random.image(),
                width: faker.random.number(2000),
                height: faker.random.number(2000)
              }
            }
          }
        }
      },
      include: {
        author: {
          include: {
            profilePicture: true
          }
        }
      }
    })
    console.log(post1)
    expect(post1.author).toBeInstanceOf(CustomUser)
    expect(post1).toBeInstanceOf(CustomPost)

    expect(post1.author?.profilePicture.methodOnPicture()).toBe(
      'picture method'
    )
    expect(post1.author?.methodOnCustomUser()).toBe('yes')
    expect(post1.methodOnCustomPost()).toBe('works')
  })
})
