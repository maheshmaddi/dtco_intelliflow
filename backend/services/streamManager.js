// SSE client registry: operationId → Set<ExpressResponse>
const clients = new Map();

const streamManager = {
  register(operationId, res) {
    if (!clients.has(operationId)) clients.set(operationId, new Set());
    clients.get(operationId).add(res);
  },

  unregister(operationId, res) {
    const subs = clients.get(operationId);
    if (subs) {
      subs.delete(res);
      if (subs.size === 0) clients.delete(operationId);
    }
  },

  broadcast(operationId, event) {
    const subs = clients.get(operationId);
    if (!subs || subs.size === 0) return;
    const payload = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
    for (const res of subs) {
      try { res.write(payload); } catch (_) { /* client disconnected */ }
    }
  },

  cleanup(operationId) {
    clients.delete(operationId);
  },

  has(operationId) {
    return clients.has(operationId);
  }
};

export default streamManager;
