const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  mongoUrl: process.env.MONGODB_URI,
  port: process.env.PORT
}
