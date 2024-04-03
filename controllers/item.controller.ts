import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type * as Mongoose from 'mongoose'
import { type ApiRequestInterface, type IErrorResponse } from '../types/types'
import { type IItem } from '../models/item.model'
import { type IItemResource, itemWithUserResource } from '../resources/item.resource'
import { decodeJwt } from '../helpers'
import { Item, itemCollection } from '../models/item.model'
import { User } from '../models/user.model'
import { itemResource } from '../resources/item.resource'

const create = async (req: ApiRequestInterface<Record<string, any>, Record<string, any>, IItem>, res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findById(decoded.id)
    const item = await Item.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      user: user?._id
    })
    const token = decodeJwt(req.headers.authorization)
    await user?.updateOne({ _id: token.id }, { $push: { items: item._id } })
    res.status(StatusCodes.CREATED).json(itemResource(item))
  } catch (e) {
    const err = e as Mongoose.Error
    if (err.name === 'MongoError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Mongo Error' })
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

export interface UpdateItemParams extends IItem {
  id: string
}
const update = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  const itemID = req.params.id
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findById(decoded.id)
    const item = await Item.findById(itemID)
    if (decoded.id === item?.user?._id.toString()) {
      item?.set({
        ...req.body,
        user
      })
      await item?.save()
      const itemsResource: IItemResource = itemResource(item)
      res.status(StatusCodes.OK).json(itemsResource)
    } else {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'This action is forbidden' })
    }
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).send({ message: `No item with id : ${itemID}` })
  }
}

const deleteItem = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  const itemId = req.params.id
  try {
    const item = await Item.findById(itemId)
    const decoded = decodeJwt(req?.headers.authorization)
    if (decoded.id === item?.user?._id.toString()) {
      await item.deleteOne()
      res.status(StatusCodes.OK).json()
    } else {
      res.status(StatusCodes.FORBIDDEN).send({ message: 'This action is forbidden' })
    }
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).send({ message: `No item with id : ${itemId}` })
  }
}

const getItemById = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  const itemId = req.params.id
  try {
    const item = await Item.findById(itemId).populate('user')
    res.status(StatusCodes.OK).json(itemWithUserResource(item))
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).send({ message: `No item with id : ${itemId}` })
  }
}

const getAllItems = async (req: ApiRequestInterface, res: Response<IItemResource[] | IErrorResponse>): Promise<void> => {
  try {
    const items = await Item.find({})
    const itemsResource: IItemResource[] = itemCollection(items)
    res.status(StatusCodes.OK).json(itemsResource)
  } catch (e) {
    const err = e as Mongoose.Error
    if (err.name === 'MongoError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Mongo Error' })
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

const getItemsByUser = async (req: ApiRequestInterface, res: Response<IItemResource[] | IErrorResponse>): Promise<void> => {
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findOne({ _id: decoded.id })
      .populate('items')
    if (user?.items.length) {
      const itemsResource = itemCollection(user.items)
      res.status(StatusCodes.OK).json(itemsResource)
    } else {
      res.status(StatusCodes.OK).json([])
    }
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).json({ message: (e as Mongoose.Error)?.name })
  }
}

module.exports = {
  create,
  update,
  deleteItem,
  getItemById,
  getAllItems,
  getItemsByUser
}
