import { type Request } from 'express'
import { type Multer as MulterNamed } from 'multer'
import { type Readable } from 'stream'

export interface IErrorResponse {
  message: Record<string, any>
  | string
}
export interface ApiRequestInterface<ReqDictionary = Record<string, unknown>, ResBody = Record<string, unknown>, ReqBody = Record<string, unknown>, ReqQuery = Record<string, unknown>> extends
  Request<ReqDictionary, ResBody, ReqBody, ReqQuery> {}

export type ImageFormatType = 'png' | 'jpg' | 'jpeg'

export interface ResizeQuery {
  width: string
  height: string
  filename: string
  format: ImageFormatType
  [key: string]: any
}

declare global {
  namespace Express {
    interface Multer extends MulterNamed {
      File: {
        fieldname: string
        /** Name of the file on the uploader's computer. */
        originalname: string
        /**
         * Value of the `Content-Transfer-Encoding` header for this file.
         * @deprecated since July 2015
         * @see RFC 7578, Section 4.7
         */
        encoding: string
        /** Value of the `Content-Type` header for this file. */
        mimetype: string
        /** Size of the file in bytes. */
        size: number
        /**
         * A readable stream of this file. Only available to the `_handleFile`
         * callback for custom `StorageEngine`s.
         */
        stream: Readable
        /** `DiskStorage` only: Directory to which this file has been uploaded. */
        destination: string
        /** `DiskStorage` only: Name of this file within `destination`. */
        filename: string
        /** `DiskStorage` only: Full path to the uploaded file. */
        path: string
        /** `MemoryStorage` only: A Buffer containing the entire file. */
        buffer: Buffer
      }
    }
  }
}

export interface MutlerFileFilterCallback {
  (error: Error): void
  (error: null, acceptFile: boolean): void
}
