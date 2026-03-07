/**
 * Binance WebSocket Price Stream Service
 * Connects to Binance WS for real-time mini ticker data.
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const logger = require('../utils/logger');

class BinancePriceStream extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectTimer = null;
    this.symbols = ['bonkusdt', 'wifusdt', 'pepeusdt', 'flokiusdt', 'dogeusdt', 'shibusdt'];
    this.prices = new Map();
    this.connected = false;
  }

  start() {
    if (process.env.WS_ENABLED === 'false') {
      logger.info('WebSocket price stream disabled');
      return;
    }
    this._connect();
  }

  _connect() {
    const streams = this.symbols.map(s => `${s}@miniTicker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      logger.error(`WS connect error: ${err.message}`);
      this._scheduleReconnect();
      return;
    }

    this.ws.on('open', () => {
      this.connected = true;
      logger.info(`WS connected: ${this.symbols.length} streams`);
      this.emit('connected');
    });

    this.ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        const d = msg.data;
        if (!d || !d.s) return;
        const update = {
          symbol: d.s,
          price: parseFloat(d.c),
          open: parseFloat(d.o),
          high: parseFloat(d.h),
          low: parseFloat(d.l),
          volume: parseFloat(d.v),
          quoteVolume: parseFloat(d.q),
          timestamp: d.E
        };
        this.prices.set(d.s, update);
        this.emit('price', update);
      } catch (e) { /* ignore parse errors */ }
    });

    this.ws.on('close', () => {
      this.connected = false;
      logger.warn('WS disconnected');
      this._scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      logger.error(`WS error: ${err.message}`);
      this.connected = false;
    });
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      logger.info('WS reconnecting...');
      this._connect();
    }, 5000);
  }

  getPrice(symbol) {
    return this.prices.get(symbol.toUpperCase()) || null;
  }

  getAllPrices() {
    return Object.fromEntries(this.prices);
  }

  stop() {
    if (this.ws) { try { this.ws.close(); } catch (e) {} }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.connected = false;
  }
}

// Singleton
const priceStream = new BinancePriceStream();
module.exports = priceStream;
