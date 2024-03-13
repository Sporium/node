import { type ItemDocument } from '../models/item.model'

export interface Item extends Pick<ItemDocument, 'name' | 'description' | 'price'> {
  id: string
}
export type IItemResource = Item | null

export function itemResource (item: ItemDocument | null): IItemResource {
  if (item) {
    return {
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price
    }
  }
  return null
}
