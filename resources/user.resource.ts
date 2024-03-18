import { type UserDocument } from '../models/user.model'
import { itemCollection } from '../models/item.model'
import { type IItemResource } from './item.resource'

export interface IUserResource extends Pick<UserDocument, 'name' | 'id'> {
  token?: string
}
export interface IUserWithItemsResource extends IUserResource {
  items: IItemResource[]
}

export function userResource (user: UserDocument, token?: string): IUserResource {
  return {
    name: user.name,
    id: user._id,
    token
  }
}

export function userWithItemsResource (user: UserDocument, token?: string): IUserWithItemsResource {
  return {
    name: user.name,
    id: user._id,
    token,
    items: itemCollection(user.items)
  }
}
