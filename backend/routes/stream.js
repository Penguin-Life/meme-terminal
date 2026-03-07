/**
 * SSE Price Stream Route
 * Server-Sent Events for real-time price updates from Binance WebSocket.
 */

const express = require('express');
const router = express.Router();
const priceStream = require('../services/websocket');

// GET /api/stream/prices — SSE endpoint
router.get('/prices', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Send current prices immediately
  const current = priceStream.getAllPrices();
  if (Object.keys(current).length > 0) {
    res.write(`data: ${JSON.stringify({ type: 'snapshot', prices: current })}\n\n`);
  }

  // Stream updates
  const onPrice = (update) => {
    res.write(`data: ${JSON.stringify({ type: 'update', ...update })}\n\n`);
  };

  const onConnect = () => {
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  };

  priceStream.on('price', onPrice);
  priceStream.on('connected', onConnect);

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  req.on('close', () => {
    priceStream.off('price', onPrice);
    priceStream.off('connected', onConnect);
    clearInterval(heartbeat);
  });
});

// GET /api/stream/status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    connected: priceStream.connected,
    symbols: priceStream.symbols,
    priceCount: priceStream.prices.size,
    prices: priceStream.getAllPrices()
  });
});

module.exports = router;
