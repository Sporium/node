import {NextFunction} from "express";
import {StatusCodes} from "http-status-codes";
import {JWT_KEY} from "../config/constants";
import jwt from "jsonwebtoken";
import {Request, Response} from 'express';


const getTokenFromHeader = (authorization: string | undefined): string => {
    return authorization?.split(' ')[1] as string;
}
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromHeader(req.headers.authorization)
    if (token) {
        jwt.verify(token, JWT_KEY || '', async (err:  jwt.VerifyErrors | null) => {
            if (err) {
                return res
                    .status(StatusCodes.FORBIDDEN)
                    .send({ message: "Invalid token" })
            }
            next()
        })
    } else {
        res.status(StatusCodes.FORBIDDEN).json({ message: "Un Authorized" })
    }
}

module.exports = authMiddleware