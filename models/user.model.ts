import mongoose, { Schema } from "mongoose";
import * as Mongoose from "mongoose";

export interface IUser {
    name: string
    authTokens?: string[]
    password: string
}
const userResource = require('../resources/user.resource')

export interface UserDocument extends IUser, Mongoose.Document {
    id: string | number
}



const UserSchema = new Schema<UserDocument>({
    name: { type: String, required: [true, 'Name is required'], maxLength: 20, unique: true },
    password: { type: String, required: [true, 'Password is required']},
})

const usersCollection = (users: UserDocument[]) => {
    return users.map(user => userResource(user))
}
module.exports = {
    User: mongoose.model<UserDocument>('User', UserSchema),
    usersCollection
}