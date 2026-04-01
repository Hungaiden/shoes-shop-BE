/* eslint-disable no-undef */
/* eslint-disable no-unreachable */
import { Account } from '../../../models/accounts/account.model';
import { CreateAccountDto } from '../../../dto/accounts/create.account.dto';
import { UpdateAccountDto } from '../../../dto/accounts/update.account.dto';
import * as paramsTypes from '../../../utils/types/paramsTypes';
import type { JwtPayload } from 'jsonwebtoken';
import { JwtProvider } from '../../../providers/JwtProvider';
import type { myJwtPayload } from '../../../utils/types/jwtTypes';

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Số round để tạo salt

export const login = async (email: string, password: string) => {
  try {
    // Tìm tài khoản theo email
    const account = await Account.findOne({
      email: email,
      deleted: false,
    });
    if (!account) {
      throw new Error('Tài khoản không tồn tại!');
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new Error('Mật khẩu không đúng!');
    }

    if (account.deleted) {
      throw new Error('Tài khoản đã bị xóa!');
      return;
    }
    const userInfo: myJwtPayload = {
      userId: account._id.toString(),
      email: account.email,
      role: account.role_id,
      fullName: account.fullName,
    };

    // Tạo access token và refresh token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '365d',
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
      '365d',
    );
    return { accessToken, refreshToken, userInfo };
  } catch (error) {
    throw new Error(error.message || 'Đăng nhập thất bại!');
  }
};

export const loginAdmin = async (email: string, password: string) => {
  const { accessToken, refreshToken, userInfo } = await login(email, password);

  if (userInfo.role !== 'admin') {
    throw new Error('Tài khoản không có quyền truy cập trang admin!');
  }

  return { accessToken, refreshToken, userInfo };
};

export const refreshToken = async (refreshTokenFromCookie: string) => {
  const refreshTokenDecoded = await JwtProvider.verifyToken(
    // refreshTokenFromCookie, // Dung token theo cach 1 o tren
    refreshTokenFromCookie, // Dung token theo cach 2 o tren
    process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
  );
  const userInfo = {
    userId: (refreshTokenDecoded as JwtPayload).userId,
    email: (refreshTokenDecoded as JwtPayload).email,
    role: (refreshTokenDecoded as JwtPayload).role,
    fullName: (refreshTokenDecoded as myJwtPayload).fullName,
  };
  const accessToken = await JwtProvider.generateToken(
    userInfo,
    process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
    '365d',
  );
  return accessToken;
};
