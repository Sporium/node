import {
  type ApiRequestInterface,
  type IErrorResponse,
  type ImageFormatType,
  type MutlerFileFilterCallback,
  type ResizeQuery
} from '../types/types'
import { StatusCodes } from 'http-status-codes'
import { type Request, type Response } from 'express'
import * as fs from 'fs'
import Multer from 'multer'
interface ImageRequestI extends ApiRequestInterface<{}, {}, {}, ResizeQuery> {
  file: Express.Multer['File']
}
const formSize = (data: ResizeQuery): { format: ImageFormatType, width: number, height: number } => {
  const defaultSize = '200'
  const width = parseInt(data.width || defaultSize)
  const height = parseInt(data.height || defaultSize)
  return { format: data.format, width, height }
}
const getFilePath = (req: ImageRequestI, res: Response): string => {
  const image: ImageRequestI['file'] = req.file
  if (!image) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please upload image' })
  }
  if (!/^image/.test(image?.mimetype)) {
    res.status(StatusCodes.BAD_REQUEST)
  }
  const fileType = image.originalname.split('.').pop()
  const filePath = image.path + '.' + (req.query.format || fileType)
  fs.rename(image.path, filePath, () => {
    console.log('\nFile Renamed!\n')
  })
  return filePath
}
const whitelist = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]

const multerUploader = Multer({
  dest: 'public/images',
  limits: { fieldSize: 20000 },
  fileFilter: (req: Request, file: Express.Multer['File'], cb: MutlerFileFilterCallback) => {
    if (!whitelist.includes(file.mimetype)) {
      cb(new Error('file is not allowed')); return
    }
    cb(null, true)
  }
})

const uploadImage = async (req: ImageRequestI, res: Response<IErrorResponse>): Promise<void> => {
  const uploadSave = multerUploader.single('image')
  const filePath = getFilePath(req, res)
  console.log(filePath, 'path')
  if (Object.keys(req.query).length) {
    const { width, height, format } = formSize(req.query)
    // await addWatermark(filePath)
    // resize(filePath, format, width, height).pipe(res)
  } else {
    res.sendStatus(StatusCodes.OK).json()
  }
}

module.exports = {
  uploadImage
}
