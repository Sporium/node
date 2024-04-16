import { type IErrorResponse, type ReqWithFiles } from '../types/types'
import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type Mongoose from 'mongoose'
import { FILES_STORAGE } from '../../config/constants'

const uploadImage = async (req: ReqWithFiles<'image'>, res: Response<IErrorResponse>): Promise<void> => {
  try {
    const { image } = req.files
    const uploadPath = FILES_STORAGE + image.name
    image.mv(uploadPath, function (err: string) {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
      }
      res.status(StatusCodes.CREATED).json()
    })
  } catch (e) {
    const err = e as Mongoose.Error
    if (err.name === 'MongoError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Mongo Error' })
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err })
  }
}

module.exports = {
  uploadImage
}
