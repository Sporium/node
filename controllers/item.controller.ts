import { Response} from "express";
import {StatusCodes} from "http-status-codes";
import * as Mongoose from "mongoose";
import {ApiRequestInterface, IErrorResponse} from "../types/types";
import {IItem} from "../models/item.model";
import {IItemResource} from "../resources/item.resource";
import {decodeJwt} from "../helpers";
const {Item, itemCollection} = require('../models/item.model')
const itemResource = require('../resources/item.resource')
const {User} = require('../models/user.model')


const create = async (req: ApiRequestInterface<{},{},IItem>, res: Response<IItemResource | IErrorResponse>) => {
    try {
        const item = await Item.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        })
        const token = decodeJwt(req.headers.authorization)
        await User.findOneAndUpdate({ _id: token.id }, {$push: {items: item._id}}, { new: true, useFindAndModify: true });  //
        await item.save()
        res.status(StatusCodes.CREATED).json({...itemResource(item) as IItemResource})

    }
    catch (e) {
        const err = e as Mongoose.Error
        if (err.name === 'MongoError' ) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Mongo Error'})
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err})
    }
}

const getAllItems = async (req: ApiRequestInterface, res: Response<IItemResource | IErrorResponse>) => {
    try {
        const items = await Item.find({})
        res.status(StatusCodes.OK).json(itemCollection(items))
    }
    catch (e) {
        const err = e as Mongoose.Error
        if (err.name === 'MongoError' ) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Mongo Error'})
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err})
    }
}


module.exports = {
    create,
    getAllItems,
}