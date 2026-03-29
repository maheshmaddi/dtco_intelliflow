import { Router } from 'express';
import db from '../db/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createReqDocUpload } from '../services/fileService.js';

const router = Router();

router.get('/:id', asyncHandler((req, res) => {
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });
  res.json(feature);
}));

router.patch('/:id', asyncHandler((req, res) => {
  const { title, current_phase } = req.body;
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  db.prepare(`
    UPDATE features SET
      title = COALESCE(?, title),
      current_phase = COALESCE(?, current_phase)
    WHERE id = ?
  `).run(title || null, current_phase || null, req.params.id);

  res.json(db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id));
}));

router.delete('/:id', asyncHandler((req, res) => {
  const result = db.prepare('DELETE FROM features WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Feature not found' });
  res.json({ ok: true });
}));

router.post('/:id/upload-req-doc', asyncHandler(async (req, res) => {
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
  if (!feature) return res.status(404).json({ message: 'Feature not found' });

  const upload = createReqDocUpload(req.params.id);

  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const mb = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'file_size_limit_mb'").get()?.value || '5', 10);
        return res.status(400).json({ message: `File too large. Maximum size is ${mb} MB.` });
      }
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    db.prepare('UPDATE features SET req_doc_path = ?, req_doc_name = ? WHERE id = ?')
      .run(req.file.path, req.file.originalname, req.params.id);

    res.json({
      req_doc_path: req.file.path,
      req_doc_name: req.file.originalname,
      size: req.file.size
    });
  });
}));

export default router;
