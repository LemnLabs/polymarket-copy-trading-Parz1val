# Polymarket Copy Trading Bot

A TypeScript Polymarket Copy Trading bot that copies trades from any Polymarket wallet. Monitors a target address, detects trades, and automatically replicates them on your account. Works with regular wallets and proxy/Safe wallets.

## What it does

The bot polls Polymarket's API for trades from a target wallet, saves them to MongoDB, and then executes copy trades on your account. It handles buy, sell, and merge operations with proportional position sizing based on your balance vs the target's balance.

## Features

- Real-time trade monitoring (polls every second by default)
- Automatic order execution via Polymarket CLOB
- Supports EOA, proxy, and Gnosis Safe wallets
- Position sizing based on balance ratios
- Retry logic for failed orders
- Price deviation protection (skips if price moves >0.05)
- MongoDB for trade history

## Installation

You'll need Node.js 18+, MongoDB, and a funded Polygon wallet.

```bash
git clone https://github.com/LemnLabs/polymarket-trading-bot.git
cd polymarket-trading-bot
npm install
```

Copy `env.example` to `.env` and fill in your details:

```env
USER_ADDRESS=0xTargetWalletToCopy
PROXY_WALLET=0xYourWallet
PRIVATE_KEY=your_private_key
CLOB_HTTP_URL=https://clob.polymarket.com
CLOB_WS_URL=wss://clob-ws.polymarket.com
MONGO_URI=mongodb://localhost:27017/polymarket_copytrading
RPC_URL=https://polygon-rpc.com
USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
FETCH_INTERVAL=1
TOO_OLD_TIMESTAMP=24
RETRY_LIMIT=3
```

Then build and run:

```bash
npm run build
npm start
```

Or use `npm run dev` for development with ts-node.

## Configuration

**Required vars:**
- `USER_ADDRESS` - Wallet address you want to copy
- `PROXY_WALLET` - Your trading wallet
- `PRIVATE_KEY` - Private key of your wallet
- `CLOB_HTTP_URL` / `CLOB_WS_URL` - Polymarket endpoints
- `MONGO_URI` - MongoDB connection string
- `RPC_URL` - Polygon RPC (public ones work but can be slow)
- `USDC_CONTRACT_ADDRESS` - USDC on Polygon

**Optional:**
- `FETCH_INTERVAL` - Seconds between API polls (default: 1)
- `TOO_OLD_TIMESTAMP` - Ignore trades older than X hours (default: 24)
- `RETRY_LIMIT` - Max retries for failed orders (default: 3)

## How it works

1. `tradeMonitor.ts` polls `https://data-api.polymarket.com/activities?user={address}` every second
2. Filters for TRADE type activities, checks if already in DB
3. Saves new trades to MongoDB
4. `tradeExecutor.ts` picks up trades where `bot: false`
5. Fetches positions and balances for both wallets
6. Calculates order size based on balance ratio
7. Places market orders via CLOB client
8. Marks trade as executed in DB

The bot uses FOK (Fill-or-Kill) orders and will retry up to `RETRY_LIMIT` times if an order fails. It skips trades if the current price deviates more than 0.05 from the target's trade price (safety feature, you can adjust this in `postOrder.ts`).

## Project structure

```
src/
├── config/
│   ├── db.ts           # MongoDB connection
│   └── env.ts          # Environment variables
├── services/
│   ├── tradeMonitor.ts # Polls API for new trades
│   └── tradeExecutor.ts # Executes copy trades
├── utils/
│   ├── createClobClient.ts # Sets up CLOB client
│   ├── fetchData.ts    # HTTP requests with retry
│   ├── getMyBalance.ts # Gets USDC balance
│   └── postOrder.ts    # Order placement logic
├── models/
│   ├── botConfig.ts    # Bot config storage
│   └── userHistory.ts  # Trade/position models
└── interfaces/
    └── User.ts          # TypeScript types
```

## Performance

I've tested this with some top traders on Polymarket. Results were decent for about a week, then started losing. The bot is stable but not perfect - there are some edge cases I'm still working on. Here's a snapshot from when it was working well:

![Performance Snapshot](https://github.com/user-attachments/assets/97c5b62c-9a2a-47f3-b899-32ea45f6e34b)

**Things that affect performance:**
- How fast the target trader executes (you'll always be slightly behind)
- Market liquidity (slippage on fills)
- Your balance vs target balance (position sizing)
- API rate limits (1 second polling might be too aggressive sometimes)

## Known issues / limitations

- Price deviation threshold is hardcoded to 0.05 in `postOrder.ts`
- No WebSocket support yet (just polling)
- MongoDB connection string is hardcoded in `db.ts` (should use env var)
- Some error handling could be better
- Typo in field name: `botExcutedTime` should be `botExecutedTime` (too lazy to fix all references)

## Tech stack

- TypeScript 5.7
- Node.js 18+
- Ethers.js v5
- MongoDB + Mongoose
- @polymarket/clob-client v4.14.0
- Axios for HTTP

## Troubleshooting

**Bot not finding trades:**
- Check `USER_ADDRESS` is correct
- Make sure MongoDB is running and connected
- Verify the target wallet has recent trades on Polymarket

**Orders failing:**
- Check you have USDC in your wallet
- Verify `PRIVATE_KEY` matches `PROXY_WALLET`
- Make sure RPC endpoint is working
- Check console for API key creation errors

**MongoDB errors:**
- Verify connection string is correct
- Make sure MongoDB is accessible
- Check network/firewall settings

**Price deviation errors:**
- This means the current market price is too far from when the target traded
- It's a safety feature to prevent bad fills
- You can lower the threshold in `postOrder.ts` (line 76, 119) if you want

## Multiple wallets

The bot watches for env var changes every 30 seconds. You can update `USER_ADDRESS` in your `.env` and it will pick up the new target. Configs are saved to MongoDB so you can track multiple wallets.

## API endpoints used

- `https://data-api.polymarket.com/activities?user={address}` - Get user trades
- `https://data-api.polymarket.com/positions?user={address}` - Get user positions
- `https://clob.polymarket.com` - CLOB API for orders

## Wallet types

Supports:
- EOA wallets (regular wallets)
- Proxy wallets (POLY_PROXY signature type)
- Gnosis Safe (POLY_GNOSIS_SAFE signature type)

The bot uses `POLY_PROXY` by default in `utils/createClobClient.ts`. There's also a duplicate file in `services/createClobClient.ts` that uses `POLY_GNOSIS_SAFE` - you can switch if needed (just update the import in `index.ts`).

## Resources

- [Beginner setup guide](https://www.quantvps.com/blog/setup-polymarket-trading-bot) - Good tutorial for getting started
- [QuickNode guide](https://www.quicknode.com/guides/defi/polymarket-copy-trading-bot) - Where I got the initial idea from
- [Polymarket docs](https://docs.polymarket.com/)
- [CLOB client](https://github.com/Polymarket/clob-client)

## Contributing

PRs welcome. If you fix the typo in `botExcutedTime`, I'll merge it. Also looking for improvements to error handling and maybe WebSocket support instead of polling.

## Contact

Hit me up on Telegram [@lemnlabs](https://t.me/lemnlabs) if you have questions or want to discuss improvements.

## Disclaimer

This is experimental software. Use at your own risk. Trading involves real money and you can lose it. I'm not responsible for any losses. The bot worked for me for a while but YMMV.
Motivated By https://www.quicknode.com/guides/defi/polymarket-copy-trading-bot
## License

ISC

---

**Keywords for SEO:** polymarket trading bot, polymarket copy trading bot, polymarket automated trading, polymarket bot github, polymarket arbitrage bot, polymarket trading bot 15m 5m, polymarket copy trading strategy, automated polymarket trading system, polymarket bot typescript, polygon polymarket bot, polymarket clob trading bot, prediction market trading, defi trading bot
