import { Response} from "express";
import {StatusCodes} from "http-status-codes";
import {IUser, UserDocument} from '../models/user.model'
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

async function comparePassword(plaintextPassword: string, hash: string) {
    return await bcrypt.compare(plaintextPassword, hash);
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

const signIn = async (req: ApiRequestInterface<{}, {}, {name: string, password: string}>, res: Response<IUserResource | IErrorResponse>) => {
    try {
        let { name, password } = req.body;
        let existingUser: UserDocument | null;
        existingUser = await User.findOne({ name });
        if (existingUser) {
            const isValid = await comparePassword(password, existingUser.password)
            const token = generateJWT(existingUser)
            if (isValid) {
                res.status(StatusCodes.OK).json({...userResource(existingUser, token) as IUserResource})
            }
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json({message: "Invalid username or password"})
        }
    }
    catch (e) {
        const err = e as Error
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
    }
}

const getAllUsers = async (req: Request, res: Response<IUser | IErrorResponse>) => {
    try {
        const users = await User.find({})
        res.status(StatusCodes.OK).json(usersCollection(users))
    }
    catch (e) {
        const err = e as Error
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err})
    }
}


module.exports = {
    register,
    signIn,
    getAllUsers,
}