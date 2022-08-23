import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import {Interface} from "ethers/lib/utils";
import { provideHandleTransaction } from "./agent";
import { SWAP_LOG, UNISWAP_FACTORY_ADDRESS } from "./utils";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";

describe("UniswapV3 Swap event bot", () => {
  let handleTransaction: HandleTransaction;
  let swapEvent: Interface;
  let pool: string = "0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168"
  let mockPool: string = createAddress("0x23")

  type mockMetadata = {
    pool: string,
    sender: string,
    recipient: string,
    amount0: string,
    amount1: string,
    fee: string
  }

  let mockFinding = (metadata: mockMetadata): Finding => {
    return Finding.fromObject({
      name: "Swap detector",
      description: "Alerts every time a swap occurs on uniswap",
      alertId: "UNISWAP-SWAP-EVENT",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "uniswap-v3",
      metadata: {
        pool: metadata.pool,
        sender: metadata.sender,
        recipient: metadata.recipient,
        amount0: metadata.amount0,
        amount1: metadata.amount1,
        fee: metadata.fee
      },
    })
  }

  beforeAll(() => {
    swapEvent = new Interface([SWAP_LOG]);
    handleTransaction = provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, SWAP_LOG);
  });

  it("return empty when is not a UniswapV3 pool", async () => {
    let findings: Finding[]
    let txEvent: TestTransactionEvent
    
    txEvent = new TestTransactionEvent().addEventLog(swapEvent.getEvent("Swap"), mockPool, 
    [
      createAddress("0x10"),
      createAddress("0x11"),
      10,
      20,
      256,
      256,
      256
    ])
    findings = await handleTransaction(txEvent)

    expect(findings).toStrictEqual([])
  })

  it("return empty when there is no Swap events", async () => {
    let findings: Finding[]
    let txEvent: TestTransactionEvent

    txEvent = new TestTransactionEvent()
    findings = await handleTransaction(txEvent)

    expect(findings).toStrictEqual([])
  })
  
  it("return Swap event when is a UniswapV3 pool who emmited the event", async () => {
    let findings: Finding[]
    let txEvent: TestTransactionEvent
    
    txEvent = new TestTransactionEvent().addEventLog(swapEvent.getEvent("Swap"), pool, 
    [
      createAddress("0x10"),
      createAddress("0x11"),
      10,
      20,
      256,
      256,
      256
    ])
    findings = await handleTransaction(txEvent)

    let metadata: mockMetadata = {
      pool: pool.toLowerCase(),
      sender: createAddress("0x10"),
      recipient: createAddress("0x11"),
      amount0: "10",
      amount1: "20",
      fee: "100"
    } 

    expect(findings).toStrictEqual([mockFinding(metadata)])
  })
});
