import { Account } from '../../../models/accounts/account.model';
import type { CreateAccountDto } from '../../../dto/accounts/create.account.dto';
import type { UpdateAccountDto } from '../../../dto/accounts/update.account.dto';
import * as paramsTypes from '../../../utils/types/paramsTypes';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Số round để tạo salt

// Hàm tạo Account
export const createAccount = async (data: CreateAccountDto) => {
  // Kiểm tra nếu email đã tồn tại
  const existingAccount = await Account.findOne({ email: data.email });
  if (existingAccount) {
    throw new Error('Email đã tồn tại!');
  }

  // Hash password trước khi lưu
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Tạo account mới với password đã được hash
  const newAccount = new Account({
    ...data,
    password: hashedPassword,
  });
  await newAccount.save();
  return newAccount;
};

// Public registration flow for client users.
export const registerAccount = async (data: Partial<CreateAccountDto>) => {
  if (!data.fullName || !data.email || !data.password) {
    throw new Error('Thiếu thông tin bắt buộc để đăng ký!');
  }

  const existingAccount = await Account.findOne({ email: data.email });
  if (existingAccount) {
    throw new Error('Email đã tồn tại!');
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const newAccount = new Account({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    avatar: data.avatar,
    role_id: 'customer',
    status: 'active',
  });

  await newAccount.save();
  return newAccount;
};

// Hàm lấy tất cả Account
export const getAllAccounts = async (
  searchParams?: paramsTypes.SearchParams,
  sortParams?: paramsTypes.SortParams,
  paginateParams?: paramsTypes.PaginateParams,
  filter?: { status: any },
) => {
  try {
    // Điều kiện cơ bản
    const query: any = { deleted: false };
    if (filter.status) query.status = filter.status;
    // Tìm kiếm theo từ khóa
    if (searchParams?.keyword && searchParams?.field) {
      query[searchParams.field] = {
        $regex: searchParams.keyword,
        $options: 'i',
      };
    }

    // Phân trang
    const offset = paginateParams?.offset || 0;
    const limit = paginateParams?.limit || 10;

    // Sắp xếp
    const sortQuery: any = {};
    if (sortParams?.sortBy) {
      sortQuery[sortParams.sortBy] = sortParams.sortType === paramsTypes.SORT_TYPE.ASC ? 1 : -1;
    }

    // Truy vấn MongoDB
    const accounts = await Account.find(query).skip(offset).limit(limit).sort(sortQuery).lean();
    const totalRows = await Account.countDocuments(query);
    const totalPages = Math.ceil(totalRows / limit);

    return { accounts, totalRows, totalPages };
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách tài khoản!');
  }
};

// Hàm lấy Account theo ID
export const getAccountById = async (id: string) => {
  try {
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });
    return account;
  } catch (error) {
    throw new Error('Lỗi khi lấy thông tin tài khoản!');
  }
};

// Hàm cập nhật Account
export const updateAccount = async (id: string, data: UpdateAccountDto) => {
  try {
    // Nếu có cập nhật password thì hash password mới
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updatedAccount = await Account.findOneAndUpdate({ _id: id, deleted: false }, data, {
      new: true,
    });
    return updatedAccount;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật tài khoản!');
  }
};

// Hàm xóa Account (mềm)
export const deleteAccount = async (id: string) => {
  try {
    const deletedAccount = await Account.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedAccount;
  } catch (error) {
    throw new Error('Lỗi khi xóa tài khoản!');
  }
};
