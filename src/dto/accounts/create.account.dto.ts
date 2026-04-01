export enum AccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}

export interface CreateAccountDto {
  fullName: string;
  email: string;
  password: string;
  token?: string;
  phone?: string;
  avatar?: string;
  role_id: string;
  status?: AccountStatus;
}
