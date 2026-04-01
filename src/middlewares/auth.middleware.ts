/* eslint-disable no-undef */
// middleware này đảm nhiệm việc quan trọng: lấy và xác thực JWT accessToken nhận được phía FE có hợp lệ hay không
import { JwtProvider } from '../providers/JwtProvider';
import type { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include jwtDecoded
declare global {
  namespace Express {
    interface Request {
      jwtDecoded?: any;
    }
  }
}
const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  console.log('isAuthorized middleware called');
  // Cách 1: cookie; Cách 2: Authorization header
  const accessTokenFromCookies = req.cookies?.accessToken;
  const authHeader = req.headers?.authorization;
  const accessTokenFromHeaders = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const accessToken = accessTokenFromCookies || accessTokenFromHeaders;
  if (!accessToken) {
    res.status(401).json({
      message: 'Unauthorized! (Token not found)',
    });
    return;
  }

  try {
    // Bước 01: Thực hiện giải mã token xem nó có hợp lệ khoog
    const accessTokenDecoded = await JwtProvider.verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
    );
    // Bước 02: Quan trọng: Nếu như token hợp lệ, cần lưu thoogn tin giải mã được vào req.jwtDecoded để sử dụng cho các tầng cần xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded;

    // Bước 03: Cho phép cái request đi tiếp
    next();
  } catch (error) {
    console.log('Error from authMiddleware', error);

    // TH1: Nếu các accessToken nó bị hết hạn (expired) thì mình cần trả về 1 mã lỗi GONE - 410 cho phía FE biết để gọi api refreshToken
    if (error.message?.includes('jwt expired')) {
      res.status(410).json({ message: 'Cần refresh token' });
      return;
    }

    // Th2: Nếu như accessToken nó k hợp lệ do bất kỳ điều gì khác thì cứ trả về mã 401 cho phía FE xử lý Logout / hoặc gọi API logout tuỳ trường hợp
    res.status(401).json({ message: 'UNAUTHORIZED! Please Login' });
  }
};

const hasRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requesterRole = req.jwtDecoded?.role as string | undefined;

    if (!requesterRole || !allowedRoles.includes(requesterRole)) {
      res.status(403).json({ message: 'FORBIDDEN! You do not have permission.' });
      return;
    }

    next();
  };
};

export const authMiddleware = {
  isAuthorized,
  hasRoles,
};
