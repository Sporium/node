import { Response} from "express";
import {StatusCodes} from "http-status-codes";
import {IUser} from '../models/user.model'
import * as Mongoose from "mongoose";
import {ApiRequestInterface, IErrorResponse} from "../types/types";
import {IUserResource} from "../resources/user.resource";
import {generateJWT} from "../helpers";
const {User, usersCollection} = require('../models/user.model')
const userResource = require('../resources/user.resource')

const bcrypt = require("bcrypt")

async function generatePass(plaintextPassword: string) {
    return await bcrypt.hash(plaintextPassword, 10);
}
const register = async (req: ApiRequestInterface<{},{},IUser>, res: Response<IUserResource | IErrorResponse>) => {
    try {
        const pass = await generatePass(req.body.password)
        const user = await new User({
            name: req.body.name,
            password: pass,
        })
        const token = generateJWT({id: user._id, name: user.name})
        await user.save()
        res.status(StatusCodes.CREATED).json({...userResource(user, token) as IUserResource})

    }
    catch (e) {
        const err = e as Mongoose.Error
        if (err.name === 'MongoError' ) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Mongo Error'})
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err})
    }
}
const getAllUsers = async (req: Request, res: Response<IUser | IErrorResponse>) => {
    try {
        const users = await User.find({})
        console.log(usersCollection, 'asd')
        res.status(StatusCodes.OK).json(usersCollection(users))
    }
    catch (e) {
        const err = e as Error
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err})
    }
}


module.exports = {
    register,
    getAllUsers,
}