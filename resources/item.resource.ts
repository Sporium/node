import {ItemDocument} from "../models/item.model";

export interface IItemResource extends Pick<ItemDocument, 'name' | 'description' | 'price'> {
    id: string
}

function itemResource(item: ItemDocument): IItemResource {
    return {
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
    }
}

module.exports = itemResource