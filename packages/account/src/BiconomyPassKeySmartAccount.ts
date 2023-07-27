import { ethers } from 'ethers'
import elliptic from 'elliptic';
import {
  BiconomySmartAccountConfig,
} from './utils/Types'
import { UserOperation } from '@biconomy/core-types'
import { IBiconomySmartAccount } from 'interfaces/IBiconomySmartAccount'
import { BiconomySmartAccount } from './BiconomySmartAccount'
import { SmartAccountByOwnerDto, SmartAccountsResponse } from '@biconomy/node-client'
import { ISmartAccount } from '@biconomy/node-client'
import { Logger } from '@biconomy/common'

export class BiconomyPassKeySmartAccount
  extends BiconomySmartAccount
  implements IBiconomySmartAccount {

  constructor(readonly biconomySmartAccountConfig: BiconomySmartAccountConfig) {
    super(biconomySmartAccountConfig)
  }

  async getSmartAccountAddress(accountIndex = 0): Promise<string> {
    try {
      console.log('adding in pass key thing');

      let smartAccountsList: ISmartAccount[] = (
        await this.getSmartAccountsByOwner({
          chainId: this.chainId,
          pubKeyX: this.biconomySmartAccountConfig.pubKeyX,
          pubKeyY: this.biconomySmartAccountConfig.pubKeyY,
          keyId: this.biconomySmartAccountConfig.keyId,
          index: accountIndex
        })
      ).data
      if (!smartAccountsList)
        throw new Error(
          'Failed to get smart account address. Please raise an issue on https://github.com/bcnmy/biconomy-client-sdk for further investigation.'
        )
      smartAccountsList = smartAccountsList.filter((smartAccount: ISmartAccount) => {
        return accountIndex === smartAccount.index
      })
      if (smartAccountsList.length === 0)
        throw new Error(
          'Failed to get smart account address. Please raise an issue on https://github.com/bcnmy/biconomy-client-sdk for further investigation.'
        )
      this.setSmartAcountInfo(smartAccountsList[0])
      return smartAccountsList[0].smartAccountAddress
    } catch (error) {
      Logger.error(`Failed to get smart account address: ${error}`)
      throw error
    }
  }

  async getSmartAccountsByOwner(
    smartAccountByOwnerDto: SmartAccountByOwnerDto
  ): Promise<SmartAccountsResponse> {
    console.log('called for pass key');
    return this.getNodeClient().getSmartAccountsByPassKey(smartAccountByOwnerDto)
  }

  getDummySignature(): string {
    return '0x2353579e068141b01681c6b70254e36e0ebb2e80086f4b87fe272bdfd23cd73e4249f1c3488de07372688951982d5301654807f86b8f0d0605b2c7395c05fcea9071f2595014c8ce7a6d5ea01d84d7b0688ef5ddf5fe707e7d9542a288f1ec2400000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000247b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73652c226f746865725f6b6579735f63616e5f62655f61646465645f68657265223a22646f206e6f7420636f6d7061726520636c69656e74446174614a534f4e20616761696e737420612074656d706c6174652e205365652068747470733a2f2f676f6f2e676c2f796162506578227d00000000000000000000000000000000000000000000000000000000'
  }

  // @ts-ignore: unused parameter
  async signUserOp(userOp: Partial<UserOperation>): Promise<UserOperation> {
    throw new Error('Signing can only be done at FE for Passkeys')
  }

  protected async setInitCode(accountIndex = 0): Promise<string> {
    const factoryInstance = this.getFactoryInstance()
    const passKeyModuleRegistryAbi = 'function initForSmartAccount(uint256 _pubKeyX, uint256 _pubKeyY, string calldata _keyId)'
    const passKeyModuleRegistryInterface = new ethers.utils.Interface([passKeyModuleRegistryAbi])
    const passKeyOwnershipInitData = passKeyModuleRegistryInterface.encodeFunctionData(
      'initForSmartAccount',
      [
        this.biconomySmartAccountConfig.pubKeyX,
        this.biconomySmartAccountConfig.pubKeyY,
        this.biconomySmartAccountConfig.keyId
      ]
    )
    this.initCode = ethers.utils.hexConcat([
      factoryInstance.address,
      factoryInstance.interface.encodeFunctionData('deployCounterFactualAccount', [
        this.getSmartAccountInfo().passKeyModuleAddress,
        passKeyOwnershipInitData,
        accountIndex
      ])
    ])
    return this.initCode
  }
}
