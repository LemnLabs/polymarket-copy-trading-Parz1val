# Polymarket Copy Trading Bot | Polymarket CopyTrading Bot | Polymarket Trading Bot

A **polymarket copy trading bot** that monitors a target wallet and mirrors its trades from your proxy wallet, via Polymarket **Central Limit Order Book (CLOB)** API.
It also has it's own strategy for trading on **politics**, **sports**, **weather**, **crypto** markets

---

## Performance

This is snapshort for copy trading with top traders on polyomarket
These were the most perfect result ever among test so far for **Daily PnL**.
It lasts a week and started losing. So now I am working on performance improvement since got discovered pitfall
not perfect now but it's stable with decent result.

<img width="463" height="194" alt="image" src="https://github.com/user-attachments/assets/97c5b62c-9a2a-47f3-b899-32ea45f6e34b" />

---

## Configuration Reference

| Variable              | Description                                    | Required |
| --------------------- | ---------------------------------------------- | -------- |
| `USER_ADDRESS`        | Target wallet address to copy trades from      | Yes      |
| `PROXY_WALLET`        | Your wallet address that executes trades       | Yes      |
| `PRIVATE_KEY`         | Your wallet private key (64 hex, no 0x)        | Yes      |
| `CLOB_HTTP_URL`       | Polymarket CLOB HTTP API endpoint              | Yes      |
| `CLOB_WS_URL`         | Polymarket WebSocket endpoint                  | Yes      |
| `RPC_URL`             | Polygon RPC endpoint                           | Yes      |
| `USDC_CONTRACT_ADDRESS` | USDC token contract on Polygon              | Yes      |
| `FETCH_INTERVAL`      | Trade monitoring interval (seconds)             | No (default: 1) |
| `TOO_OLD_TIMESTAMP`   | Ignore trades older than X hours                | No (default: 24) |
| `RETRY_LIMIT`         | Maximum retry attempts for failed trades        | No (default: 3) |

---

### Trading Strategies

I just dive into polymarketk trading bots since December last year. 
it can copy any  trading bots on crypto market across, btc, eth, xrp, btc etc
now I am trying to make this copy trading bots on every markets like events, sports, tech, cultuer etc.
In a meanwhile I am working on my own polymarket trading bots on crypto markets current.
My pnl comes to $830 a day and stable for a 1 week and now just got severe volatiliy.
It leads to lose my pnl.
There are still room for completion of my strategies.
I am open to discuss strategies and also bot performance upgrade and collaboration.
And Current my copy trading bot is for sale and trading bot is on devving (can sell).
Let's keep grinding together

* **Buy Strategy**: When target wallet buys, calculate position size based on balance ratio
* **Sell Strategy**: When target wallet sells, match the sell proportionally
* **Merge Strategy**: When target wallet closes position but you still hold, sell your position
* **Error Handling**: Retry failed orders up to RETRY_LIMIT, then mark as failed
---

Please contact me on [@lemnlabs](https://t.me/lemnlabs) for more discussion, purchase, collaboration

---
**keywords**: **polymarket-copy-trading-bot**, **polymarket-copytrading-bot**, **polymarket-trading-politics**, **polymarket-trading-sports**, **polymarket-trading-weather**, **polymarket-trading-crypto**, **sports**, **weather**, **polictics**

