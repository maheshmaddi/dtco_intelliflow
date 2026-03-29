import multer from 'multer';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import db from '../db/client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, '..', 'uploads');
mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown'
];

function getFileSizeLimitBytes() {
  const mb = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'file_size_limit_mb'").get()?.value || '5', 10);
  return mb * 1024 * 1024;
}

function featureUploadDir(featureId) {
  const dir = join(UPLOADS_DIR, String(featureId));
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function createReqDocUpload(featureId) {
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, featureUploadDir(featureId || req.params.id));
    },
    filename(req, file, cb) {
      const ext = extname(file.originalname).toLowerCase() || '.txt';
      cb(null, `req-doc-${randomUUID()}${ext}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: getFileSizeLimitBytes() },
    fileFilter(req, file, cb) {
      const ext = extname(file.originalname).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const err = new Error(`File type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`);
        err.status = 400;
        cb(err);
      }
    }
  });
}

export function getFileSizeLimitMB() {
  return parseInt(db.prepare("SELECT value FROM settings WHERE key = 'file_size_limit_mb'").get()?.value || '5', 10);
}
