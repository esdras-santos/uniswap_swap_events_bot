import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  LogDescription,
  ethers
} from "forta-agent";

import {UNISWAP_FACTORY_ABI, SWAP_LOG} from "./utils";


export function provideHandleTransaction(factoryAbi: string, swapLog: string) : HandleTransaction{
  return async (txEvent: TransactionEvent) : Promise<Finding[]> => {
    const findings: Finding[] = []
    // get the swap event
    const swapLogs: LogDescription[] = txEvent.filterLog(swapLog)

    // verify if the log is emmitted by one of the pools of uniswap 
    swapLogs.forEach((log)=>{
      log.args.
      log.address
    })

    return findings
  }
}

export default {
  handleTransaction: provideHandleTransaction(UNISWAP_FACTORY_ABI, SWAP_LOG),
};
