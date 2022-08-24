import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  LogDescription,
} from "forta-agent";
import { getPoolDetails, getPoolFromFactory } from "./uniswapUtils";

import { UNISWAP_FACTORY_ADDRESS, SWAP_LOG } from "./utils";

export function provideHandleTransaction(factoryAddress: string, swapLog: string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    // catch the swap event
    const swapLogs: LogDescription[] = txEvent.filterLog(swapLog);

    for (const log of swapLogs) {
      // cattch the factory address and fee in the pool
      const details = await getPoolDetails(log.address);
      // compare with the UniswapV3 factory address and then push to findings
      if (details.factory === factoryAddress.toLowerCase()) {
        // to make sure that no resource will be wasted the second check in UniswapV3 factory
        // will only occur after they pass through the first check 
        const pool = await getPoolFromFactory(details.token0, details.token1, details.fee)
        if(pool === log.address.toLowerCase()){
          const { sender, recipient, amount0, amount1 } = log.args;
          findings.push(
            Finding.fromObject({
              name: "Swap detector",
              description: "Alerts every time a swap occurs on uniswap",
              alertId: "UNISWAP-SWAP-EVENT",
              severity: FindingSeverity.Info,
              type: FindingType.Info,
              protocol: "uniswap-v3",
              metadata: {
                pool: log.address.toLowerCase(),
                sender: sender.toString().toLowerCase(),
                recipient: recipient.toString().toLowerCase(),
                token0: details.token0,
                token1: details.token1,
                amount0: amount0.toString(),
                amount1: amount1.toString(),
                fee: details.fee,
              },
            })
          );
        }
      }
    }

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, SWAP_LOG),
};
