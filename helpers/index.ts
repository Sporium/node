import {UserDocument} from "../models/user.model";
import jwt from "jsonwebtoken";
import {JWT_KEY} from "../config/constants";

export const generateJWT = (user: Pick<UserDocument,'name'| 'id'>) => {
    return jwt.sign(
        { id: user.id || '', name: user.name || ''},
        JWT_KEY,
        { expiresIn: "1h" }
    );
}