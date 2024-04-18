import { type Request } from 'express'
import { type UploadedFile } from 'express-fileupload'

export interface IErrorResponse {
  message: Record<string, any>
  | string
}
export interface ApiRequestInterface<ReqDictionary = Record<string, unknown>, ResBody = Record<string, unknown>, ReqBody = Record<string, unknown>, ReqQuery = Record<string, unknown>> extends
  Request<ReqDictionary, ResBody, ReqBody, ReqQuery> {}

export interface ReqWithFiles<ReqDictionary = Record<string, unknown>, ResBody = Record<string, unknown>, ReqBody = Record<string, unknown>, ReqQuery = Record<string, unknown>, T> extends ApiRequestInterface<ReqDictionary, ResBody, ReqBody, ReqQuery> {
  files?: {
    [Key in T]: UploadedFile
  }
}
