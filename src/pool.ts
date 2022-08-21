import { ethers } from 'ethers'
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'


const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/<YOUR-ENDPOINT-HERE>')

export async function getPoolFactory(poolAddress: string): Promise<string> {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider)
  const factory = await Promise.all([
    poolContract.factory(),
  ])
  
  return factory.toString()
}