import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { cloneRepo } from '../services/gitService.js';

const router = Router();

router.get('/', asyncHandler((req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, git_url, local_path, branch, compile_cmd } = req.body;
  if (!name || !local_path) {
    return res.status(400).json({ message: 'name and local_path are required' });
  }

  if (git_url) {
    await cloneRepo(git_url, local_path);
  }

  const result = db.prepare(`
    INSERT INTO projects (name, git_url, local_path, branch, compile_cmd)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, git_url || null, local_path, branch || 'main', compile_cmd || 'npm run build');

  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid));
}));

router.get('/:id', asyncHandler((req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
}));

router.patch('/:id', asyncHandler((req, res) => {
  const { name, branch, compile_cmd } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  db.prepare(`
    UPDATE projects SET
      name = COALESCE(?, name),
      branch = COALESCE(?, branch),
      compile_cmd = COALESCE(?, compile_cmd)
    WHERE id = ?
  `).run(name || null, branch || null, compile_cmd || null, req.params.id);

  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
}));

router.delete('/:id', asyncHandler((req, res) => {
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Project not found' });
  res.json({ ok: true });
}));

// Features under project
router.get('/:projectId/features', asyncHandler((req, res) => {
  const features = db.prepare(
    'SELECT * FROM features WHERE project_id = ? ORDER BY created_at DESC'
  ).all(req.params.projectId);
  res.json(features);
}));

router.post('/:projectId/features', asyncHandler((req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'title is required' });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const result = db.prepare(
    'INSERT INTO features (project_id, title) VALUES (?, ?)'
  ).run(req.params.projectId, title);

  res.status(201).json(db.prepare('SELECT * FROM features WHERE id = ?').get(result.lastInsertRowid));
}));

export default router;
