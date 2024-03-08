import mongoose, { Schema } from "mongoose";
import * as Mongoose from "mongoose";
const itemResource = require('../resources/item.resource')
export interface IItem {
    name: string
    price: number
    description?: string
}

export interface ItemDocument extends IItem, Mongoose.Document {
    id: string | number
}



const ItemSchema = new Schema<ItemDocument>({
    name: { type: String, required: [true, 'Name is required'], maxLength: 20, unique: true },
    price: { type: Number, required: [true, 'Price is required'] },
    description: { type: String, },
})

const itemCollection = (items: ItemDocument[]) => {
    return items.map(item => itemResource(item))
}
module.exports = {
    Item: mongoose.model<ItemDocument>('Item', ItemSchema),
    itemCollection
}