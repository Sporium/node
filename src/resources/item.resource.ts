import { type ItemDocument } from '../models/item.model'
import { type IUserResource, userResource } from './user.resource'

export interface Item extends Pick<ItemDocument, 'name' | 'description' | 'price' | 'images'> {
  id: string
  user?: IUserResource
}
export type IItemResource = Item | null

export function itemResource (item: ItemDocument | null): IItemResource {
  if (item) {
    return {
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      images: item.images
    }
  }
  return null
}
export function itemWithUserResource (item: ItemDocument | null): IItemResource {
  if (item?.user) {
    return {
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      user: userResource(item.user)
    }
  }
  return null
}
