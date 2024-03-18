import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { type IUser, type UserDocument } from '../models/user.model'
import type * as Mongoose from 'mongoose'
import { type ApiRequestInterface, type IErrorResponse } from '../types/types'
import { type IUserResource } from '../resources/user.resource'
import { generateJWT } from '../helpers'
import { User, usersCollection } from '../models/user.model'
import { userResource } from '../resources/user.resource'

const bcrypt = require('bcrypt')

async function generatePass (plaintextPassword: string): Promise<string> {
  return bcrypt.hash(plaintextPassword, 10)
}

async function comparePassword (plaintextPassword: string, hash: string): Promise<string> {
  return bcrypt.compare(plaintextPassword, hash)
}

const register = async (req: ApiRequestInterface<Record<string, unknown>, Record<string, unknown>, IUser>, res: Response<IUserResource | IErrorResponse>): Promise<void> => {
  try {
    const pass = await generatePass(req.body.password)
    const user = new User({
      name: req.body.name,
      password: pass
    })
    const token = generateJWT({ id: user._id, name: user.name })
    await user.save()
    res.status(StatusCodes.CREATED).json({ ...userResource(user, token) })
  } catch (e) {
    const err = e as Mongoose.Error
    if (err.name === 'MongoError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Mongo Error' })
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

const signIn = async (req: ApiRequestInterface<Record<string, unknown>, Record<string, unknown>, { name: string, password: string }>, res: Response<IUserResource | IErrorResponse>): Promise<void> => {
  try {
    const { name, password } = req.body
    const existingUser: UserDocument | null = await User.findOne({ name })
    if (existingUser) {
      const isValid = await comparePassword(password, existingUser.password)
      const token = generateJWT(existingUser)
      if (isValid) {
        res.status(StatusCodes.OK).json({ ...userResource(existingUser, token) })
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid username or password' })
    }
  } catch (e) {
    const err = e as Error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
  }
}

module.exports = {
  register,
  signIn
}
