# backend/data/ — Persistent Data Directory

This directory stores the terminal's persistent state as JSON files.

## Files

| File | Purpose | Format |
|---|---|---|
| `alerts.json` | Active price alert rules | JSON array of alert objects |
| `watchlist.json` | Tracked wallet addresses | JSON array of wallet objects |
| `alerts.example.json` | Example alert structure for reference | JSON |
| `watchlist.example.json` | Example watchlist structure for reference | JSON |

## Data Formats

### `alerts.json`

```json
[
  {
    "id": "uuid-v4",
    "type": "price_above",
    "target": "So11111111111111111111111111111111111111112",
    "chain": "solana",
    "threshold": 0.05,
    "label": "SOL above $0.05",
    "enabled": true,
    "notifyOnTrigger": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastTriggeredAt": null,
    "lastTriggerDetails": null
  }
]
```

**Alert types:** `price_above`, `price_below`, `new_buy`, `large_tx`, `new_listing`  
**Chains:** `solana`, `eth`, `bsc`, `base`, `arbitrum`, `polygon`

### `watchlist.json`

```json
[
  {
    "address": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    "chain": "solana",
    "label": "Raydium Treasury",
    "notes": "AMM fee wallet",
    "addedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

## Safety Features

- **Atomic writes**: Files are written to a `.tmp` file first, then renamed to prevent corruption during crashes.
- **Auto-backup**: A `.bak` file is created before each write so you can recover from accidental overwrites.
- **Corruption recovery**: If a JSON file is corrupted on startup, the server resets it to `[]` and logs a warning (the corrupt data is saved to a `.corrupt.*` file for manual recovery).
- **Auto-creation**: The `data/` directory and default files are created automatically on first run.

## Gitignore

`alerts.json` and `watchlist.json` are excluded from version control since they contain user-specific data.  
Only `.example.json` files are committed to the repository.
