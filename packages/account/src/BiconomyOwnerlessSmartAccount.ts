import { ethers} from 'ethers'
import {
  BiconomySmartAccountConfig
} from './utils/Types'
import { UserOperation } from '@biconomy/core-types'

import { IBiconomySmartAccount } from 'interfaces/IBiconomySmartAccount'
import { BiconomySmartAccount } from './BiconomySmartAccount'

export class BiconomyOwnerlessSmartAccount
  extends BiconomySmartAccount
  implements IBiconomySmartAccount
{
  constructor(readonly biconomySmartAccountConfig: BiconomySmartAccountConfig) {
    super(biconomySmartAccountConfig)
  }

  async signUserOp(userOp: Partial<UserOperation>): Promise<UserOperation> {
    userOp = await super.signUserOp(userOp)
    let signatureWithModuleAddress = ethers.utils.defaultAbiCoder.encode(
      ['bytes', 'address'],
      [userOp.signature, this.getSmartAccountInfo().ecdsaModuleAddress]
    )
    userOp.signature = signatureWithModuleAddress
    return userOp as UserOperation
  }

  getDummySignature(): string {
    return '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000d9cf3caaa21db25f16ad6db43eb9932ab77c8e76000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000'
  }

  protected async setInitCode(accountIndex = 0): Promise<string> {
    const factoryInstance = this.getFactoryInstance()
    const ecdsaModuleRegistryAbi = 'function initForSmartAccount(address owner)'
    const ecdsaModuleRegistryInterface = new ethers.utils.Interface([ecdsaModuleRegistryAbi])
    const ecdsaOwnershipInitData = ecdsaModuleRegistryInterface.encodeFunctionData(
      'initForSmartAccount',
      [this.owner]
    )
    this.initCode = ethers.utils.hexConcat([
      factoryInstance.address,
      factoryInstance.interface.encodeFunctionData('deployCounterFactualAccount', [
        this.getSmartAccountInfo().ecdsaModuleAddress,
        ecdsaOwnershipInitData,
        accountIndex
      ])
    ])
    return this.initCode
  }
}
