// Author: TrungQuanDev: https://youtube.com/@trungquandev
import type { SignOptions, JwtPayload } from 'jsonwebtoken'
import JWT from 'jsonwebtoken'
import type { myJwtPayload } from '../utils/types/jwtTypes'
/**
 * Kiểu dữ liệu cho thông tin người dùng đưa vào JWT
 * Có thể mở rộng tùy vào dữ liệu bạn muốn lưu trong token
 */
/**
 * Function to generate a JWT token - cần 3 tham số:
 * @param userInfo - thông tin người dùng
 * @param secretSignature - chuỗi bí mật để mã hóa token
 * @param tokenLife - thời gian sống của token (VD: "1h", "7d")
 */
const generateToken = async (
  userInfo: myJwtPayload,
  secretSignature: string,
  tokenLife: string | number,
): Promise<string> => {
  try {
    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn: tokenLife as SignOptions['expiresIn'],
    }
    return JWT.sign(userInfo, secretSignature, options)
  } catch (error: any) {
    throw new Error(error.message || 'Không thể tạo token')
  }
}

/**
 * Function kiểm tra token có hợp lệ không
 * @param token - chuỗi token JWT
 * @param secretSignature - chuỗi bí mật để giải mã
 */
const verifyToken = async (
  token: string,
  secretSignature: string,
): Promise<string | JwtPayload> => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error: any) {
    throw new Error(error.message || 'Token verification failed')
  }
}


export const JwtProvider = {
  generateToken,
  verifyToken,
}
