import multer from 'multer'

const storage = multer.memoryStorage() // Lưu file vào bộ nhớ RAM

const upload = multer({ storage })

export default upload
