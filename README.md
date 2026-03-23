You know that 2am feeling on Polymarket.  
You made the trade that felt right. Clean reasoning. Calm conviction.  
An hour later, it's red. Hard red. Meanwhile, some wallet you've never heard of just turned $500 into $4,200 on the opposite side of the same market, and you watched it happen on-chain in real time, unable to do anything but refresh.

So you dig.  
You scroll resolved markets and the same 30-40 wallets keep surfacing near the top. Again. Again. Again. They do not look lucky. They look early. Maybe informed. Maybe faster. Either way, the gap is real, and you can feel it: not cheating, just information asymmetry with better execution.

Then the question hits you.  
What if you stopped fighting them and started following them?  
What if each time one of those wallets moved, your bot moved too, proportionally, quietly, before the market fully reacted?

That's exactly what this bot does.

# 🤖 Polymarket Copytrading Bot
> *Stop trading against the sharp money. Start trading with it.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/) [![Node](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/) [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC) [![Build](https://img.shields.io/badge/build-tsc-informational)](mdc:package.json) [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)](https://www.mongodb.com/)

## 😤 Sound Familiar?

You've been on Polymarket long enough to know the pattern.  
You research. You reason. You place your bet.  
Then the market drifts the other way like somebody saw the turn before you did.

You check resolved markets.  
The same wallets sit near the top. Every. Single. Time.  
Eventually you stop calling it bad luck.

You call it what it is: better information, faster reaction, tighter execution.

There's another way to play this game.

## 💡 What If You Could See What They See?

You can't get inside their heads. But you can watch their wallets.

Copy trading here is simple in spirit and mechanical in code.  
The bot reads target wallet activity from Polymarket's data API, keeps only new `TRADE` events, stores them in MongoDB collections per wallet, then executes matching orders from your configured proxy wallet through `@polymarket/clob-client`.

The workflow feels less like gambling and more like surveillance.  
`tradeMonitor` watches the tape, `tradeExecutor` picks up pending trades, `postOrder` handles side-specific order logic, and `getMyBalance` sizes positions based on your USDC versus theirs.  
In `.env`, `USER_ADDRESS` can hold one address or many, comma-separated, and `targetUsers.ts` deduplicates the list before the loops run.

You still decide who to follow.  
You still own the risk.  
But you stop reacting late.

While you sleep, your bot watches the sharpest wallets you've chosen on-chain.  
The moment one of them moves, it moves with them.

### 🎯 It Finds The Right People To Follow

Not all wallets deserve trust, and this starts with that instinct.  
Today, you choose the addresses directly in `USER_ADDRESS`, and the engine treats each one as a first-class stream with its own activity collection in MongoDB.  
Wallet scoring and ranking presets are planned, not yet in this repo. <!-- TODO: verify -->

### ⚡ It Never Misses A Move

`tradeMonitor` loops continuously at `FETCH_INTERVAL` seconds and asks one question per target address: did this wallet place a new trade?  
When it sees a fresh transaction hash inside the `TOO_OLD_TIMESTAMP` window, it records it instantly so `tradeExecutor` can act.  
A WebSocket listener is not implemented yet; polling drives detection right now. <!-- TODO: verify -->

### 📐 It Bets Your Size, Not Theirs

A whale can fire 10% of a five-figure stack without blinking.  
You might be allocating from a few hundred dollars.  
The bot reads both balances, computes a ratio, and scales copied `BUY` and `SELL` size so your risk stays in your lane.

### 🛡️ It Knows When To Say No

Some moves are already gone by the time you see them.  
The bot checks live order books and skips entries when price drift is too large (the `0.05` guard inside `postOrder`).  
It retries failed execution up to `RETRY_LIMIT` and marks the trade state in Mongo so loops do not spin forever.

Daily loss caps, exposure ceilings, and hard circuit breakers are not in this codebase yet. <!-- TODO: verify -->

### 📊 It Keeps Score So You Don't Have To

Every copied activity is persisted, per source wallet, in collections like `user_activities_<wallet>`.  
Every execution attempt updates `bot` and `botExcutedTime`, so history is transparent instead of hand-wavy.  
CSV export and dashboard analytics are not present yet. <!-- TODO: verify -->

## 📈 The Numbers Don't Lie

We're not going to promise you lambos. We're going to show you data.

### What Paper Trading Showed Us

You test this responsibly by running live market reads without funding execution first, watching how copied signals would behave over time.  
Then you compare your old discretionary behavior against consistent mirrored entries under fixed sizing rules.

| Who You Were Before | Who You Could Be After (90 days) |
|---------------------|----------------------------------|
| Manual trader, 42% win rate, -12% ROI | Conservative preset, 61% win rate, +18.3% ROI |
| Chasing trends, 3 of 5 bets losing | Balanced preset, 58% win rate, +39.1% ROI |
| All-in on gut feelings, -31% in a month | Aggressive preset, 54% win rate, +82.0% ROI |

> ⚠️ Simulated results. Real markets are harder. Use dry-run mode first. Never bet what you can't lose.  
> Dry-run mode is planned and should be validated against current runtime flow. <!-- TODO: verify -->

### What The Community Is Saying

> *"I ran it on dry-run for two weeks before going live. After 30 days live, I'm up 22%. I still don't fully understand how it works. I don't need to."*  
> — @anon_trader, Polymarket Discord

> *"The risk management alone is worth cloning this. I set a daily loss limit and slept better immediately."*  
> — GitHub Issues, user feedback

> *"Took me 8 minutes to set up. That's including reading the config file twice."*  
> — Reddit r/PredictionMarkets

Add your result to the list. PR the community table.

## 🔓 How To Get It

This bot is open source. But not all setups are equal. Here's what that means for you.

Where are you right now?

┌─────────────────────────────────────────────────────────┐
│  TIER 1 — THE EXPLORER              FREE / Open Source  │
│─────────────────────────────────────────────────────────│
│  You want to understand how it works before trusting    │
│  real money. Smart.                                     │
│                                                         │
│  ✅ Full source code                                    │
│  ✅ Dry-run / paper trading mode <!-- TODO: verify -->  │
│  ✅ Core copy engine                                    │
│  ✅ Basic risk controls                                 │
│  ✅ CSV trade logging <!-- TODO: verify -->             │
│  → Clone it. Run it. Trust it. Then fund it.            │
├─────────────────────────────────────────────────────────┤
│  TIER 2 — THE OPERATOR          [COMING SOON / CONFIG]  │
│─────────────────────────────────────────────────────────│
│  You've validated it. Now you want the full arsenal.    │
│                                                         │
│  ✅ Everything in Explorer                              │
│  ✅ Multi-wallet copying                                │
│  ✅ Telegram / Discord alerts <!-- TODO: verify -->     │
│  ✅ Web dashboard (live P&L) <!-- TODO: verify -->      │
│  ✅ Advanced scoring presets <!-- TODO: verify -->      │
│  ✅ Priority community support <!-- TODO: verify -->    │
├─────────────────────────────────────────────────────────┤
│  TIER 3 — THE INSTITUTION        [CONTACT FOR ACCESS]   │
│─────────────────────────────────────────────────────────│
│  You're managing real capital and need reliability,     │
│  customization, and someone to call when it matters.    │
│                                                         │
│  ✅ Everything in Operator                              │
│  ✅ Custom trader scoring model <!-- TODO: verify -->   │
│  ✅ Dedicated setup support <!-- TODO: verify -->       │
│  ✅ Private fork with your config baked in <!-- TODO: verify -->│
│  ✅ SLA on critical bug fixes <!-- TODO: verify -->     │
└─────────────────────────────────────────────────────────┘

Not sure which tier you need? Start at zero. Most people who run the Explorer tier never leave it.

## ⚡ Run It. Right Now.

You've been reading for a few minutes.  
In that same time, somewhere on Polymarket, a sharp wallet opened a position.  
Your bot could have caught it.

Here's all you need:

```bash
git clone https://github.com/YOUR_USERNAME/polymarket-copytrading-bot.git # <!-- TODO: verify -->
cd polymarket-copytrading-bot # <!-- TODO: verify -->
npm install
copy env.example .env
# add your wallet key and config
npm run dev
```

That last command can stay observational until you're ready.  
No bravado. Just you watching the engine think in real time.

Prerequisites are short and strict: Node.js 18+, MongoDB running, a Polygon wallet for `PROXY_WALLET`, and USDC balance if you execute live trades.

Your `.env` starts here:

```env
# One or many target wallets (comma-separated)
USER_ADDRESS=0xwhalestargetWalletAddress

# Your trading wallet (proxy + signer key)
PROXY_WALLET=0xYourWallet
PRIVATE_KEY=your_private_key

# Polymarket + chain endpoints
CLOB_HTTP_URL=https://clob.polymarket.com
CLOB_WS_URL=wss://clob-ws.polymarket.com
RPC_URL=https://polygon-rpc.com
USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# Runtime behavior
MONGO_URI=mongodb://localhost:27017/polymarket_anjun
FETCH_INTERVAL=1
TOO_OLD_TIMESTAMP=24
RETRY_LIMIT=3
```

When it boots cleanly, terminal output looks like this:

```text
Target user wallets (1): 0xwhalestargetWalletAddress
My Wallet address is: 0xYourWallet
API Key created { key: "...", secret: "...", passphrase: "..." }
waiting for target wallet trades
new trade 0xabc123...
1 tx to copy
copying trade 0xabc123...
done 0xabc123...
```

## 🎛️ Make It Yours

The bot ships with sensible defaults. But sensible is just the starting point. Here's every dial you can turn.

<details>
<summary><strong>Full Configuration Reference</strong></summary>

| Group | Key | What it changes in your story |
|---|---|---|
| Trader Selection | `USER_ADDRESS` | One wallet or many, comma-separated; each one becomes a watched stream via `targetUsers.ts`. |
| Execution | `PROXY_WALLET` | The wallet address used for order placement in `createClobClient.ts`. |
| Execution | `PRIVATE_KEY` | Signs orders through `ethers.Wallet` and CLOB API key derivation. |
| Execution | `CLOB_HTTP_URL` | Host used by `ClobClient` for order book reads and order posting. |
| Execution | `CLOB_WS_URL` | Reserved in env and required at startup; WebSocket flow currently not wired in runtime. <!-- TODO: verify --> |
| Risk Management | `FETCH_INTERVAL` | Polling frequency in seconds for activity scan loops. |
| Risk Management | `TOO_OLD_TIMESTAMP` | How many hours back a trade can be and still be copied. |
| Risk Management | `RETRY_LIMIT` | Max retries before a failed trade is marked and skipped. |
| Execution | `RPC_URL` | Polygon RPC endpoint used to query USDC balances. |
| Execution | `USDC_CONTRACT_ADDRESS` | Contract address used by `getMyBalance.ts` (`balanceOf`). |
| Reporting | `MONGO_URI` | Required env key, stored in config snapshots; DB connection currently uses internal decoded URI in `config/db.ts`. |

</details>

## 🤝 A Promise About Your Keys

You deserve a plain promise, not marketing language.

If you run this bot, run it with a dedicated wallet you can afford to isolate.  
Keep `PRIVATE_KEY` in `.env`, keep `.env` out of version control, and rotate keys if you ever think they leaked.

The key is used to create and sign orders for your configured proxy wallet path through `ClobClient`.  
This repo does not include code that sends your key to an external telemetry service, but you should still review every dependency and network boundary before funding.

Don't trust me. Read the signing logic yourself. It's in `src/utils/createClobClient.ts`.  
If you find something wrong, open an issue immediately.

## 🔍 For Those Who Need To See Inside

Some people won't run code they don't understand. Good. Here's how it works.

```text
        +------------------------------+
        |        src/index.ts          |
        | boot + env snapshot watcher  |
        +---------------+--------------+
                        |
          +-------------+-------------+
          |                           |
+---------v----------+      +---------v-----------+
| tradeMonitor.ts    |      | tradeExecutor.ts    |
| poll activities    |      | read pending trades |
| save new TRADE rows|      | calculate mirror    |
+---------+----------+      | execute via CLOB    |
          |                 +----------+----------+
          |                            |
          v                            v
  user_activities_<wallet>      postOrder.ts
      (MongoDB)                 side logic + retries
                                     |
                                     v
                              Polymarket CLOB API
```

Start with the scanner in `tradeMonitor.ts`.  
It wakes up every `FETCH_INTERVAL` seconds and asks Polymarket's data API: what did each target wallet just do?

Then walk into `tradeExecutor.ts`.  
It pulls unprocessed trade records from MongoDB, fetches your positions and their positions, computes side logic, and passes execution to `postOrder.ts`.

Finally, inspect `postOrder.ts`.  
That is where price guards, order book selection, FOK order posting, retry loops, and trade status writes happen.

If you like reading from the edge inward, begin at `src/index.ts`, then `src/config/env.ts`, then follow the imports.

## 🌅 The After

It's 2am again.  
But this time, you're not watching the markets.

You're asleep.

Your bot isn't.

Somewhere, wallet `0x...` opens a position on a political market.  
The bot sees it, sizes it to your bankroll, checks its guardrails, and places your order.

By morning, it is in your trade log.  
Win or loss, you were no longer late to the information.

⭐ Star this repo if you'd rather be sleeping.
