import { type UserDocument } from '../models/user.model'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_KEY } from '../../config/constants'
import { type IUserResource } from '../resources/user.resource'

export interface UserJwtPayload extends Omit<IUserResource, 'token'>, JwtPayload {}
export const generateJWT = (user: Pick<UserDocument, 'name' | 'id'>): string => {
  return jwt.sign(
    { id: user.id || '', name: user.name || '' },
    JWT_KEY,
    { expiresIn: '1h' }
  )
}

export const getTokenFromHeader = (authorization: string | undefined): string => {
  return authorization?.split(' ')[1] ?? ''
}

export const decodeJwt = (authorization: string | undefined): UserJwtPayload => {
  return jwt.decode(getTokenFromHeader(authorization)) as UserJwtPayload
}
