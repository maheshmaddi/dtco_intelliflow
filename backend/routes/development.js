import { Router } from 'express';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runCommand, buildContext } from '../services/openclawService.js';
import streamManager from '../services/streamManager.js';
import { createFeatureBranch, pushBranch, slugifyTitle } from '../services/gitService.js';

const router = Router();

// GET current dev run for a feature
router.get('/features/:featureId/run', asyncHandler((req, res) => {
  const run = db.prepare(
    'SELECT * FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1'
  ).get(req.params.featureId);
  if (!run) return res.json(null);
  if (run.summary_json) run.summary = JSON.parse(run.summary_json);
  if (run.verify_log) run.verify = JSON.parse(run.verify_log);
  res.json(run);
}));

// Create feature branch
router.post('/features/:featureId/branch', asyncHandler(async (req, res) => {
  const featureId = parseInt(req.params.featureId);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(feature.project_id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const branchName = req.body.branch_name || slugifyTitle(feature.title);

  await createFeatureBranch(project.local_path, branchName, project.branch || 'main');

  // Try to push (non-fatal if no remote)
  try { await pushBranch(project.local_path, branchName); } catch (_) {}

  // Create dev run record
  const existing = db.prepare('SELECT id FROM dev_runs WHERE feature_id = ?').get(featureId);
  if (!existing) {
    db.prepare(
      "INSERT INTO dev_runs (feature_id, branch_name, step, status) VALUES (?, ?, 'branch', 'running')"
    ).run(featureId, branchName);
  } else {
    db.prepare("UPDATE dev_runs SET branch_name = ?, step = 'branch', status = 'running' WHERE feature_id = ?")
      .run(branchName, featureId);
  }

  db.prepare('UPDATE features SET branch_name = ? WHERE id = ?').run(branchName, featureId);

  res.json({ branchName });
}));

// Trigger /dev-implement
router.post('/features/:featureId/implement', asyncHandler((req, res) => {
  const featureId = parseInt(req.params.featureId);
  const ctx = buildContext('/dev-implement', featureId);
  const operationId = runCommand({ command: '/dev-implement', context: ctx, featureId });

  const run = db.prepare('SELECT id FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);
  if (run) db.prepare("UPDATE dev_runs SET step = 'implement', status = 'running' WHERE id = ?").run(run.id);

  res.json({ operationId });
}));

// Compile — runs compile_cmd, streams output
router.post('/runs/:runId/compile', asyncHandler((req, res) => {
  const run = db.prepare('SELECT * FROM dev_runs WHERE id = ?').get(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Dev run not found' });

  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(run.feature_id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(feature.project_id);
  const compileCmd = project?.compile_cmd || 'npm run build';
  const cwd = project?.local_path || process.cwd();

  const operationId = randomUUID();
  db.prepare("UPDATE dev_runs SET step = 'compile', status = 'running' WHERE id = ?").run(run.id);

  setImmediate(() => {
    const [bin, ...args] = compileCmd.split(' ');
    const proc = spawn(bin, args, { cwd, shell: true });
    let log = '';

    proc.stdout.on('data', chunk => {
      const text = chunk.toString();
      log += text;
      text.split('\n').filter(Boolean).forEach(line => {
        streamManager.broadcast(operationId, { type: 'chunk', text: line });
      });
    });

    proc.stderr.on('data', chunk => {
      const text = chunk.toString();
      log += text;
      text.split('\n').filter(Boolean).forEach(line => {
        streamManager.broadcast(operationId, { type: 'chunk', text: line });
      });
    });

    proc.on('close', code => {
      db.prepare('UPDATE dev_runs SET compile_log = ?, step = ? WHERE id = ?')
        .run(log, code === 0 ? 'verify' : 'compile', run.id);
      streamManager.broadcast(operationId, {
        type: 'done',
        result: { exitCode: code, success: code === 0 }
      });
      streamManager.cleanup(operationId);
    });
  });

  res.json({ operationId });
}));

// Trigger /dev-verify
router.post('/runs/:runId/verify', asyncHandler((req, res) => {
  const run = db.prepare('SELECT * FROM dev_runs WHERE id = ?').get(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Dev run not found' });

  const ctx = buildContext('/dev-verify', run.feature_id);
  const operationId = runCommand({ command: '/dev-verify', context: ctx, featureId: run.feature_id });

  db.prepare("UPDATE dev_runs SET step = 'verify', status = 'running' WHERE id = ?").run(run.id);
  res.json({ operationId });
}));

// Push branch + trigger /dev-summarize
router.post('/runs/:runId/push', asyncHandler(async (req, res) => {
  const run = db.prepare('SELECT * FROM dev_runs WHERE id = ?').get(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Dev run not found' });

  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(run.feature_id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(feature.project_id);

  try {
    await pushBranch(project.local_path, run.branch_name);
  } catch (err) {
    // Non-fatal — continue with summary generation
    console.warn('Push warning:', err.message);
  }

  db.prepare("UPDATE dev_runs SET step = 'push' WHERE id = ?").run(run.id);

  const ctx = buildContext('/dev-summarize', run.feature_id);
  const operationId = runCommand({ command: '/dev-summarize', context: ctx, featureId: run.feature_id });

  res.json({ operationId });
}));

// Approve dev run → advance to code review
router.post('/runs/:runId/approve', asyncHandler((req, res) => {
  const run = db.prepare('SELECT * FROM dev_runs WHERE id = ?').get(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Dev run not found' });

  db.prepare("UPDATE dev_runs SET status = 'done', step = 'done' WHERE id = ?").run(run.id);
  db.prepare("UPDATE features SET current_phase = 'codereview' WHERE id = ?").run(run.feature_id);

  if (req.body.comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('dev_run', ?, ?)")
      .run(run.id, req.body.comment);
  }

  db.prepare("INSERT INTO phase_transitions (feature_id, from_phase, to_phase, action, note) VALUES (?, 'development', 'codereview', 'approved', ?)")
    .run(run.feature_id, req.body.comment || null);

  res.json({ ok: true });
}));

// Request changes
router.post('/runs/:runId/request-changes', asyncHandler((req, res) => {
  const { comment } = req.body;
  const run = db.prepare('SELECT * FROM dev_runs WHERE id = ?').get(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Dev run not found' });

  if (comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('dev_run', ?, ?)")
      .run(run.id, comment);
  }

  // Re-trigger implementation with new context
  const ctx = buildContext('/dev-implement', run.feature_id);
  const operationId = runCommand({ command: '/dev-implement', context: ctx, featureId: run.feature_id });
  db.prepare("UPDATE dev_runs SET step = 'implement', status = 'running' WHERE id = ?").run(run.id);

  res.json({ ok: true, operationId });
}));

// GET comments for a run
router.get('/runs/:runId/comments', asyncHandler((req, res) => {
  const comments = db.prepare(
    "SELECT * FROM comments WHERE entity_type = 'dev_run' AND entity_id = ? ORDER BY created_at"
  ).all(req.params.runId);
  res.json(comments);
}));

router.post('/runs/:runId/comments', asyncHandler((req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });
  db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('dev_run', ?, ?)")
    .run(req.params.runId, content);
  res.json({ ok: true });
}));

export default router;
