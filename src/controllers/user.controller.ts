import { type Response } from 'express'
import { type IUserResource, userWithItemsResource } from '../resources/user.resource'
import { type ApiRequestInterface, type IErrorResponse } from '../types/types'
import { User, usersCollection } from '../models/user.model'
import { StatusCodes } from 'http-status-codes'
import { decodeJwt } from '../helpers'

const getAllUsers = async (req: Request, res: Response<IUserResource[] | IErrorResponse>): Promise<void> => {
  try {
    const users = await User.find({})
    const collection: IUserResource[] = usersCollection(users)
    res.status(StatusCodes.OK).json(collection)
  } catch (e) {
    const err = e as Error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

const me = async (req: ApiRequestInterface, res: Response<IUserResource | IErrorResponse>): Promise<void> => {
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findOne({ _id: decoded.id }).populate('items')
    if (user) {
      const me: IUserResource = userWithItemsResource(user)
      res.status(StatusCodes.OK).json(me)
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }
  } catch (e) {
    const err = e as Error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

module.exports = {
  getAllUsers,
  me
}
