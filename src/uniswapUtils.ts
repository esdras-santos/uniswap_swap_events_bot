import { ethers } from "ethers";
import { getEthersProvider } from "forta-agent";
import { POOL_ABI, UNISWAP_FACTORY_ADDRESS } from "./utils";

type details = {
  fee: string;
  token0: string;
  token1: string;
};

export async function getPoolDetails(poolAddress: string): Promise<details> {
  const poolContract = new ethers.Contract(poolAddress, POOL_ABI, getEthersProvider());
  let fee;
  let token0;
  let token1;
  try {
    fee = await poolContract.fee();
    token0 = await poolContract.token0();
    token1 = await poolContract.token1();
  } catch (e) {
    return {
      fee: "0",
      token0: "0x00",
      token1: "0x00",
    };
  }
  return {
    fee: fee.toString(),
    token0: token0.toString().toLowerCase(),
    token1: token1.toString().toLowerCase(),
  };
}

export function addressFromSalt(token0: string, token1: string, fee: string): string {
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );

  const address = ethers.utils.getCreate2Address(
    UNISWAP_FACTORY_ADDRESS,
    salt,
    "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54"
  );
  return address;
}
