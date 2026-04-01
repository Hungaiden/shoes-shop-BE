import type { Request, Response } from 'express';
import * as accountService from '../../../services/admin/accounts/account.service';
import type * as paramsTypes from '../../../utils/types/paramsTypes';
import type {
  ResponseDetailSuccess,
  ResponseListSuccess,
  ResponseFailure,
} from '../../../utils/types/ResponseTypes';

export const createAccount = async (req: Request, res: Response) => {
  try {
    const account = await accountService.createAccount(req.body);
    const response: ResponseDetailSuccess<typeof account> = {
      code: 201,
      message: 'Tạo tài khoản thành công',
      data: account,
    };
    res.status(201).json(response);
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

export const registerAccount = async (req: Request, res: Response) => {
  try {
    const account = await accountService.registerAccount(req.body);
    const response: ResponseDetailSuccess<typeof account> = {
      code: 201,
      message: 'Đăng ký tài khoản thành công',
      data: account,
    };
    res.status(201).json(response);
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

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const filter = {
      status: req.query.status as string,
    };
    const searchParams: paramsTypes.SearchParams = {
      keyword: req.query.keyword as string,
      field: req.query.field as string,
    };

    const sortParams: paramsTypes.SortParams = {
      sortBy: req.query.sortBy as string,
      sortType: req.query.sortType as paramsTypes.SORT_TYPE,
    };

    const paginateParams: paramsTypes.PaginateParams = {
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await accountService.getAllAccounts(
      searchParams,
      sortParams,
      paginateParams,
      filter,
    );

    if (result.accounts.length === 0) {
      const response: ResponseListSuccess<typeof result.accounts> = {
        code: 200,
        message: 'Không tìm thấy tài khoản nào',
        data: {
          hits: [],
          pagination: {
            totalRows: 0,
            totalPages: 0,
          },
        },
      };
      res.status(200).json(response);
      return;
    }

    const response: ResponseListSuccess<typeof result.accounts> = {
      code: 200,
      message: 'Lấy danh sách tài khoản thành công',
      data: {
        hits: result.accounts,
        pagination: {
          totalRows: result.totalRows,
          totalPages: result.totalPages,
        },
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: 'Lỗi khi lấy danh sách tài khoản!',
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    if (!account) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Không tìm thấy tài khoản',
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof account> = {
      code: 200,
      message: 'Lấy thông tin tài khoản thành công',
      data: account,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: 'Lỗi khi lấy thông tin tài khoản!',
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const updatedAccount = await accountService.updateAccount(req.params.id, req.body);
    if (!updatedAccount) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Không tìm thấy tài khoản',
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof updatedAccount> = {
      code: 200,
      message: 'Cập nhật tài khoản thành công',
      data: updatedAccount,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: 'Lỗi khi cập nhật tài khoản!',
      errors: [],
    };
    res.status(500).json(response);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const deletedAccount = await accountService.deleteAccount(req.params.id);
    if (!deletedAccount) {
      const response: ResponseFailure = {
        code: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: 'Không tìm thấy tài khoản',
        errors: [],
      };
      res.status(404).json(response);
      return;
    }

    const response: ResponseDetailSuccess<typeof deletedAccount> = {
      code: 200,
      message: 'Xóa tài khoản thành công',
      data: deletedAccount,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: 'Lỗi khi xóa tài khoản!',
      errors: [],
    };
    res.status(500).json(response);
  }
};
