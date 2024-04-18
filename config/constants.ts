export const JWT_KEY: string = process.env.SECRET_JWT_KEY ?? ''

export const FILES_STORAGE = 'upload/'
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID ?? ''
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? ''
export const AWS_BUCKET_NAME = process.env.S3_BUCKET ?? ''
