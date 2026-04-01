import type { Request, Response } from 'express'
import * as uploadService from '../../services/admin/upload.service'
import type {
  ResponseDetailSuccess,
  ResponseFailure,
} from '../../utils/types/ResponseTypes'

export const uploadSingle = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      const response: ResponseFailure = {
        code: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'No file uploaded',
        errors: [],
      }
      res.status(400).json(response)
      return 
    }

    const imageUrl = await uploadService.uploadOneImage(req.file.buffer)

    const response: ResponseDetailSuccess<{ url: string }> = {
      code: 200,
      message: 'Upload successful',
      data: { url: imageUrl },
    }
    res.status(200).json(response)
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Upload failed',
      errors: [],
    }
    res.status(500).json(response)
  }
}

export const uploadMultiple = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      const response: ResponseFailure = {
        code: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'No files uploaded',
        errors: [],
      }
      res.status(400).json(response)
      return 
    }

    const imageUrls = await uploadService.uploadMultipleImages(
      files.map((file) => file.buffer),
    )

    const response: ResponseDetailSuccess<{ urls: string[] }> = {
      code: 200,
      message: 'Upload successful',
      data: { urls: imageUrls },
    }
    res.status(200).json(response)
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Upload failed',
      errors: [],
    }
    res.status(500).json(response)
  }
}
