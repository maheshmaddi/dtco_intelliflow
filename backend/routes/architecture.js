import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runCommand, buildContext } from '../services/openclawService.js';

const router = Router();

// GET all arch revisions for a feature
router.get('/features/:featureId/revisions', asyncHandler((req, res) => {
  const revisions = db.prepare(
    'SELECT * FROM arch_revisions WHERE feature_id = ? ORDER BY version ASC'
  ).all(req.params.featureId);
  // Attach questions to each revision
  for (const rev of revisions) {
    rev.questions = db.prepare(
      'SELECT * FROM arch_questions WHERE arch_revision_id = ? ORDER BY id'
    ).all(rev.id);
    rev.comments = db.prepare(
      "SELECT * FROM comments WHERE entity_type = 'arch_revision' AND entity_id = ? ORDER BY created_at"
    ).all(rev.id);
  }
  res.json(revisions);
}));

// GET single revision
router.get('/revisions/:revId', asyncHandler((req, res) => {
  const rev = db.prepare('SELECT * FROM arch_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });
  rev.questions = db.prepare('SELECT * FROM arch_questions WHERE arch_revision_id = ? ORDER BY id').all(rev.id);
  rev.comments = db.prepare(
    "SELECT * FROM comments WHERE entity_type = 'arch_revision' AND entity_id = ? ORDER BY created_at"
  ).all(rev.id);
  res.json(rev);
}));

// Trigger arch-analyze
router.post('/features/:featureId/analyze', asyncHandler((req, res) => {
  const featureId = parseInt(req.params.featureId);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  const ctx = buildContext('/arch-analyze', featureId);
  const operationId = runCommand({ command: '/arch-analyze', context: ctx, featureId });
  res.json({ operationId });
}));

// Trigger arch-replan
router.post('/features/:featureId/replan', asyncHandler((req, res) => {
  const featureId = parseInt(req.params.featureId);
  const ctx = buildContext('/arch-replan', featureId);
  const operationId = runCommand({ command: '/arch-replan', context: ctx, featureId });
  res.json({ operationId });
}));

// Answer a question
router.patch('/questions/:qId', asyncHandler((req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ message: 'answer is required' });

  const q = db.prepare('SELECT * FROM arch_questions WHERE id = ?').get(req.params.qId);
  if (!q) return res.status(404).json({ message: 'Question not found' });

  db.prepare('UPDATE arch_questions SET answer = ?, is_answered = 1 WHERE id = ?')
    .run(answer, req.params.qId);

  res.json(db.prepare('SELECT * FROM arch_questions WHERE id = ?').get(req.params.qId));
}));

// Add comment to revision
router.post('/revisions/:revId/comments', asyncHandler((req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });

  const rev = db.prepare('SELECT * FROM arch_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('arch_revision', ?, ?)")
    .run(req.params.revId, content);

  res.json({ ok: true });
}));

// Approve revision → advance feature to development
router.post('/revisions/:revId/approve', asyncHandler((req, res) => {
  const rev = db.prepare('SELECT * FROM arch_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  // Check all questions answered
  const unanswered = db.prepare(
    'SELECT COUNT(*) as n FROM arch_questions WHERE arch_revision_id = ? AND is_answered = 0'
  ).get(rev.id);
  if (unanswered.n > 0) {
    return res.status(400).json({ message: `${unanswered.n} question(s) still unanswered` });
  }

  db.prepare("UPDATE arch_revisions SET status = 'approved' WHERE id = ?").run(rev.id);
  db.prepare("UPDATE features SET current_phase = 'development' WHERE id = ?").run(rev.feature_id);

  if (req.body.comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('arch_revision', ?, ?)")
      .run(rev.id, req.body.comment);
  }

  db.prepare("INSERT INTO phase_transitions (feature_id, from_phase, to_phase, action, note) VALUES (?, 'architecture', 'development', 'approved', ?)")
    .run(rev.feature_id, req.body.comment || null);

  res.json({ ok: true });
}));

// Reject / request revision
router.post('/revisions/:revId/reject', asyncHandler((req, res) => {
  const { comment } = req.body;
  const rev = db.prepare('SELECT * FROM arch_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  db.prepare("UPDATE arch_revisions SET status = 'rejected' WHERE id = ?").run(rev.id);

  if (comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('arch_revision', ?, ?)")
      .run(rev.id, comment);
  }

  db.prepare("INSERT INTO phase_transitions (feature_id, from_phase, to_phase, action, note) VALUES (?, 'architecture', 'architecture', 'revision_requested', ?)")
    .run(rev.feature_id, comment || null);

  // Auto-trigger replan
  const ctx = buildContext('/arch-replan', rev.feature_id);
  const operationId = runCommand({ command: '/arch-replan', context: ctx, featureId: rev.feature_id });

  res.json({ ok: true, operationId });
}));

export default router;
