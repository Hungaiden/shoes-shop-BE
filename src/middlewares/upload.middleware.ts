import type { Request, Response, NextFunction } from 'express'
import { uploadOneImage, uploadMultipleImages } from '../services/admin/cloudinary.service'

export const uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next()
  }

  try {
    const imageUrl = await uploadOneImage(req.file.buffer)
    req.body[req.file.fieldname] = imageUrl
    next()
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error })
  }
}

export const uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-undef
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    return next()
  }

  try {
    const imageUrls = await uploadMultipleImages(files.map((file) => file.buffer))
    req.body[files[0].fieldname] = imageUrls
    next()
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error })
  }
}