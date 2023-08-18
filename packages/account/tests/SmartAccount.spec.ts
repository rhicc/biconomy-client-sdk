import { expect } from 'chai'
import { ethers } from 'ethers'
import { calcPreVerificationGas } from '../src/utils/Preverificaiton'
import { BiconomySmartAccount, DEFAULT_ENTRYPOINT_ADDRESS } from '../src'
import { Wallet } from 'ethers'
import { ChainId } from '@biconomy/core-types'
import { Bundler } from '@biconomy/bundler'
import { BiconomyPaymaster } from '@biconomy/paymaster'
describe('calcPreVerificationGas', () => {
  const userOp = {
    sender: '0x'.padEnd(42, '1'),
    nonce: 0,
    initCode: '0x3333',
    callData: '0x4444',
    callGasLimit: 5,
    verificationGasLimit: 6,
    maxFeePerGas: 8,
    maxPriorityFeePerGas: 9,
    paymasterAndData: '0xaaaaaa'
  }
  it('returns a gas value proportional to sigSize', async () => {
    const pvg1 = calcPreVerificationGas(userOp, { sigSize: 0 })
    const pvg2 = calcPreVerificationGas(userOp, { sigSize: 65 })
    expect(pvg2.toNumber()).to.be.greaterThan(pvg1.toNumber())
  })
})

describe('Validation', async () => {

  let owner: Wallet
  let target = await Wallet.createRandom().getAddress()
  let biconomySmartAccount
  before('', async () => {
    owner = Wallet.createRandom()
    const biconomySmartAccountConfig = {
      signer: owner,
      chainId: ChainId.POLYGON_MAINNET
    }
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
    biconomySmartAccount = await biconomyAccount.init()
  })

  it('Nonce should be zero', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    expect(builtUserOp.nonce.toNumber()).to.be.eq(0)
  })
  it('Sender should be non zero', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    expect(builtUserOp.sender).to.be.not.equal(ethers.constants.AddressZero)
  })
  it('InitCode length should be greater then 170', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    expect(builtUserOp.initCode.length).to.be.greaterThan(170)
  })
})

describe('UserOp Local Estimation', async () => {
  let owner: Wallet
  let target = await Wallet.createRandom().getAddress()
  let biconomySmartAccount
  before('', async () => {
    owner = Wallet.createRandom()
    const biconomySmartAccountConfig = {
      signer: owner,
      chainId: ChainId.POLYGON_MAINNET
    }
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
    biconomySmartAccount = await biconomyAccount.init()
  })

  it('estimateUserOperationGas for native token transfer using local estimation logic', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    console.log('builtUserOp ', builtUserOp);
    expect(builtUserOp.verificationGasLimit.toNumber()).to.be.closeTo(300000, 200000)
    expect(builtUserOp.callGasLimit.toNumber()).to.be.closeTo(25000, 10000)
    expect(builtUserOp.preVerificationGas.toNumber()).to.be.closeTo(40000, 10000)
  })
})

describe('UserOp bundler Estimation', async () => {
  const bundlerUrl = "https://bundler.biconomy.io/api/v2/137/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"
  const paymasterUrl = "https://paymaster.biconomy.io/api/v1/137/6epGbMB4x.5ec0b14c-49aa-4bbc-a4cd-1a75343e1d52"

  let owner: Wallet
  let target = await Wallet.createRandom().getAddress()
  let biconomySmartAccount
  before('', async () => {
    owner = Wallet.createRandom()
    const bundler = new Bundler({
      bundlerUrl,
      chainId: ChainId.POLYGON_MAINNET,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });

    const paymaster = new BiconomyPaymaster({
      paymasterUrl
    })

    const biconomySmartAccountConfig = {
      signer: owner,
      chainId: ChainId.POLYGON_MAINNET,
      paymaster: paymaster,
      bundler: bundler,
    }
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
    biconomySmartAccount = await biconomyAccount.init()
  })

  it('estimateUserOperationGas for native token transfer using local estimation logic', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    console.log('builtUserOp ', builtUserOp);
    expect(builtUserOp.verificationGasLimit).to.be.closeTo(300000, 200000)
    expect(builtUserOp.callGasLimit).to.be.closeTo(45000, 20000)
    expect(builtUserOp.preVerificationGas).to.be.closeTo(40000, 10000)
  })
})

describe('Send UserOp', async () => {
  const bundlerUrl = "https://bundler.biconomy.io/api/v2/137/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"
  const paymasterUrl = "https://paymaster.biconomy.io/api/v1/137/6epGbMB4x.5ec0b14c-49aa-4bbc-a4cd-1a75343e1d52"

  let owner: Wallet
  let target = await Wallet.createRandom().getAddress()
  let biconomySmartAccount
  before('', async () => {
    owner = Wallet.createRandom()
    const bundler = new Bundler({
      bundlerUrl,
      chainId: ChainId.POLYGON_MAINNET,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });

    const paymaster = new BiconomyPaymaster({
      paymasterUrl
    })

    const biconomySmartAccountConfig = {
      signer: owner,
      chainId: ChainId.POLYGON_MAINNET,
      paymaster: paymaster,
      bundler: bundler,
    }
    const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
    biconomySmartAccount = await biconomyAccount.init()
  })

  it('estimateUserOperationGas for native token transfer using local estimation logic', async () => {
    const builtUserOp = await biconomySmartAccount.buildUserOp([{ to: target, data: ethers.utils.parseEther("1".toString()) }])
    console.log('builtUserOp ', builtUserOp);
    expect(builtUserOp.verificationGasLimit).to.be.closeTo(300000, 200000)
    expect(builtUserOp.callGasLimit).to.be.closeTo(45000, 20000)
    expect(builtUserOp.preVerificationGas).to.be.closeTo(40000, 10000)
  })
})


