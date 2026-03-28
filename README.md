<div align="center">

# Polymarket CopyTrading Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Required-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Network](https://img.shields.io/badge/Polygon-USDC-8247E5?style=flat-square&logo=polygon&logoColor=white)](https://polygon.technology)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](https://opensource.org/licenses/ISC)

</div>

---

**2am. Polymarket is moving.**

You made the trade that felt right. Clean reasoning. Calm conviction.  
An hour later it's red. Hard red.

Meanwhile, some wallet you've never heard of just turned $500 into $4,200 on the opposite side of the same market.  
You watched it happen on-chain. In real time. Unable to do anything but refresh.

So you dig.

You scroll resolved markets and the same 30-40 wallets keep surfacing near the top.  
Again. Again. Again.  
They don't look lucky. They look *early*. Maybe informed. Maybe just faster.

Either way, the gap is real - not cheating, just information asymmetry with better execution.

Then the question hits you.

**What if you stopped fighting them and started following them?**

What if the moment one of those wallets moved, your bot moved too - proportionally, quietly, before the market fully reacted?

That's exactly what this bot does.

---

## The Pattern Is Hiding In Plain Sight

Polymarket's on-chain data is public. Every trade, every wallet, every timestamp - readable by anyone.  
The top wallets aren't hiding. You can see exactly what they're doing, when they did it, and how much they sized.

The only gap between them and you is **execution speed**.

They moved at 2:13am. You saw it at 2:17am. By then the odds shifted.  
That 4-minute gap is the entire edge you're giving up.

This bot closes it to **under 3 seconds**.

---

## What The Bot Does

Watches every wallet you point it at. The moment one of them executes a trade:

```
[02:13:44] Polling target wallets...         no new activity
[02:13:45] Polling target wallets...         no new activity
[02:13:46] Polling target wallets...         ── TRADE DETECTED ──

           Wallet   0x7C3D...C6B
           Market   Will X happen before Y?
           Side     BUY
           Size     $8,500
           Price    0.44

[02:13:46] Staleness check...                0s old — OK
[02:13:46] Price drift check...              current 0.45 — within 5% threshold
[02:13:46] Sizing your position...           $5,000 ÷ $85,000 × $8,500 = $500
[02:13:47] Submitting order...               FILLED at 0.45
[02:13:47] Writing to MongoDB...             done ✓

[02:13:47] Waiting for next signal...
```

That loop runs every second.  
Every hour. Every night you don't feel like watching markets.

---

## Who You Follow — That's Your Edge

The bot is the execution layer. **The alpha is in who you choose to mirror.**

Works with any public Polymarket wallet — paste any address and it starts watching immediately. Follow one trader or twenty, comma-separated in a single config line.

Some of the most-studied wallets right now:

| Trader | Profile | Known For |
|---|---|---|
| **Car** | [polymarket.com/@Car](https://polymarket.com/@Car?tab=activity) | Consistent leaderboard presence, high-conviction sizing |
| **Sonix** | [polymarket.com/@Sonix](https://polymarket.com/@Sonix?tab=activity) | Highly active, widely followed by the community |
| **Your whale** | The wallets you've already been watching | You know who they are |

> Start at [polymarket.com/leaderboard](https://polymarket.com/leaderboard). Sort by profit. Filter by market type. The wallets worth following surface quickly.

---

## The Sizing Model

You don't need to match a whale's capital to mirror their edge. The bot calculates your position size automatically.

**Formula:** `your_balance ÷ target_balance × target_position_size`

Assuming the target holds **$50,000** and their position size is **$10,000**:

| Your Balance | Sizing Ratio | Your Mirrored Position |
|---|---|---|
| $10,000 | 20% | **$2,000** |
| $5,000 | 10% | **$1,000** |
| $3,000 | 6% | **$600** |
| $1,000 | 2% | **$200** |

You stay in your lane. The bot handles the math every single time, on every trade.

---

## Capital Deployment Guide

The sizing model works at any balance - but not all balances are equal in practice.

| Deployed Capital | Reality | Recommended Stage |
|---|---|---|
| **< $500** | Positions too small - some fill attempts will fail on thin markets | Testing and validation only |
| **$500 - $2,000** | Functional mirroring, real fills, real data you can learn from | First 30 days |
| **$2,000 - $5,000** | Meaningful exposure - positions large enough to matter | After reviewing 30+ days of logs |
| **$5,000 - $20,000** | Full proportional parity on most trades | With your own PnL data |
| **> $20,000** | Large orders can move thin markets - requires careful wallet selection | Advanced, multi-wallet setup |

> The sweet spot most people find: **$3,000 – $5,000** gives you enough size to generate meaningful returns without needing to monitor every fill manually.

---

## The Guardrails

The bot doesn't blindly chase every signal. Six checks run before any order fires:

| Guard | Threshold | What It Prevents |
|---|---|---|
| **Staleness filter** | 24h max event age | Acting on old, already-resolved signals |
| **Price drift gate** | ≤ 5% from target's fill | Chasing markets that already moved |
| **Proportional sizing** | Auto-calculated | Overexposure relative to your balance |
| **Retry cap** | 3 attempts max | Infinite loops on failed fills |
| **Deduplication** | Transaction hash | Double-executing the same trade |
| **Full audit log** | MongoDB | Every event recorded - nothing opaque |

---

## Five-Minute Setup

**Prerequisites:** Node.js 18+, MongoDB (local or [Atlas free tier](https://mongodb.com/atlas)), Polygon wallet funded with USDC.

```bash
# 1. Clone and install
git clone https://github.com/pCateye/polymarket-copytrading-bot.git
cd polymarket-copytrading-bot
npm install

# 2. Configure
cp env.example .env
```

Three values to fill in. Everything else has working defaults:

```env
#  Who you're following
# Single wallet:
USER_ADDRESS=0xTargetWalletAddress

# Multiple wallets (comma-separated):
# USER_ADDRESS=0xWallet1,0xWallet2,0xWallet3

# Your wallet
PROXY_WALLET=0xYourWalletAddress
PRIVATE_KEY=your_private_key_here        # never commit this

# Leave these as defaults to start 
CLOB_HTTP_URL=https://clob.polymarket.com
CLOB_WS_URL=wss://clob-ws.polymarket.com
RPC_URL=https://polygon-rpc.com
USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
MONGO_URI=mongodb://localhost:27017/polymarket_copytrading
FETCH_INTERVAL=1
TOO_OLD_TIMESTAMP=24
RETRY_LIMIT=3
```

```bash
# 3. Run
npm run build && npm start
```

When it boots cleanly, you'll see:

```
Target user wallets (1): 0xTargetWalletAddress
My Wallet address is: 0xYourWallet
API Key created { key: "...", secret: "...", passphrase: "..." }
waiting for target wallet trades...
```

That's it. The bot is live.

---

## Before You Scale Past $1,000

Do this first. Seriously.

- [ ] Watch the first 10–20 trades execute in your terminal manually
- [ ] Verify MongoDB is logging every detection and fill correctly
- [ ] Measure your actual fill prices vs the target's - know your real slippage
- [ ] Set a monthly loss limit and commit to it before you're emotional
- [ ] Use a dedicated wallet - never your main holdings
- [ ] Use a reliable RPC endpoint (consider a paid node for production uptime)

Most people skip this list. The ones who don't are the ones who scale confidently.

---

## How It's Built

```
src/
├── index.ts                   Entry point - env validation + orchestration
├── services/
│   ├── tradeMonitor.ts        Polls target wallets, writes TRADE events to DB
│   └── tradeExecutor.ts       Reads pending trades, places mirrored orders
├── utils/
│   ├── postOrder.ts           Buy / sell / merge logic + price guards + retries
│   ├── createClobClient.ts    CLOB API key derivation + client init
│   └── getMyBalance.ts        USDC balance via Polygon RPC
├── models/
│   └── userHistory.ts         MongoDB schema - per-wallet activity collections
└── config/
    └── db.ts                  MongoDB connection handler
```

**Stack:** TypeScript (strict) · Node.js · `@polymarket/clob-client` · `ethers` · `mongoose` · `axios` · `ora` · `chalk`

<details>
<summary><strong>Full configuration reference</strong></summary>

| Variable | Required | Default | Description |
|---|---|---|---|
| `USER_ADDRESS` | Yes | - | Target wallet(s), comma-separated |
| `PROXY_WALLET` | Yes | - | Your execution wallet address |
| `PRIVATE_KEY` | Yes | - | Signing key — never commit |
| `CLOB_HTTP_URL` | Yes | - | `https://clob.polymarket.com` |
| `CLOB_WS_URL` | Yes | - | `wss://clob-ws.polymarket.com` |
| `RPC_URL` | Yes | - | Polygon RPC endpoint |
| `USDC_CONTRACT_ADDRESS` | Yes | - | Polygon USDC contract |
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `FETCH_INTERVAL` | No | `1` | Poll cadence in seconds |
| `TOO_OLD_TIMESTAMP` | No | `24` | Max event age in hours |
| `RETRY_LIMIT` | No | `3` | Max order retries |

</details>

---

## A Plain Promise About Your Keys

Your `PRIVATE_KEY` signs orders. Nothing else.

This repo contains no telemetry, no external key transmission, no hidden network calls.  
The signing logic is in `src/utils/createClobClient.ts`. Read it yourself before funding.

Use a dedicated wallet. Keep `.env` out of version control. Rotate keys if you ever think they leaked.  
Don't trust this README. Read the code.

---

## The Honest Part

| What people expect | What actually happens |
|---|---|
| "I'll mirror their exact returns" | You enter later at slightly worse prices - expect lower returns than the source wallet |
| "Set it and forget it" | It needs a live RPC, running MongoDB, and occasional monitoring |
| "Good traders stay good forever" | Every wallet has losing months. You will mirror them. |
| "More capital = more profit" | More capital = larger exposure in both directions |
| "I can follow 10 wallets at once" | Yes - but position sizing across wallets requires more careful monitoring |

**This software is provided for educational purposes. Not financial advice. Your capital, your responsibility.**

---

## Commands

```bash
npm run dev          # Development - hot reload via ts-node
npm run build        # Compile TypeScript → dist/
npm start            # Run compiled build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
```

---

## Contributing


Run it. Log your results. Open a PR if you've improved execution speed, sizing logic, slippage measurement, or PnL reporting. The bot gets sharper every time someone runs it seriously.

---

<div align="center">

*It's 2am again.*  
*But this time you're not watching the markets.*  
*You're asleep.*  
*Your bot isn't.*

**[⭐ Star this repo](https://github.com/pCateye/polymarket-copytrading-bot/)** · **[Find wallets on the leaderboard](https://polymarket.com/leaderboard)**

ISC © [pCateye](https://github.com/pCateye)

</div>
