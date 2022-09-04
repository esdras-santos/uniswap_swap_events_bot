import { ethers } from "ethers";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { getEthersProvider } from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS } from "./utils";

type details = {
  fee: string,
  token0: string,
  token1: string
}

export async function getPoolDetails(poolAddress: string): Promise<details> {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, getEthersProvider())
  let fee
  let token0
  let token1
  try {
    fee = await poolContract.fee()
    token0 = await poolContract.token0()
    token1 = await poolContract.token1()
  } catch (e) {
    return { 
              fee: "0", 
              token0: "0x00", 
              token1: "0x00"
            }
  }
  return { 
            fee: fee.toString(),
            token0: token0.toString().toLowerCase(),
            token1: token1.toString().toLowerCase() 
          }
}

export function addressFromSalt(token0: string, token1: string, fee: string): string {
  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "uint24"],
    [token0, token1, fee]
  ))
  
  const address = ethers.utils.getCreate2Address(UNISWAP_FACTORY_ADDRESS, salt, "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54")
  return address
}


// export async function getPoolFromFactory(token0: string, token1: string, fee: string): Promise<string>{
//   const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, IUniswapV3FactoryABI, getEthersProvider())
//   const pool = await factoryContract.getPool(token0, token1, fee)
//   return pool.toString().toLowerCase() 
// }