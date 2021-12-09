import { PostGQL } from './generated/Post'

export class PostCustom extends PostGQL {
  myMethod() {
    console.log('myMethod')
  }
}
