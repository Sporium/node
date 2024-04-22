'use strict'
const Bluebird = require('bluebird')
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const { mongoUrl } = require('../migrate-mongo-config.ts')
const url = mongoUrl
Bluebird.promisifyAll(mongoClient)
module.exports.up = async next => {
  let mClient = null
  return await mongoClient.connect(url)
    .then(client => {
      mClient = client
      return client.db()
    })
    .then(async db => {
      const Items = db.collection('items')
      await Items.updateMany({
      }, {
        $set: {
          images:
                  [
                    {
                      name: 'placeholder.jpeg',
                      src: 'https://uk.wikipedia.org/wiki/%D0%A4%D0%B0%D0%B9%D0%BB:Grosser_Panda.JPG'
                    }
                  ]
        }
      }, { upsert: true })
    })
    .then(() => {
      mClient.close()
      return next()
    })
    .catch(err => {
      console.log(err, 'catch')
      next(err)
    })
}

module.exports.down = async next => {
  let mClient = null
  return await mongoClient
    .connect(url)
    .then(client => {
      mClient = client
      return client.db()
    })
    .then(async db =>
      await db.collection('items').updateMany(
        {
          images: { $exists: true }
        },
        {
          $unset: { images: [] }
        },
        { multi: true }
      ))
    .then(() => {
      mClient.close()
      return next()
    })
    .catch(err => next(err))
}
