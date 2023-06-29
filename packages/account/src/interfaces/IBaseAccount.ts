import { UserOperation } from '@biconomy-devx/core-types'
import { UserOpResponse } from '@biconomy-devx/bundler'
export interface ISmartAccount {
  getSmartAccountAddress(accountIndex: number): Promise<string>
  signUserOp(userOperation: UserOperation): Promise<UserOperation>
  sendUserOp(userOperation: UserOperation): Promise<UserOpResponse>
  sendSignedUserOp(userOperation: UserOperation): Promise<UserOpResponse>
}
