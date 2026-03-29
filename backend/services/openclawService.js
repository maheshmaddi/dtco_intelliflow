import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import db, { getSetting } from '../db/client.js';
import streamManager from './streamManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function writeTempJson(data) {
  const tmpDir = join(tmpdir(), 'dtco-intelliflow');
  mkdirSync(tmpDir, { recursive: true });
  const file = join(tmpDir, `ctx-${randomUUID()}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

// Parse the last ```json ... ``` block from OpenClaw output
function extractJsonResult(output) {
  const match = output.match(/```json\s*([\s\S]*?)```\s*$/);
  if (match) {
    try { return JSON.parse(match[1]); } catch (_) {}
  }
  // Try to find any JSON object at the end of output
  const jsonMatch = output.match(/(\{[\s\S]*\})\s*$/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch (_) {}
  }
  return null;
}

// Persist parsed results to the appropriate DB table
function persistResult(command, result, featureId) {
  if (!result || !featureId) return;

  try {
    if (command === '/arch-analyze' || command === '/arch-replan') {
      // result: { plan_md, sequence_diag, state_diag, questions: [{question}] }
      const lastRev = db.prepare(
        'SELECT MAX(version) as v FROM arch_revisions WHERE feature_id = ?'
      ).get(featureId);
      const version = (lastRev?.v || 0) + 1;

      const rev = db.prepare(`
        INSERT INTO arch_revisions (feature_id, version, plan_md, sequence_diag, state_diag, status)
        VALUES (?, ?, ?, ?, ?, 'pending_approval')
      `).run(featureId, version,
        result.plan_md || result.plan || null,
        result.sequence_diag || result.sequenceDiagram || null,
        result.state_diag || result.stateDiagram || null
      );

      if (Array.isArray(result.questions)) {
        const insertQ = db.prepare(
          'INSERT INTO arch_questions (arch_revision_id, question) VALUES (?, ?)'
        );
        for (const q of result.questions) {
          insertQ.run(rev.lastInsertRowid, typeof q === 'string' ? q : q.question);
        }
      }
    }

    if (command === '/dev-implement') {
      const run = db.prepare('SELECT id FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);
      if (run) {
        db.prepare("UPDATE dev_runs SET step = 'compile', status = 'running' WHERE id = ?").run(run.id);
      }
    }

    if (command === '/dev-verify') {
      const run = db.prepare('SELECT id FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);
      if (run) {
        db.prepare("UPDATE dev_runs SET verify_log = ?, step = 'push' WHERE id = ?")
          .run(JSON.stringify(result), run.id);
      }
    }

    if (command === '/dev-summarize') {
      const run = db.prepare('SELECT id FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);
      if (run) {
        db.prepare("UPDATE dev_runs SET summary_json = ?, step = 'done', status = 'done' WHERE id = ?")
          .run(JSON.stringify(result), run.id);
      }
    }

    if (command === '/review-analyze') {
      const lastRev = db.prepare(
        'SELECT MAX(version) as v FROM review_revisions WHERE feature_id = ?'
      ).get(featureId);
      const version = (lastRev?.v || 0) + 1;

      const rev = db.prepare(
        "INSERT INTO review_revisions (feature_id, version, status) VALUES (?, ?, 'pending')"
      ).run(featureId, version);

      if (Array.isArray(result.findings)) {
        const insertF = db.prepare(`
          INSERT INTO review_findings
            (review_revision_id, finding_id, severity, file, line, category, title, suggestion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const f of result.findings) {
          insertF.run(
            rev.lastInsertRowid,
            f.id || f.finding_id,
            f.severity || 'info',
            f.file || null,
            f.line || null,
            f.category || null,
            f.title,
            f.suggestion || f.fix || null
          );
        }
      }
    }

    if (command.startsWith('/review-fix')) {
      // result: { finding_id, resolved: true }
      if (result.finding_id || result.findingId) {
        const fid = result.finding_id || result.findingId;
        db.prepare('UPDATE review_findings SET resolved = 1 WHERE finding_id = ?').run(fid);
      }
    }

    if (command === '/test-plan') {
      const lastRev = db.prepare(
        'SELECT MAX(version) as v FROM test_revisions WHERE feature_id = ?'
      ).get(featureId);
      const version = (lastRev?.v || 0) + 1;

      const rev = db.prepare(`
        INSERT INTO test_revisions (feature_id, version, coverage_est, status)
        VALUES (?, ?, ?, 'draft')
      `).run(featureId, version, result.coverage_est || result.coverage || null);

      if (Array.isArray(result.cases || result.test_cases)) {
        const cases = result.cases || result.test_cases;
        const insertC = db.prepare(
          'INSERT INTO test_cases (test_revision_id, case_id, name, type, status) VALUES (?, ?, ?, ?, ?)'
        );
        for (const c of cases) {
          insertC.run(rev.lastInsertRowid, c.id || c.case_id, c.name, c.type || 'Unit', 'planned');
        }
      }
    }

    if (command === '/test-implement') {
      const rev = db.prepare('SELECT id FROM test_revisions WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);
      if (rev) {
        db.prepare("UPDATE test_cases SET status = 'written' WHERE test_revision_id = ?").run(rev.id);
        db.prepare("UPDATE test_revisions SET status = 'approved' WHERE id = ?").run(rev.id);
      }
    }
  } catch (err) {
    console.error('persistResult error:', err);
  }
}

export function runCommand({ command, context, featureId }) {
  const operationId = randomUUID();
  const cmdPath = getSetting('openclaw_cmd') || 'openclaw';
  const contextFile = writeTempJson(context);

  // Defer spawning so caller can set up SSE subscription first
  setImmediate(() => {
    let proc;
    try {
      proc = spawn(cmdPath, [command, '--context-file', contextFile], {
        cwd: context.codebasePath || process.cwd(),
        env: { ...process.env }
      });
    } catch (err) {
      streamManager.broadcast(operationId, { type: 'error', message: `Failed to spawn OpenClaw: ${err.message}` });
      streamManager.broadcast(operationId, { type: 'done', result: null });
      return;
    }

    let fullOutput = '';

    proc.stdout.on('data', chunk => {
      const text = chunk.toString();
      fullOutput += text;
      // Split into lines and broadcast each
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          streamManager.broadcast(operationId, { type: 'chunk', text: line });
        }
      }
    });

    proc.stderr.on('data', chunk => {
      const text = chunk.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          streamManager.broadcast(operationId, { type: 'chunk', text: `[stderr] ${line}` });
        }
      }
    });

    proc.on('close', code => {
      const result = extractJsonResult(fullOutput);
      persistResult(command, result, featureId);
      streamManager.broadcast(operationId, { type: 'done', result: result || { raw: fullOutput, exitCode: code } });
      streamManager.cleanup(operationId);
    });

    proc.on('error', err => {
      streamManager.broadcast(operationId, { type: 'error', message: err.message });
      streamManager.broadcast(operationId, { type: 'done', result: null });
      streamManager.cleanup(operationId);
    });
  });

  return operationId;
}

// Build context objects for each OpenClaw command
export function buildContext(command, featureId) {
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
  if (!feature) throw Object.assign(new Error('Feature not found'), { status: 404 });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(feature.project_id);
  const codebasePath = project?.local_path || process.cwd();

  let reqDocContent = '';
  if (feature.req_doc_path) {
    try { reqDocContent = readFileSync(feature.req_doc_path, 'utf8'); } catch (_) {}
  }

  const latestArch = db.prepare(
    "SELECT * FROM arch_revisions WHERE feature_id = ? AND status = 'approved' ORDER BY version DESC LIMIT 1"
  ).get(featureId) || db.prepare(
    'SELECT * FROM arch_revisions WHERE feature_id = ? ORDER BY version DESC LIMIT 1'
  ).get(featureId);

  const latestDev = db.prepare('SELECT * FROM dev_runs WHERE feature_id = ? ORDER BY id DESC LIMIT 1').get(featureId);

  switch (command) {
    case '/arch-analyze':
      return {
        command,
        codebasePath,
        requirementDoc: reqDocContent,
        featureTitle: feature.title,
        existingQuestions: []
      };

    case '/arch-replan': {
      const questions = latestArch
        ? db.prepare('SELECT * FROM arch_questions WHERE arch_revision_id = ?').all(latestArch.id)
        : [];
      const comments = db.prepare(
        "SELECT content FROM comments WHERE entity_type = 'arch_revision' AND entity_id = ? ORDER BY created_at"
      ).all(latestArch?.id || 0).map(c => c.content);
      return {
        command,
        codebasePath,
        requirementDoc: reqDocContent,
        previousPlan: latestArch?.plan_md || '',
        comments,
        questionsAndAnswers: questions.map(q => ({ question: q.question, answer: q.answer }))
      };
    }

    case '/dev-implement':
      return {
        command,
        codebasePath,
        archPlan: latestArch?.plan_md || '',
        branchName: feature.branch_name || '',
        featureTitle: feature.title
      };

    case '/dev-verify':
      return {
        command,
        codebasePath,
        archPlan: latestArch?.plan_md || '',
        branchName: feature.branch_name || '',
        compileLog: latestDev?.compile_log || ''
      };

    case '/dev-summarize':
      return {
        command,
        codebasePath,
        branchName: feature.branch_name || '',
        baseBranch: project?.branch || 'main',
        archPlan: latestArch?.plan_md || ''
      };

    case '/review-analyze': {
      const lenses = JSON.parse(getSetting('review_lenses') || '[]');
      return {
        command,
        codebasePath,
        branchName: feature.branch_name || '',
        baseBranch: project?.branch || 'main',
        archPlan: latestArch?.plan_md || '',
        reviewLenses: lenses
      };
    }

    case '/test-plan':
      return {
        command,
        codebasePath,
        requirementDoc: reqDocContent,
        archPlan: latestArch?.plan_md || '',
        featureTitle: feature.title
      };

    case '/test-implement': {
      const latestTestRev = db.prepare(
        "SELECT * FROM test_revisions WHERE feature_id = ? AND status = 'approved' ORDER BY version DESC LIMIT 1"
      ).get(featureId) || db.prepare(
        'SELECT * FROM test_revisions WHERE feature_id = ? ORDER BY version DESC LIMIT 1'
      ).get(featureId);
      const testCases = latestTestRev
        ? db.prepare('SELECT * FROM test_cases WHERE test_revision_id = ?').all(latestTestRev.id)
        : [];
      return {
        command,
        codebasePath,
        branchName: feature.branch_name || '',
        testCases,
        archPlan: latestArch?.plan_md || ''
      };
    }

    default:
      return { command, codebasePath };
  }
}
