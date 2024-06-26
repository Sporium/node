import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type * as Mongoose from 'mongoose'
import { type ApiRequestInterface, type IErrorResponse, type ReqWithFiles } from '../types/types'
import { type IImage, type IItem } from '../models/item.model'
import { type IItemResource, itemWithUserResource } from '../resources/item.resource'
import { decodeJwt } from '../helpers'
import { Item, itemCollection } from '../models/item.model'
import { User } from '../models/user.model'
import { itemResource } from '../resources/item.resource'
import { AWS_BUCKET_NAME, FILES_STORAGE } from '../../config/constants'
import { type UploadedFile } from 'express-fileupload'
const s3 = require('../../config/aws.config')
const create = async (
  req: ReqWithFiles<UpdateItemParams, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, 'image'>,
  res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findById(decoded.id)
    const formedImages = await formImageData(req)
    const item = await Item.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      images: formedImages,
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

const update = async (
  req: ReqWithFiles<UpdateItemParams, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, `image[${number}]`>,
  res: Response<IItemResource | IErrorResponse>): Promise<void> => {
  const itemID = req.params.id
  try {
    const decoded = decodeJwt(req?.headers.authorization)
    const user = await User.findById(decoded.id)
    const item = await Item.findById(itemID)
    const formedImages = await formImageData(req)
    if (decoded.id === item?.user?._id.toString()) {
      item?.set({
        ...req.body,
        images: [...(Array.isArray(item.images) ? item.images : []), ...formedImages],
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

export interface AWSData {
  ETag: string
  ServerSideEncryption: string
  VersionId: string
  Location: string
  key: string
  Key: string
  Bucket: string
}
const uploadToAWS = async (image: UploadedFile | undefined): Promise<AWSData | null> => {
  if (image) {
    const uploadParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: FILES_STORAGE + image.name,
      Body: image.data,
      ContentType: image.mimetype,
      ACL: 'public-read'
    }
    return s3.upload(uploadParams).promise()
  }
  return null
}

const formImageData = async (
  req: ReqWithFiles<UpdateItemParams, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, `image[${number}]`>
): Promise<IImage[]> => {
  let uploadedFiles: AWSData[] | null = null
  if (req?.files) {
    const promises: Array<Promise<AWSData | null>> = []
    Object.keys(req?.files).forEach((key, index) => {
      promises.push(uploadToAWS(req?.files?.[`image[${index}]`]))
    })
    await Promise.all(promises).then(function (data: Array<AWSData | null>) {
      uploadedFiles = data.filter(Boolean) as AWSData[]
    }).catch(function (err: Error) {
      console.log(err)
    })
  }
  return (uploadedFiles ?? [])?.map((el: AWSData) => {
    return {
      name: el.key.replace(FILES_STORAGE, ''),
      src: el.Location
    }
  })
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
