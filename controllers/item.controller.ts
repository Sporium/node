import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type * as Mongoose from 'mongoose'
import { type ApiRequestInterface, type IErrorResponse } from '../types/types'
import { type IItem } from '../models/item.model'
import { type IItemResource } from '../resources/item.resource'
import { decodeJwt } from '../helpers'
import { Item, itemCollection } from '../models/item.model'
import { type UserDocument } from '../models/user.model'
const { User } = require('../models/user.model')
const itemResource = require('../resources/item.resource')

const create = async (req: ApiRequestInterface<{}, {}, IItem>, res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  try {
    const item = await Item.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price
    })
    const token = decodeJwt(req.headers.authorization)
    await User.findOneAndUpdate({ _id: token.id }, { $push: { items: item._id } }, { new: true, useFindAndModify: true }) //
    await item.save()
    res.status(StatusCodes.CREATED).json({ ...itemResource(item) as IItemResource })
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
    const filter = { _id: req.params.id }
    const opts = { new: true }

    const changed = await Item.findOneAndUpdate(filter, req.body, opts)
    const itemsResource: IItemResource = itemResource(changed)
    res.status(StatusCodes.OK).json(itemsResource)
  } catch (e) {
    res.status(StatusCodes.NOT_FOUND).send({ message: `No item with id : ${itemID}` })
  }
}

const deleteItem = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItem | IErrorResponse>) => {
  const itemId = req.params.id
  try {
    const deleted = await Item.findOneAndDelete({ _id: itemId })
    const itemsResource: IItemResource = itemResource(deleted)
    res.status(StatusCodes.OK).json(itemsResource)
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
    const user: UserDocument = await User.findOne({ _id: decoded.id })
      .populate('items')
    if (user?.items.length) {
      const itemsResource = itemCollection(user?.items)
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
  getAllItems,
  getItemsByUser
}
