import express, { type Express } from 'express'
import 'dotenv/config'
import mongoose from 'mongoose'
import type * as core from 'express-serve-static-core'
const connectDB = require('./config/db-connect')

const app: Express = express()
const port = process.env.PORT
const routes: core.Router = require('./src/routes')
const fileUpload = require('express-fileupload')

mongoose.set('strictQuery', false)

// middlewares
app.use(express.json())
app.use(fileUpload({
  tempFileDir: './tempStorage'
}))
// routes
app.use('/api/v1', routes)
const start = async (): Promise<void> => {
  try {
    await connectDB(process.env.MONGODB_URI)
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
    }).on('error', err => {
      console.error(err)
      return err
    })
  } catch (e) {
    console.error(e)
  }
}
start()
