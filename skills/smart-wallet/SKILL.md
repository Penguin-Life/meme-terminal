---
name: smart-wallet
version: 1.0.0
description: Track Solana and EVM wallet addresses. Get token holdings, recent transactions, detect buys/sells, and portfolio snapshots. Uses public Solana RPC + optional Helius/BscScan API keys.
author: meme-terminal
tags: [crypto, wallet, portfolio, solana, ethereum, bsc, tracking, smart-money]
---

# Smart Wallet Skill

Track any crypto wallet — see their token holdings, recent trades, and detect what they're buying/selling. Works for Solana (free, no key) and EVM chains (BSC, Base, ETH — needs free API key).

## Supported Chains

| Chain | Method | API Key Required |
|-------|--------|-----------------|
| Solana | Public RPC + Helius | No (RPC) / Optional (Helius) |
| BSC | BscScan API | Yes (free signup) |
| Base | BaseScan API | Yes (free signup) |
| Ethereum | Etherscan API | Yes (free signup) |

**Free API Keys:**
- Helius: https://helius.dev (free tier: 100k credits/month)
- BscScan: https://bscscan.com/register
- BaseScan: https://basescan.org/register
- Etherscan: https://etherscan.io/register

Store keys in workspace `.env` or pass as variables.

---

## SOLANA WALLET TRACKING

### 1. Get All Token Holdings (No API Key)

Uses the public Solana RPC — completely free, no signup.

```bash
WALLET="vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"

# Get all SPL token balances
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"getTokenAccountsByOwner\",
    \"params\": [
      \"${WALLET}\",
      {\"programId\": \"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\"},
      {\"encoding\": \"jsonParsed\", \"commitment\": \"confirmed\"}
    ]
  }" | jq '
  .result.value | 
  map(select(.account.data.parsed.info.tokenAmount.uiAmount > 0)) |
  .[] | {
    mint: .account.data.parsed.info.mint,
    amount: .account.data.parsed.info.tokenAmount.uiAmount,
    decimals: .account.data.parsed.info.tokenAmount.decimals,
    raw_amount: .account.data.parsed.info.tokenAmount.amount
  }
'
```

**Also get SOL balance:**
```bash
WALLET="vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"getBalance\",
    \"params\": [\"${WALLET}\", {\"commitment\": \"confirmed\"}]
  }" | jq '.result.value / 1000000000 | "SOL balance: \(.) SOL"'
```

---

### 2. Full Solana Portfolio (Tokens + Prices via DexScreener)

Combine RPC holdings with DexScreener prices for USD values:

```bash
WALLET="<wallet_address>"

echo "=== SOL Balance ==="
SOL_BAL=$(curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getBalance\",\"params\":[\"${WALLET}\",{\"commitment\":\"confirmed\"}]}" | jq '.result.value / 1000000000')
echo "SOL: ${SOL_BAL}"

echo ""
echo "=== Token Holdings ==="
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"getTokenAccountsByOwner\",
    \"params\": [
      \"${WALLET}\",
      {\"programId\": \"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\"},
      {\"encoding\": \"jsonParsed\"}
    ]
  }" | jq '
  .result.value |
  map(select(.account.data.parsed.info.tokenAmount.uiAmount > 0)) |
  sort_by(-.account.data.parsed.info.tokenAmount.uiAmount) |
  .[] | {
    mint: .account.data.parsed.info.mint,
    balance: .account.data.parsed.info.tokenAmount.uiAmount
  }
'
```

**Tip:** After getting mints, look up each token price on DexScreener:
```bash
MINT="<token_mint>"
curl -s "https://api.dexscreener.com/tokens/v1/solana/${MINT}" | jq '.[0] | {symbol: .baseToken.symbol, name: .baseToken.name, price_usd: .priceUsd}'
```

---

### 3. Recent Transactions (Helius — Free Tier)

Helius provides parsed Solana transaction history. Sign up free at helius.dev.

```bash
WALLET="<wallet_address>"
HELIUS_KEY="your_helius_api_key_here"

# Get last 20 transactions
curl -s "https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_KEY}&limit=20" | jq '
  .[] | {
    signature: .signature,
    type: .type,
    timestamp: (.timestamp | todate),
    fee_sol: (.fee / 1000000000),
    source: .source,
    description: .description,
    token_transfers: [.tokenTransfers[]? | {
      from: .fromUserAccount,
      to: .toUserAccount,
      mint: .mint,
      amount: .tokenAmount
    }],
    native_transfers: [.nativeTransfers[]? | {
      from: .fromUserAccount,
      to: .toUserAccount,
      amount_sol: (.amount / 1000000000)
    }]
  }
'
```

**Transaction types** (from Helius):
- `SWAP` — token swap (buy or sell)
- `TRANSFER` — token/SOL transfer
- `NFT_SALE` / `NFT_PURCHASE` — NFT trades
- `CREATE_ACCOUNT` — new account/token creation
- `CLOSE_ACCOUNT` — closing token accounts

---

### 4. Detect Token Buys/Sells (Helius)

Filter for SWAP transactions to see what wallets are trading:

```bash
WALLET="<wallet_address>"
HELIUS_KEY="your_helius_api_key"

curl -s "https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_KEY}&limit=50&type=SWAP" | jq '
  .[] | {
    time: (.timestamp | todate),
    description: .description,
    swaps: [.events.swap? | {
      native_input: .nativeInput,
      token_inputs: .tokenInputs,
      token_outputs: .tokenOutputs
    }]
  }
'
```

**Detect what was bought:**
```bash
curl -s "https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_KEY}&limit=20&type=SWAP" | jq '
  .[] | {
    time: (.timestamp | todate),
    action: .description,
    received_token: (.tokenTransfers | map(select(.toUserAccount == "'${WALLET}'")) | .[0] | {mint: .mint, amount: .tokenAmount}),
    sent_token: (.tokenTransfers | map(select(.fromUserAccount == "'${WALLET}'")) | .[0] | {mint: .mint, amount: .tokenAmount})
  }
'
```

---

### 5. Watch for New Token Purchases (Smart Money Alert)

Check if a wallet recently bought a specific new token:

```bash
WALLET="<smart_wallet>"
NEW_TOKEN_MINT="<token_to_watch>"
HELIUS_KEY="your_key"

curl -s "https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_KEY}&limit=50" | jq --arg mint "${NEW_TOKEN_MINT}" '
  .[] | select(
    .tokenTransfers[]? | 
    .mint == $mint and .toUserAccount == "'${WALLET}'"
  ) | {
    time: (.timestamp | todate),
    description: .description,
    signature: .signature
  }
'
```

---

## EVM WALLET TRACKING (BSC / Base / Ethereum)

### 6. BSC Token Holdings

```bash
WALLET="0xYourBSCWalletHere"
BSCSCAN_KEY="your_bscscan_api_key"

# Get BEP-20 token transactions
curl -s "https://api.bscscan.com/api?module=account&action=tokentx&address=${WALLET}&sort=desc&apikey=${BSCSCAN_KEY}&page=1&offset=20" | jq '
  .result[:10] | .[] | {
    token: .tokenSymbol,
    name: .tokenName,
    contract: .contractAddress,
    amount: (.value | tonumber / pow(10; (.tokenDecimal | tonumber))),
    from: .from,
    to: .to,
    time: (.timeStamp | tonumber | todate),
    tx: .hash
  }
'
```

**BNB balance:**
```bash
curl -s "https://api.bscscan.com/api?module=account&action=balance&address=${WALLET}&tag=latest&apikey=${BSCSCAN_KEY}" | jq '.result | tonumber / 1e18 | "BNB: \(.) BNB"'
```

---

### 7. Base Chain Wallet

```bash
WALLET="0xYourBaseWalletHere"
BASESCAN_KEY="your_basescan_api_key"

curl -s "https://api.basescan.org/api?module=account&action=tokentx&address=${WALLET}&sort=desc&apikey=${BASESCAN_KEY}&page=1&offset=20" | jq '
  .result[:10] | .[] | {
    token: .tokenSymbol,
    contract: .contractAddress,
    amount: (.value | tonumber / pow(10; (.tokenDecimal | tonumber))),
    time: (.timeStamp | tonumber | todate),
    from: .from,
    to: .to
  }
'
```

---

### 8. Ethereum Wallet

```bash
WALLET="0xYourEthWalletHere"
ETHERSCAN_KEY="your_etherscan_api_key"

curl -s "https://api.etherscan.io/api?module=account&action=tokentx&address=${WALLET}&sort=desc&apikey=${ETHERSCAN_KEY}&page=1&offset=20" | jq '
  .result[:10] | .[] | {
    token: .tokenSymbol,
    contract: .contractAddress,
    amount: (.value | tonumber / pow(10; (.tokenDecimal | tonumber))),
    time: (.timeStamp | tonumber | todate),
    tx: .hash
  }
'
```

---

## Usage Patterns

### When user asks: "Track this Solana wallet [ADDRESS]"
```bash
WALLET="<address>"
echo "🔍 Tracking wallet: ${WALLET}"
echo ""
echo "=== SOL Balance ==="
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getBalance\",\"params\":[\"${WALLET}\"]}" | jq '.result.value / 1e9'

echo ""
echo "=== Token Holdings ==="
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getTokenAccountsByOwner\",\"params\":[\"${WALLET}\",{\"programId\":\"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\"},{\"encoding\":\"jsonParsed\"}]}" | jq '
  .result.value | 
  map(select(.account.data.parsed.info.tokenAmount.uiAmount > 0)) |
  length as $count |
  "Found \($count) token(s) with non-zero balance"
'
```

### When user asks: "What did this wallet just buy? [ADDRESS]"
Requires Helius key. Get recent SWAP transactions and parse token received.

### When user asks: "What tokens does [ADDRESS] hold?"
Use the SPL token holdings query (no key needed for Solana).

---

## Smart Money Identification

Characteristics of smart money wallets to watch:
- Consistently buys tokens **before** major pumps
- Portfolio contains 10x-100x winners
- Has **low transaction count** but high PnL (not a bot)
- Buys at early bonding curve stage on Pump.fun
- Often found via "top traders" on DexScreener or Birdeye

**Workflow:**
1. Find a successful token (e.g., 100x on DexScreener)
2. Look up its earliest buyers on DexScreener or Birdeye
3. Track those wallets with this skill
4. When they buy a new token → consider following

---

## Error Handling

- **Solana RPC 429**: Rate limited — use Helius or add delay
- **`result: null`**: Invalid wallet address format
- **Empty token accounts**: Wallet exists but holds no SPL tokens
- **BscScan `Max rate limit reached`**: Free tier is 5 calls/sec — add `sleep 0.2`
- **Helius `missing api key`**: Always pass `?api-key=YOUR_KEY`
- **Invalid address**: Solana addresses are base58 (32-44 chars), EVM are 0x + 40 hex chars

## Edge Cases

- Solana wallets may have **closed token accounts** (0 balance) — filter with `uiAmount > 0`
- Very active wallets may have thousands of transactions — use `limit` parameter
- Some tokens use Token-2022 program (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`) not the standard program
- For Token-2022: use programId `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` in getTokenAccountsByOwner
- EVM wallets are case-insensitive (checksum vs lowercase)

## Alternative Public RPCs (if Solana mainnet is slow)

```bash
# Try these if api.mainnet-beta.solana.com is slow:
# https://solana-mainnet.g.alchemy.com/v2/demo  (limited)
# https://rpc.ankr.com/solana  (free tier)
# https://solana-api.projectserum.com  (legacy)
```

## Notes

- No Helius key? Use Solana RPC for **holdings** (works great), but you'll need Helius for **transaction history**
- Helius free tier gives 100k credits/month — each parsed tx costs ~1 credit
- For high-volume monitoring, consider upgrading Helius or using Shyft API
- BscScan/Etherscan free API keys: 5 calls/sec, 100k calls/day
- Always cross-reference interesting buys with DexScreener and GeckoTerminal for context
