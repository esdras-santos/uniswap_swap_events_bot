import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  LogDescription,
} from "forta-agent";
import { getPoolDetails, addressFromSalt } from "./uniswapUtils";

import { SWAP_LOG } from "./utils";

export function provideHandleTransaction(swapLog: string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    // catch the swap event
    const swapLogs: LogDescription[] = txEvent.filterLog(swapLog);

    for (const log of swapLogs) {
      const details = await getPoolDetails(log.address);
      let address
      if (details.token0 != "0x00") {
        address = addressFromSalt(details.token0, details.token1, details.fee);
        if (address.toLowerCase() === log.address.toLowerCase()) {
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
  handleTransaction: provideHandleTransaction(SWAP_LOG),
};
