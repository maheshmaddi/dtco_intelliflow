// SSE client registry: operationId → Set<ExpressResponse>
const clients = new Map();
// Event buffer: operationId → event[] (capped at 500 per operation)
const buffers = new Map();

const streamManager = {
  register(operationId, res) {
    if (!clients.has(operationId)) clients.set(operationId, new Set());
    clients.get(operationId).add(res);

    // Replay buffered events to late-connecting clients
    const buffered = buffers.get(operationId) || [];
    for (const event of buffered) {
      const payload = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
      try { res.write(payload); } catch (_) {}
    }
  },

  unregister(operationId, res) {
    const subs = clients.get(operationId);
    if (subs) {
      subs.delete(res);
      if (subs.size === 0) clients.delete(operationId);
    }
  },

  broadcast(operationId, event) {
    // Buffer event (cap at 500 to prevent memory leak)
    if (!buffers.has(operationId)) buffers.set(operationId, []);
    const buf = buffers.get(operationId);
    buf.push(event);
    if (buf.length > 500) buf.shift();

    // Fan out to current subscribers
    const subs = clients.get(operationId) ?? [];
    const payload = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
    for (const res of subs) {
      try { res.write(payload); } catch (_) { /* client disconnected */ }
    }
  },

  cleanup(operationId) {
    clients.delete(operationId);
    // Keep buffer for 30s so very late subscribers still see the result
    setTimeout(() => buffers.delete(operationId), 30_000);
  },

  has(operationId) {
    return clients.has(operationId) || buffers.has(operationId);
  }
};

export default streamManager;
