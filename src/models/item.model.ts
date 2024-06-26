import mongoose, { Schema } from 'mongoose'
import type * as Mongoose from 'mongoose'
import { type IItemResource } from '../resources/item.resource'
import { itemResource } from '../resources/item.resource'
import { type UserDocument } from './user.model'
export interface IItem {
  name: string
  price: number
  description?: string
  images?: IImage[]
  user: UserDocument
}

export interface IImage {
  name: string
  src: string
  thumb?: string
}

export interface ItemDocument extends IItem, Mongoose.Document {
  id: string | number
}

const ItemSchema = new Schema<ItemDocument>({
  name: { type: String, required: [true, 'Name is required'], maxLength: 20, unique: true },
  price: { type: Number, required: [true, 'Price is required'] },
  description: { type: String },
  images: [{ type: Object }],
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

export const Item = mongoose.model<ItemDocument>('Item', ItemSchema)
export const itemCollection = (items: ItemDocument[]): IItemResource[] => {
  return items.map(item => itemResource(item))
}
