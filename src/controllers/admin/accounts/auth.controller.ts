import type { Request, Response } from 'express';
import * as accountService from '../../../services/admin/accounts/auth.service';
import * as authService from '../../../services/admin/accounts/auth.service';
import * as paramsTypes from '../../../utils/types/paramsTypes';
import type { myJwtPayload } from '../../../utils/types/jwtTypes';
import type { ResponseDetailSuccess, ResponseFailure } from '../../../utils/types/ResponseTypes';
import { ResponseListSuccess } from '../../../utils/types/ResponseTypes';
import ms from 'ms';
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, userInfo } = await authService.login(email, password);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('365 days'),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('365 days'),
    });
    const response: ResponseDetailSuccess<{
      // tra ve de FE muon luu vao localStorage thi luu
      accessToken: string;
      refreshToken: string;
      userInfo: myJwtPayload;
    }> = {
      code: 200,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
        userInfo,
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(400).json(response);
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, userInfo } = await authService.loginAdmin(email, password);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('365 days'),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('365 days'),
    });
    const response: ResponseDetailSuccess<{
      accessToken: string;
      refreshToken: string;
      userInfo: myJwtPayload;
    }> = {
      code: 200,
      message: 'Đăng nhập admin thành công',
      data: {
        accessToken,
        refreshToken,
        userInfo,
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 403,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message,
      errors: [],
    };
    res.status(403).json(response);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Xoá cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logout API success!' });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const accessToken = await authService.refreshToken(refreshTokenFromCookie);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('365 days'),
    });

    const response: ResponseDetailSuccess<{ accessToken: string }> = {
      code: 200,
      message: 'Refresh Token API success!',
      data: { accessToken },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || 'Refresh Token API Failed',
      errors: [],
    };
    res.status(400).json(response);
  }
};
