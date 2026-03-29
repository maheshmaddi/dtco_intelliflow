PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO settings VALUES
  ('openclaw_cmd',       'openclaw'),
  ('file_size_limit_mb', '5'),
  ('default_branch',     'main'),
  ('review_lenses',      '["Architecture Compliance","Security Patterns","Performance","Code Quality","Documentation","Test Coverage"]');

CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  git_url      TEXT,
  local_path   TEXT NOT NULL UNIQUE,
  branch       TEXT NOT NULL DEFAULT 'main',
  compile_cmd  TEXT NOT NULL DEFAULT 'npm run build',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS features (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  current_phase  TEXT NOT NULL DEFAULT 'architecture',
  req_doc_path   TEXT,
  req_doc_name   TEXT,
  branch_name    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS arch_revisions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id    INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL DEFAULT 1,
  plan_md       TEXT,
  sequence_diag TEXT,
  state_diag    TEXT,
  status        TEXT NOT NULL DEFAULT 'draft',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(feature_id, version)
);

CREATE TABLE IF NOT EXISTS arch_questions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  arch_revision_id INTEGER NOT NULL REFERENCES arch_revisions(id) ON DELETE CASCADE,
  question         TEXT NOT NULL,
  answer           TEXT,
  is_answered      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dev_runs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id   INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  branch_name  TEXT NOT NULL,
  step         TEXT NOT NULL DEFAULT 'branch',
  status       TEXT NOT NULL DEFAULT 'pending',
  compile_log  TEXT,
  verify_log   TEXT,
  summary_json TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS review_revisions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id  INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(feature_id, version)
);

CREATE TABLE IF NOT EXISTS review_findings (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  review_revision_id  INTEGER NOT NULL REFERENCES review_revisions(id) ON DELETE CASCADE,
  finding_id          TEXT NOT NULL,
  severity            TEXT NOT NULL,
  file                TEXT,
  line                INTEGER,
  category            TEXT,
  title               TEXT NOT NULL,
  suggestion          TEXT,
  resolved            INTEGER NOT NULL DEFAULT 0,
  wont_fix            INTEGER NOT NULL DEFAULT 0,
  wont_fix_reason     TEXT
);

CREATE TABLE IF NOT EXISTS test_revisions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id   INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  version      INTEGER NOT NULL DEFAULT 1,
  status       TEXT NOT NULL DEFAULT 'draft',
  coverage_est TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(feature_id, version)
);

CREATE TABLE IF NOT EXISTS test_cases (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  test_revision_id INTEGER NOT NULL REFERENCES test_revisions(id) ON DELETE CASCADE,
  case_id          TEXT NOT NULL,
  name             TEXT NOT NULL,
  type             TEXT,
  status           TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id   INTEGER NOT NULL,
  content     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS phase_transitions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id  INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  from_phase  TEXT NOT NULL,
  to_phase    TEXT NOT NULL,
  action      TEXT NOT NULL,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
