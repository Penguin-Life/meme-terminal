/**
 * Input validation middleware and helpers.
 * Lightweight, no external dependencies.
 */

const { createError } = require('./errorHandler');

// ─── Allowed values ───────────────────────────────────────────────────────────

const VALID_CHAINS = ['solana', 'ethereum', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];
const VALID_ALERT_TYPES = ['price_above', 'price_below', 'new_buy', 'large_tx', 'new_listing'];

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate chain parameter.
 * Returns normalized lowercase chain name or throws 400.
 */
function validateChain(chain) {
  if (!chain) throw createError('Chain parameter is required', 400, 'MISSING_CHAIN');
  const normalized = chain.toLowerCase();
  if (!VALID_CHAINS.includes(normalized)) {
    throw createError(
      `Invalid chain "${chain}". Must be one of: ${VALID_CHAINS.join(', ')}`,
      400,
      'INVALID_CHAIN'
    );
  }
  return normalized;
}

/**
 * Validate a blockchain address.
 * Solana: base58, 32-44 chars
 * EVM: 0x + 40 hex chars
 */
function validateAddress(address, chain = null) {
  if (!address || typeof address !== 'string') {
    throw createError('Address is required', 400, 'MISSING_ADDRESS');
  }
  const trimmed = address.trim();
  const isSolana = !chain || chain === 'solana';
  const isEVM = ['ethereum', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'].includes(chain);

  if (isEVM || trimmed.startsWith('0x')) {
    // EVM address: 0x + 40 hex chars
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      throw createError(
        `Invalid EVM address format. Expected 0x followed by 40 hex characters.`,
        400,
        'INVALID_ADDRESS'
      );
    }
    return trimmed.toLowerCase();
  }

  if (isSolana) {
    // Solana: base58, 32-44 chars
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
      throw createError(
        `Invalid Solana address format. Expected base58 string, 32-44 characters.`,
        400,
        'INVALID_ADDRESS'
      );
    }
    return trimmed;
  }

  // Generic fallback — just check length
  if (trimmed.length < 10) {
    throw createError('Address appears too short', 400, 'INVALID_ADDRESS');
  }
  return trimmed;
}

/**
 * Sanitize a search query.
 * - Strips leading/trailing whitespace
 * - Removes characters that could be SQL/script injection vectors
 * - Enforces max 100 chars
 */
function sanitizeQuery(query) {
  if (!query || typeof query !== 'string') {
    throw createError('Query parameter is required', 400, 'MISSING_QUERY');
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw createError('Query cannot be empty', 400, 'EMPTY_QUERY');
  }
  if (trimmed.length > 100) {
    throw createError('Query too long. Maximum 100 characters.', 400, 'QUERY_TOO_LONG');
  }
  // Strip potentially dangerous characters, keep alphanumeric + common token chars
  const sanitized = trimmed.replace(/[<>"'`;&|{}()[\]\\]/g, '').trim();
  if (sanitized.length === 0) {
    throw createError('Query contains only invalid characters', 400, 'INVALID_QUERY');
  }
  return sanitized;
}

/**
 * Validate alert type
 */
function validateAlertType(type) {
  if (!type) throw createError('Alert type is required', 400, 'MISSING_TYPE');
  if (!VALID_ALERT_TYPES.includes(type)) {
    throw createError(
      `Invalid alert type "${type}". Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
      400,
      'INVALID_ALERT_TYPE'
    );
  }
  return type;
}

// ─── Express middleware wrappers ──────────────────────────────────────────────

/**
 * Validates query.chain param in GET requests
 */
function chainQueryMiddleware(req, res, next) {
  try {
    if (req.query.chain) {
      req.query.chain = validateChain(req.query.chain);
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Validates :chain route param
 */
function chainParamMiddleware(req, res, next) {
  try {
    if (req.params.chain) {
      req.params.chain = validateChain(req.params.chain);
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  VALID_CHAINS,
  VALID_ALERT_TYPES,
  validateChain,
  validateAddress,
  sanitizeQuery,
  validateAlertType,
  chainQueryMiddleware,
  chainParamMiddleware
};
