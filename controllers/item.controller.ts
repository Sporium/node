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

export interface UpdateItemParams extends IItem {
    id: string
}
const update = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItem | IErrorResponse>) => {
    const itemID = req.params.id
    const filter = { _id: '65eec5f5a29d90f19855d464' };
    const opts = { new: true };

    let changed = await Item.findOneAndUpdate(filter, req.body, opts);
    if (changed) {
        res.status(StatusCodes.OK).json(itemResource(changed))
    } else {
        res.status(StatusCodes.NOT_FOUND).send({message: `No item with id : ${itemID}`});
    }
}

const deleteItem = async (req: ApiRequestInterface<UpdateItemParams>, res: Response<IItem | IErrorResponse>) => {
    const itemId = req.params.id
    const deleted = await Item.findOneAndDelete({ _id: itemId })
    if (deleted) {
        res.status(StatusCodes.OK).json(itemResource(deleted))
    } else {
        res.status(StatusCodes.NOT_FOUND).send({message: `No item with id : ${itemId}`});
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

const getItemsByUser =  async (req: ApiRequestInterface, res: Response<IItemResource | IErrorResponse>) => {
        try {
            const decoded = decodeJwt(req?.headers.authorization)
            const user = await User.findOne({_id: decoded.id})
                .populate('items');
            res.status(StatusCodes.OK).json(itemCollection(user?.items))
        }
        catch (e) {
            res.status(StatusCodes.NOT_FOUND).json({message: (e as Mongoose.Error)?.name});
        }
}

module.exports = {
    create,
    update,
    deleteItem,
    getAllItems,
    getItemsByUser,
}