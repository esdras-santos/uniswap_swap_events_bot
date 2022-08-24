import { ethers } from "ethers";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as IUniswapV3FactoryABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";
import { getEthersProvider } from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS } from "./utils";

type details = {
  factory: string,
  fee: string,
  token0: string,
  token1: string
}

export async function getPoolDetails(poolAddress: string): Promise<details> {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, getEthersProvider())
  let factory
  let fee
  let token0
  let token1
  try {
    factory = await poolContract.factory()
    fee = await poolContract.fee()
    token0 = await poolContract.token0()
    token1 = await poolContract.token1()
  } catch (e) {
    return {
              factory:"0x00", 
              fee: "0", 
              token0: "0x00", 
              token1: "0x00"
            }
  }
  return {
            factory: factory.toString().toLowerCase(), 
            fee: fee.toString(),
            token0: token0.toString().toLowerCase(),
            token1: token1.toString().toLowerCase() 
          }
}

export async function getPoolFromFactory(token0: string, token1: string, fee: string): Promise<string>{
  const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, IUniswapV3FactoryABI, getEthersProvider())
  const pool = await factoryContract.getPool(token0, token1, fee)
  return pool.toString().toLowerCase() 
}