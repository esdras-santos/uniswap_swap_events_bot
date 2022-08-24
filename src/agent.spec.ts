import { FindingType, FindingSeverity, Finding, HandleTransaction } from "forta-agent";
import { Interface } from "ethers/lib/utils";
import { provideHandleTransaction } from "./agent";
import { SWAP_LOG, UNISWAP_FACTORY_ADDRESS } from "./utils";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";

jest.setTimeout(100000)
describe("UniswapV3 Swap event bot", () => {
  let handleTransaction: HandleTransaction;
  let swapEvent: Interface;
  let pool: string = "0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168";
  let mockPool: string = createAddress("0x23");

  type mockMetadata = {
    pool: string;
    sender: string;
    recipient: string;
    token0: string;
    token1: string;
    amount0: string;
    amount1: string;
    fee: string;
  };

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
        token0: metadata.token0,
        token1: metadata.token1,
        amount0: metadata.amount0,
        amount1: metadata.amount1,
        fee: metadata.fee,
      },
    });
  };

  beforeAll(() => {
    swapEvent = new Interface([SWAP_LOG]);
    handleTransaction = provideHandleTransaction(UNISWAP_FACTORY_ADDRESS, SWAP_LOG);
  });

  it("return empty when is not a UniswapV3 pool", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;

    txEvent = new TestTransactionEvent().addEventLog(swapEvent.getEvent("Swap"), mockPool, [
      createAddress("0x10"),
      createAddress("0x11"),
      10,
      20,
      256,
      256,
      256,
    ]);
    findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("return empty when there is no Swap events", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;

    txEvent = new TestTransactionEvent();
    findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("return and detect multiple Swap events", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;

    txEvent = new TestTransactionEvent()
      .addEventLog(swapEvent.getEvent("Swap"), pool, [
        createAddress("0x10"),
        createAddress("0x11"),
        10,
        20,
        256,
        256,
        256,
      ])
      .addEventLog(swapEvent.getEvent("Swap"), pool, [
        createAddress("0x12"),
        createAddress("0x13"),
        10,
        20,
        256,
        256,
        256,
      ])

    findings = await handleTransaction(txEvent);

    let metadata1: mockMetadata = {
      pool: pool.toLowerCase(),
      sender: createAddress("0x10"),
      recipient: createAddress("0x11"),
      token0: "0x6b175474e89094c44da98b954eedeac495271d0f",
      token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount0: "10",
      amount1: "20",
      fee: "100",
    };

    let metadata2: mockMetadata = {
      pool: pool.toLowerCase(),
      sender: createAddress("0x12"),
      recipient: createAddress("0x13"),
      token0: "0x6b175474e89094c44da98b954eedeac495271d0f",
      token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount0: "10",
      amount1: "20",
      fee: "100",
    };

    expect(findings).toStrictEqual([mockFinding(metadata1), mockFinding(metadata2)]);
  });

  it("return Swap event when is a UniswapV3 pool who emmited the event", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;

    txEvent = new TestTransactionEvent()
      .addEventLog(swapEvent.getEvent("Swap"), pool, [
        createAddress("0x10"),
        createAddress("0x11"),
        10,
        20,
        256,
        256,
        256,
      ])

    findings = await handleTransaction(txEvent);

    let metadata: mockMetadata = {
      pool: pool.toLowerCase(),
      sender: createAddress("0x10"),
      recipient: createAddress("0x11"),
      token0: "0x6b175474e89094c44da98b954eedeac495271d0f",
      token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount0: "10",
      amount1: "20",
      fee: "100",
    };

    expect(findings).toStrictEqual([mockFinding(metadata)]);
  });
});
