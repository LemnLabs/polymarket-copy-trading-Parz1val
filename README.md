# Parz1vaI: Polymarket Copy Trading Engine

**High-Frequency Whale Replication Tool**

This is a specialized execution engine designed to mirror the trading activity of **Parz1vaI** (`0xB10047d6a254B2EbB306D7a7D13Bf59171AB6461`) on Polymarket. It provides institutional-grade infrastructure for traders seeking to automate their exposure to high-conviction whale movements.






## Core Functionality

The engine operates as a low-latency execution layer between the target wallet and your portfolio. It is not an "AI" or "black box" system; it is a precision tool for direct trade replication.

-   **Direct CLOB Integration**: Bypasses standard UI latency by interacting directly with Polymarket's Central Limit Order Book.
-   **Proportional Execution**: Automatically calculates position sizes based on your available capital relative to the target's trade size.
-   **Slippage Protection**: Configurable thresholds to prevent execution during adverse price movements.
-   **Audit Logging**: Comprehensive MongoDB records of all detected signals and executed trades.

## Configuration Manual

### Prerequisites
-   Node.js 18+
-   MongoDB (Local or Remote)
-   Polygon RPC Endpoint (Private recommended)
-   Funded Polygon Wallet (USDC)

### Installation

```bash
git clone https://github.com/LemnLabs/polymarket-copy-trading-Parz1val.git
cd polymarket-trading-bot
npm install
```

### Setup Guide

1.  **Environment Configuration**
    Copy the template configuration:
    ```bash
    cp env.example .env
    ```

2.  **Wallet Integration**
    Edit `.env` to input your execution credentials.
    *   `USER_ADDRESS`: `0xB10047d6a254B2EbB306D7a7D13Bf59171AB6461` (Target: Parz1vaI)
    *   `PROXY_WALLET`: Your execution wallet address.
    *   `PRIVATE_KEY`: The private key authorized to sign orders for the Proxy Wallet.

3.  **Execution Parameters**
    *   `FETCH_INTERVAL`: Set to `1` (second) for standard operation.
    *   `RETRY_LIMIT`: Recommended `3` for reliability without spamming.
    *   `TOO_OLD_TIMESTAMP`: Prevents execution of stale data (e.g., `24` hours).

### Deployment

Start the engine in production mode:

```bash
npm run build
npm start
```

## Operational Logic

The system follows a strict, deterministic execution path:

1.  **Monitor**: Polls the Polymarket Data API for new `TRADE` events from `USER_ADDRESS`.
2.  **Filter**: Validates the trade against historical records in MongoDB to prevent duplication.
3.  **Calculate**: Determines the appropriate order size based on your `PROXY_WALLET` USDC balance.
4.  **Execute**: Submits a Fill-or-Kill (FOK) order to the CLOB.
5.  **Verify**: Confirms order status and logs the result.

## Risk Management

This tool automates execution but does not eliminate market risk.
-   **Liquidity Risk**: Large orders may suffer slippage.
-   **Smart Contract Risk**: Interaction with DeFi protocols carries inherent risks.
-   **Capital at Risk**: Only deploy capital you can afford to lose.

## License

ISC
