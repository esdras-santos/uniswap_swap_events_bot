import { ethers} from 'ethers'
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import {getEthersProvider} from "forta-agent";

export async function getPoolFactory(poolAddress: string): Promise<[string, string]> {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, getEthersProvider())
  const factory = await poolContract.factory()
  const fee = await poolContract.fee()
  return [factory.toString(), fee.toString()]
}