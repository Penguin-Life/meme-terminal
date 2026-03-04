/**
 * Solana RPC helpers.
 * Uses public RPC endpoints — no API key required for basic queries.
 * For production, use a dedicated RPC (Helius, QuickNode, etc.)
 */

const axios = require('axios');
const cache = require('./cache');

// Public RPC endpoints (fallback chain)
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com'
];

const TTL = {
  BALANCE: 15_000,     // 15s
  TOKENS: 30_000,      // 30s
  TXS: 20_000          // 20s
};

// Token program IDs
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

async function rpcCall(method, params = []) {
  let lastError;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const { data } = await axios.post(endpoint, {
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      }, { timeout: 10_000 });
      if (data.error) throw new Error(data.error.message);
      return data.result;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * Get SOL balance for a wallet address (in SOL)
 */
async function getSolBalance(address) {
  const key = `sol:balance:${address}`;
  return cache.getOrSet(key, async () => {
    const result = await rpcCall('getBalance', [address]);
    return {
      address,
      lamports: result.value,
      sol: result.value / 1e9
    };
  }, TTL.BALANCE);
}

/**
 * Get all SPL token accounts for a wallet
 */
async function getTokenAccounts(address) {
  const key = `sol:tokens:${address}`;
  return cache.getOrSet(key, async () => {
    const accounts = [];
    for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
      try {
        const result = await rpcCall('getTokenAccountsByOwner', [
          address,
          { programId },
          { encoding: 'jsonParsed' }
        ]);
        if (result?.value) {
          accounts.push(...result.value.map(a => ({
            pubkey: a.pubkey,
            mint: a.account.data.parsed?.info?.mint,
            amount: a.account.data.parsed?.info?.tokenAmount?.uiAmount,
            decimals: a.account.data.parsed?.info?.tokenAmount?.decimals,
            programId
          })));
        }
      } catch (e) {
        // Continue with next program
      }
    }
    return accounts.filter(a => a.amount > 0); // exclude empty accounts
  }, TTL.TOKENS);
}

/**
 * Get recent transactions for a wallet
 */
async function getRecentTransactions(address, limit = 20) {
  const key = `sol:txs:${address}:${limit}`;
  return cache.getOrSet(key, async () => {
    const signatures = await rpcCall('getSignaturesForAddress', [
      address,
      { limit }
    ]);
    return (signatures || []).map(s => ({
      signature: s.signature,
      blockTime: s.blockTime,
      slot: s.slot,
      err: s.err,
      memo: s.memo,
      timestamp: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null
    }));
  }, TTL.TXS);
}

/**
 * Get detailed transaction info
 */
async function getTransaction(signature) {
  const key = `sol:tx:${signature}`;
  return cache.getOrSet(key, async () => {
    return await rpcCall('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
    ]);
  }, 300_000); // 5 min TTL for confirmed txs
}

/**
 * Build a portfolio snapshot from token accounts + price data
 * @param {string} address - Wallet address
 * @param {function} getPriceFn - Optional async function(mint) => price in USD
 */
async function getPortfolio(address, getPriceFn = null) {
  const [balanceInfo, tokenAccounts] = await Promise.all([
    getSolBalance(address),
    getTokenAccounts(address)
  ]);

  const tokens = await Promise.all(
    tokenAccounts.map(async (account) => {
      let price = null;
      let valueUsd = null;
      if (getPriceFn && account.mint) {
        try {
          price = await getPriceFn(account.mint);
          valueUsd = price ? price * account.amount : null;
        } catch (e) { /* best effort */ }
      }
      return {
        mint: account.mint,
        amount: account.amount,
        decimals: account.decimals,
        price,
        valueUsd
      };
    })
  );

  return {
    address,
    chain: 'solana',
    nativeBalance: {
      symbol: 'SOL',
      amount: balanceInfo.sol,
      lamports: balanceInfo.lamports
    },
    tokens: tokens.sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0)),
    tokenCount: tokens.length,
    updatedAt: new Date().toISOString()
  };
}

module.exports = {
  getSolBalance,
  getTokenAccounts,
  getRecentTransactions,
  getTransaction,
  getPortfolio,
  rpcCall
};
