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
 
    swapLogs.forEach(async (log)=>{
      console.log(log.address)
      // cathc the factory address in the pool
      const factory = await getPoolFactory(log.address)

      // compare with the UniswapV3 factory address and then push to findings
      if(factory === factoryAddress){
        const { agentId, metadata, chainIds } = log.args;
        
        findings.push(
          Finding.fromObject({
            name: "Swap detector",
            description: "Alerts every time a swap occurs on uniswap",
            alertId: "UNISWAP-SWAP-EVENT",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "uniswap-v3",
            metadata: {
              agentId: agentId.toString(),
              metadata,
              chainIds: chainIds.toString(),
            },
          })
        );
      }
    })

    return findings
  }
}

export default {
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, SWAP_LOG),
};
