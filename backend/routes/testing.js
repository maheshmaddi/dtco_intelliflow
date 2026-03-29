import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runCommand, buildContext } from '../services/openclawService.js';

const router = Router();

// GET all test revisions for a feature
router.get('/features/:featureId/revisions', asyncHandler((req, res) => {
  const revisions = db.prepare(
    'SELECT * FROM test_revisions WHERE feature_id = ? ORDER BY version ASC'
  ).all(req.params.featureId);

  for (const rev of revisions) {
    rev.cases = db.prepare(
      'SELECT * FROM test_cases WHERE test_revision_id = ? ORDER BY id'
    ).all(rev.id);
    rev.comments = db.prepare(
      "SELECT * FROM comments WHERE entity_type = 'test_revision' AND entity_id = ? ORDER BY created_at"
    ).all(rev.id);
  }

  res.json(revisions);
}));

// Trigger test-plan
router.post('/features/:featureId/plan', asyncHandler((req, res) => {
  const featureId = parseInt(req.params.featureId);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  const ctx = buildContext('/test-plan', featureId);
  const operationId = runCommand({ command: '/test-plan', context: ctx, featureId });
  res.json({ operationId });
}));

// Trigger test-implement (write actual test files)
router.post('/revisions/:revId/implement', asyncHandler((req, res) => {
  const rev = db.prepare('SELECT * FROM test_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  if (rev.status !== 'approved') {
    return res.status(400).json({ message: 'Test plan must be approved before implementing' });
  }

  const ctx = buildContext('/test-implement', rev.feature_id);
  const operationId = runCommand({ command: '/test-implement', context: ctx, featureId: rev.feature_id });
  res.json({ operationId });
}));

// Add comment
router.post('/revisions/:revId/comments', asyncHandler((req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });

  const rev = db.prepare('SELECT * FROM test_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('test_revision', ?, ?)")
    .run(rev.id, content);

  res.json({ ok: true });
}));

// Approve test plan
router.post('/revisions/:revId/approve', asyncHandler((req, res) => {
  const rev = db.prepare('SELECT * FROM test_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  db.prepare("UPDATE test_revisions SET status = 'approved' WHERE id = ?").run(rev.id);

  if (req.body.comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('test_revision', ?, ?)")
      .run(rev.id, req.body.comment);
  }

  db.prepare("INSERT INTO phase_transitions (feature_id, from_phase, to_phase, action, note) VALUES (?, 'testing', 'testing', 'approved', ?)")
    .run(rev.feature_id, req.body.comment || null);

  res.json({ ok: true });
}));

// Request revision (re-trigger test plan)
router.post('/revisions/:revId/request-changes', asyncHandler((req, res) => {
  const { comment } = req.body;
  const rev = db.prepare('SELECT * FROM test_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  if (comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('test_revision', ?, ?)")
      .run(rev.id, comment);
  }

  const ctx = buildContext('/test-plan', rev.feature_id);
  const operationId = runCommand({ command: '/test-plan', context: ctx, featureId: rev.feature_id });

  res.json({ ok: true, operationId });
}));

// Update test case status
router.patch('/cases/:caseId', asyncHandler((req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE test_cases SET status = ? WHERE id = ?').run(status, req.params.caseId);
  res.json(db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.caseId));
}));

export default router;
