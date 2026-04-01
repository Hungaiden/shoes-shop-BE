/* eslint-disable no-undef */
import cloudinary from '../../config/cloudinary'
import streamifier from 'streamifier'


export const uploadOneImage = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) {
          resolve(result.secure_url)
        } else {
          reject(error)
        }
      },
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const uploadMultipleImages = (fileBuffers: Buffer[]): Promise<string[]> => {
  return Promise.all(fileBuffers.map(fileBuffer => uploadOneImage(fileBuffer)))
}
