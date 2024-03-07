import mongoose from "mongoose";

const connectDB = (url: string = 'mongodb://mongo:27017/node_DB') => {
    return mongoose.connect(
        url,
        {
            autoIndex: true,
        } as mongoose.ConnectOptions
    )
}
module.exports = connectDB
