import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  LogDescription,
} from "forta-agent";
import { getPoolFactory } from "./pool";

import {UNISWAP_FACTORY_ADDRESS, SWAP_LOG} from "./utils";


export function provideHandleTransaction(factoryAddress: string, swapLog: string) : HandleTransaction{
  return async (txEvent: TransactionEvent) : Promise<Finding[]> => {
    const findings: Finding[] = []

    // catch the swap event
    const swapLogs: LogDescription[] = txEvent.filterLog(swapLog)

    for(const log of swapLogs){
      // cattch the factory address and fee in the pool
      const [factory,fee] = await getPoolFactory(log.address)
      // compare with the UniswapV3 factory address and then push to findings
      if(factory.toLowerCase() === factoryAddress.toLowerCase()){
        const { sender, recipient, amount0, amount1} = log.args
        
        findings.push(
          Finding.fromObject({
            name: "Swap detector",
            description: "Alerts every time a swap occurs on uniswap",
            alertId: "UNISWAP-SWAP-EVENT",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "uniswap-v3",
            metadata: {
              sender: sender.toString(),
              recipient,
              amount0: amount0.toString(),
              amount1: amount1.toString(),
              fee: fee.toString()
            },
          })
        );
      }
    }

    return findings
  }
}

export default {
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, SWAP_LOG),
};
