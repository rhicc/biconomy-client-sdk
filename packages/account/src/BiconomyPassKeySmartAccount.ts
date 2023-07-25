import { ethers } from 'ethers'
import elliptic from 'elliptic';
import {
    BiconomySmartAccountConfig,
} from './utils/Types'
import { UserOperation } from '@biconomy/core-types'
import { IBiconomySmartAccount } from 'interfaces/IBiconomySmartAccount'
import { BiconomySmartAccount } from './BiconomySmartAccount'
import { SmartAccountByOwnerDto, SmartAccountsResponse } from '@biconomy/node-client'

export class BiconomyPassKeySmartAccount
    extends BiconomySmartAccount
    implements IBiconomySmartAccount {
    pubKeyX = '0xa736f00b7d22e878a2fe3836773219ddac3c9b2bdcb066b3c480232262b410ad'
    pubKeyY = '0xd238d6f412bbf0334a592d4cba3862d28853f9f27d4ff6a9546de355761eb0f8'
    KeyId = 'test'

    constructor(readonly biconomySmartAccountConfig: BiconomySmartAccountConfig) {
        super(biconomySmartAccountConfig)
    }

    async getSmartAccountsByOwner(
        smartAccountByOwnerDto: SmartAccountByOwnerDto
      ): Promise<SmartAccountsResponse> {
        return this.getNodeClient().getSmartAccountsByPassKey(smartAccountByOwnerDto)
      }

    async signUserOp(userOp: Partial<UserOperation>): Promise<UserOperation> {
        userOp = await super.signUserOp(userOp)
        let signatureWithModuleAddress = ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'address'],
            [userOp.signature, this.getSmartAccountInfo().passKeyModuleAddress]
        )
        userOp.signature = signatureWithModuleAddress
        return userOp as UserOperation
    }

    protected async setInitCode(accountIndex = 0): Promise<string> {
        const factoryInstance = this.getFactoryInstance()
        const passKeyModuleRegistryAbi = 'function initForSmartAccount(uint256 _pubKeyX, uint256 _pubKeyY, string calldata _keyId)'
        const passKeyModuleRegistryInterface = new ethers.utils.Interface([passKeyModuleRegistryAbi])
        const passKeyOwnershipInitData = passKeyModuleRegistryInterface.encodeFunctionData(
            'initForSmartAccount',
            [
                this.pubKeyX,
                this.pubKeyY,
                this.KeyId
            ]
        )
        console.log('passKeyOwnershipInitData ', passKeyOwnershipInitData);
        console.log('this.getSmartAccountInfo().passKeyModuleAddress ', this.getSmartAccountInfo().passKeyModuleAddress);



        this.initCode = ethers.utils.hexConcat([
            factoryInstance.address,
            factoryInstance.interface.encodeFunctionData('deployCounterFactualAccount', [
                this.getSmartAccountInfo().passKeyModuleAddress,
                passKeyOwnershipInitData,
                accountIndex
            ])
        ])
        console.log('initCode', this.initCode);

        return this.initCode
    }
}
