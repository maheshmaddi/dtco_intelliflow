import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const VALID_TYPES = ['arch_revision', 'dev_run', 'review_revision', 'test_revision'];

router.get('/:entityType/:entityId', asyncHandler((req, res) => {
  const { entityType, entityId } = req.params;
  if (!VALID_TYPES.includes(entityType)) {
    return res.status(400).json({ message: 'Invalid entity type' });
  }
  const comments = db.prepare(
    'SELECT * FROM comments WHERE entity_type = ? AND entity_id = ? ORDER BY created_at'
  ).all(entityType, entityId);
  res.json(comments);
}));

router.post('/:entityType/:entityId', asyncHandler((req, res) => {
  const { entityType, entityId } = req.params;
  const { content } = req.body;
  if (!VALID_TYPES.includes(entityType)) {
    return res.status(400).json({ message: 'Invalid entity type' });
  }
  if (!content) return res.status(400).json({ message: 'content is required' });

  const result = db.prepare(
    'INSERT INTO comments (entity_type, entity_id, content) VALUES (?, ?, ?)'
  ).run(entityType, entityId, content);

  res.status(201).json(db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid));
}));

export default router;
