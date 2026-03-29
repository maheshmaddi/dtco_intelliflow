import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { runCommand, buildContext } from '../services/openclawService.js';

const router = Router();

// GET all review revisions for a feature
router.get('/features/:featureId/revisions', asyncHandler((req, res) => {
  const revisions = db.prepare(
    'SELECT * FROM review_revisions WHERE feature_id = ? ORDER BY version ASC'
  ).all(req.params.featureId);

  for (const rev of revisions) {
    rev.findings = db.prepare(
      'SELECT * FROM review_findings WHERE review_revision_id = ? ORDER BY severity DESC, id ASC'
    ).all(rev.id);
    rev.comments = db.prepare(
      "SELECT * FROM comments WHERE entity_type = 'review_revision' AND entity_id = ? ORDER BY created_at"
    ).all(rev.id);
  }

  res.json(revisions);
}));

// Trigger review-analyze
router.post('/features/:featureId/analyze', asyncHandler((req, res) => {
  const featureId = parseInt(req.params.featureId);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  const ctx = buildContext('/review-analyze', featureId);
  const operationId = runCommand({ command: '/review-analyze', context: ctx, featureId });
  res.json({ operationId });
}));

// Auto-fix a finding
router.post('/findings/:findingId/fix', asyncHandler((req, res) => {
  const finding = db.prepare('SELECT * FROM review_findings WHERE id = ?').get(req.params.findingId);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });

  const rev = db.prepare('SELECT * FROM review_revisions WHERE id = ?').get(finding.review_revision_id);
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(rev.feature_id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(feature.project_id);

  const ctx = {
    command: `/review-fix ${finding.finding_id}`,
    codebasePath: project?.local_path || process.cwd(),
    findingId: finding.finding_id,
    finding: {
      severity: finding.severity,
      file: finding.file,
      line: finding.line,
      title: finding.title,
      suggestion: finding.suggestion
    },
    branchName: feature.branch_name || ''
  };

  const operationId = runCommand({
    command: `/review-fix ${finding.finding_id}`,
    context: ctx,
    featureId: rev.feature_id
  });

  res.json({ operationId });
}));

// Mark finding as won't fix
router.patch('/findings/:findingId', asyncHandler((req, res) => {
  const { wont_fix, wont_fix_reason, resolved } = req.body;
  const finding = db.prepare('SELECT * FROM review_findings WHERE id = ?').get(req.params.findingId);
  if (!finding) return res.status(404).json({ message: 'Finding not found' });

  db.prepare(`
    UPDATE review_findings SET
      wont_fix = COALESCE(?, wont_fix),
      wont_fix_reason = COALESCE(?, wont_fix_reason),
      resolved = COALESCE(?, resolved)
    WHERE id = ?
  `).run(
    wont_fix !== undefined ? (wont_fix ? 1 : 0) : null,
    wont_fix_reason || null,
    resolved !== undefined ? (resolved ? 1 : 0) : null,
    req.params.findingId
  );

  res.json(db.prepare('SELECT * FROM review_findings WHERE id = ?').get(req.params.findingId));
}));

// Approve review revision → advance to testing
router.post('/revisions/:revId/approve', asyncHandler((req, res) => {
  const rev = db.prepare('SELECT * FROM review_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  // Check no unresolved critical findings
  const unresolvedCritical = db.prepare(`
    SELECT COUNT(*) as n FROM review_findings
    WHERE review_revision_id = ? AND severity = 'critical' AND resolved = 0 AND wont_fix = 0
  `).get(rev.id);

  if (unresolvedCritical.n > 0) {
    return res.status(400).json({
      message: `${unresolvedCritical.n} critical finding(s) unresolved. Resolve or mark as Won't Fix before approving.`
    });
  }

  db.prepare("UPDATE review_revisions SET status = 'approved' WHERE id = ?").run(rev.id);
  db.prepare("UPDATE features SET current_phase = 'testing' WHERE id = ?").run(rev.feature_id);

  if (req.body.comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('review_revision', ?, ?)")
      .run(rev.id, req.body.comment);
  }

  db.prepare("INSERT INTO phase_transitions (feature_id, from_phase, to_phase, action, note) VALUES (?, 'codereview', 'testing', 'approved', ?)")
    .run(rev.feature_id, req.body.comment || null);

  res.json({ ok: true });
}));

// Request another review pass
router.post('/revisions/:revId/request-changes', asyncHandler((req, res) => {
  const { comment } = req.body;
  const rev = db.prepare('SELECT * FROM review_revisions WHERE id = ?').get(req.params.revId);
  if (!rev) return res.status(404).json({ message: 'Revision not found' });

  if (comment) {
    db.prepare("INSERT INTO comments (entity_type, entity_id, content) VALUES ('review_revision', ?, ?)")
      .run(rev.id, comment);
  }

  // Re-trigger analysis
  const ctx = buildContext('/review-analyze', rev.feature_id);
  const operationId = runCommand({ command: '/review-analyze', context: ctx, featureId: rev.feature_id });

  res.json({ ok: true, operationId });
}));

export default router;
