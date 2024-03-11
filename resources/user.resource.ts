import { type UserDocument } from '../models/user.model'

export interface IUserResource extends Pick<UserDocument, 'name' | 'id'> {
  token?: string
}

function userResource (user: UserDocument, token?: string): IUserResource {
  return {
    name: user.name,
    id: user._id,
    token
  }
}

module.exports = userResource
