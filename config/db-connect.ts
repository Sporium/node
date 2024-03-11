import mongoose from 'mongoose'

const connectDB = async (url: string = 'mongodb://mongo:27017/node_DB') => {
  return await mongoose.connect(
    url,
    {
      autoIndex: true
    } as mongoose.ConnectOptions
  )
}
module.exports = connectDB
