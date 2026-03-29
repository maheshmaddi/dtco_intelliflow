import { Router } from 'express';
import { execSync } from 'child_process';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runCommand, buildContext } from '../services/openclawService.js';
import streamManager from '../services/streamManager.js';
import { getSetting } from '../db/client.js';

const router = Router();

// SSE stream endpoint — client subscribes here to receive live output
router.get('/stream/:operationId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send a heartbeat immediately so the connection is confirmed
  res.write('event: message\ndata: {"type":"connected"}\n\n');

  const { operationId } = req.params;
  streamManager.register(operationId, res);

  // Heartbeat every 15s to prevent connection timeout
  const hb = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) { clearInterval(hb); }
  }, 15000);

  req.on('close', () => {
    clearInterval(hb);
    streamManager.unregister(operationId, res);
  });
});

// Run an OpenClaw command — returns operationId immediately
router.post('/command', asyncHandler((req, res) => {
  const { command, context, featureId } = req.body;
  if (!command) return res.status(400).json({ message: 'command is required' });

  // Build context from DB if not explicitly provided
  const ctx = context || (featureId ? buildContext(command, featureId) : {});
  const operationId = runCommand({ command, context: ctx, featureId });

  res.json({ operationId });
}));

// Trigger a named command for a feature (convenience endpoint used by phase routes)
router.post('/features/:featureId/run/:command(*)', asyncHandler((req, res) => {
  const { featureId, command } = req.params;
  const cmd = '/' + command.replace(/^\//, '');
  const extraContext = req.body.context || {};
  const ctx = { ...buildContext(cmd, parseInt(featureId)), ...extraContext };
  const operationId = runCommand({ command: cmd, context: ctx, featureId: parseInt(featureId) });
  res.json({ operationId });
}));

// Test if the OpenClaw CLI is accessible
router.get('/health', asyncHandler((req, res) => {
  const cmd = getSetting('openclaw_cmd') || 'openclaw';
  try {
    const output = execSync(`${cmd} --version 2>&1 || ${cmd} -v 2>&1 || echo "ok"`, {
      timeout: 5000,
      encoding: 'utf8'
    });
    res.json({ ok: true, output: output.trim() });
  } catch (err) {
    res.status(503).json({ ok: false, message: err.message });
  }
}));

export default router;
