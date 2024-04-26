import { type IImage, Item, type ItemDocument } from '../src/models/item.model'
import axios, { type AxiosResponse } from 'axios'
import sharp from 'sharp'
import { AWS_BUCKET_NAME, FILES_STORAGE } from '../config/constants'

const s3 = require('../config/aws.config')
const cron = require('node-cron')

const uploadThumb = async (image: IImage): Promise<IImage> => {
  return await new Promise((resolve, reject) => {
    axios.get(image.src,
      { responseType: 'arraybuffer' }
    )
      .then(async (res: AxiosResponse<Buffer>) => {
        return {
          contentType: res.headers['content-type'],
          sharp: sharp(res.data)
            .resize(200)
        }
      })
      .then(async (res) => {
        const buffer = await res.sharp.toBuffer()
        const uploadParams = {
          Bucket: AWS_BUCKET_NAME,
          Key: FILES_STORAGE + 'thumb_' + image.name,
          Body: buffer,
          ContentType: res.contentType,
          ACL: 'public-read'
        }
        const awsResponse = await s3.upload(uploadParams).promise()
        resolve({
          ...image,
          thumb: awsResponse.Location
        })
      })
      .catch((err) => {
        console.log(`Couldn't process: ${err}`)
        reject(err)
      })
  })
}

const updateItemsImages = async (item: ItemDocument): Promise<void> => {
  const imagesWithThumb: IImage[] = []
  const promises: Array<Promise<IImage | null>> = []
  item?.images?.forEach((image) => {
    if (!image.thumb) {
      promises.push(uploadThumb(image))
    } else {
      imagesWithThumb.push(image)
    }
  })
  await Promise.all(promises).then(function (data: Array<IImage | null>) {
    if (data[0]) {
      imagesWithThumb.push(data[0])
    }
  }).catch(function (err: Error) {
    console.log(err, 'updateItemsImages error')
  })
  item?.set({
    images: imagesWithThumb
  })
  await item?.save()
}
const thumbnails = (): void => {
  cron.schedule('0 */2 * * *', async function () {
    const items = await Item.find(
      { images: { $elemMatch: { thumb: { $exists: false } } } }
    )
    await Promise.all(items.map(async (item) => {
      await updateItemsImages(item)
    }))
    console.log('thumbnails cron')
  })
}

module.exports = thumbnails
