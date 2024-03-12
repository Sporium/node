import { type NextFunction, type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JWT_KEY } from '../config/constants'
import jwt from 'jsonwebtoken'

const getTokenFromHeader = (authorization: string | undefined): string => {
  return authorization?.split(' ')[1] ?? ''
}
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = getTokenFromHeader(req.headers.authorization)
  if (token) {
    jwt.verify(token, JWT_KEY || '', (err: jwt.VerifyErrors | null) => {
      if (err) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send({ message: 'Invalid token' })
      }
      next()
    })
  } else {
    res.status(StatusCodes.FORBIDDEN).json({ message: 'Un Authorized' })
  }
}

module.exports = authMiddleware
