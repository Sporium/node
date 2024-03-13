import mongoose, { Schema } from 'mongoose'
import type * as Mongoose from 'mongoose'
import { type ItemDocument } from './item.model'
import { type IUserResource } from '../resources/user.resource'
import { userResource } from '../resources/user.resource'

export interface IUser {
  name: string
  authTokens?: string[]
  password: string
  items: ItemDocument[]
}

export interface UserDocument extends IUser, Mongoose.Document {
  id: string | number
}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: [true, 'Name is required'], maxLength: 20, unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }]
})

export const User = mongoose.model<UserDocument>('User', UserSchema)
export const usersCollection = (users: UserDocument[]): IUserResource[] => {
  return users.map(user => userResource(user))
}
