import mongoose, { type Mongoose } from 'mongoose'

const connectDB = async (url: string = 'mongodb://mongo:27017/DB'): Promise<Mongoose> => {
  const options: mongoose.ConnectOptions = {
    autoIndex: true
  }
  return await mongoose.connect(
    url,
    options
  )
}
module.exports = connectDB
