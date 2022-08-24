# Challenge 2: Uniswap Swap Events

## Description

This bot detects every time a `Swap` occurs in UniswapV3 protocol

## Supported Chains

- Ethereum

## Alerts

- UNISWAP-SWAP-EVENT
  - Fired when a `Swap` Event is emitted by UniswapV3 protocol 
  - Severity is always set to "info" 
  - Type is always set to "info" 
  - Metadata fields
    - `pool`: pool that emitted the `Swap` Event
    - `sender`: account that did the `Swap`
    - `recipient`: account that receive the swaped amount
    - `token0`: first token of the pool
    - `token1`: second token of the pool
    - `amount0`: amount of token0
    - `amount1`: amount of token1
    - `fee`: fee of the pool 

## Test Data

The bot behaviour can be verified with the following transactions:

- [0x0e6087a58a2ace3f64ac334125c451f1ce61e10f62df03a63c4a2fd498f0a14d](https://etherscan.io/tx/0x0e6087a58a2ace3f64ac334125c451f1ce61e10f62df03a63c4a2fd498f0a14d) (`Swap` Event)



