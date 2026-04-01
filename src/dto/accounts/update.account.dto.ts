import type { CreateAccountDto } from './create.account.dto'

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  _id: string;
}
