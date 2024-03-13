import { type Request } from 'express'

export interface IErrorResponse {
  message: Record<string, any>
  | string
}
export interface ApiRequestInterface<ReqDictionary = Record<string, unknown>, ResBody = Record<string, unknown>, ReqBody = Record<string, unknown>, ReqQuery = Record<string, unknown>> extends
  Request<ReqDictionary, ResBody, ReqBody, ReqQuery> {}
