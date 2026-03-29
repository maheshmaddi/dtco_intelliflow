import React, { useState, useEffect } from 'react';
import {
  C, Card, Btn, PhaseHeader, Step, Info, Mono, Lbl,
  Tag, Spinner, EmptyState, ErrorMsg, Note, ProgressBar
} from '../ds/index.jsx';
import { api } from '../api/client.js';
import { useAppStore } from '../store/appStore.js';
import { useStreamStore } from '../store/streamStore.js';
import { StreamOutput } from '../components/shared/StreamOutput.jsx';
import { CommentThread } from '../components/shared/CommentThread.jsx';
import { PhaseGate } from '../components/shared/PhaseGate.jsx';

const STEPS = [
  { id: 'branch',    label: 'Create Branch',   n: 1 },
  { id: 'implement', label: 'Implement',        n: 2 },
  { id: 'compile',   label: 'Compile & Fix',    n: 3 },
  { id: 'verify',    label: 'Verify Arch',      n: 4 },
  { id: 'push',      label: 'Push & Summary',   n: 5 },
  { id: 'done',      label: 'Done',             n: 6 },
];

function stepIndex(step) {
  return STEPS.findIndex(s => s.id === step);
}

export function DevelopmentPhase({ featureId }) {
  const [feature, setFeature] = useState(null);
  const [devRun, setDevRun] = useState(null);
  const [activeStep, setActiveStep] = useState('branch');
  const [branchInput, setBranchInput] = useState('');
  const [operationId, setOperationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshFeature } = useAppStore();
  const streams = useStreamStore(s => s.streams);

  async function loadData() {
    try {
      const [feat, run] = await Promise.all([
        api.getFeature(featureId),
        api.getDevRun(featureId)
      ]);
      setFeature(feat);
      setDevRun(run);
      if (run) setActiveStep(run.step);
      else setActiveStep('branch');
      if (feat.branch_name) setBranchInput(feat.branch_name);
      else {
        // Auto-generate branch name from title
        const slug = 'feature/' + (feat.title || 'new-feature')
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
        setBranchInput(slug);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [featureId]);

  const isRunning = operationId && streams[operationId]?.status === 'running';

  async function onOpDone() {
    setOperationId(null);
    await loadData();
  }

  async function handleCreateBranch() {
    setError(null);
    try {
      await api.createBranch(featureId, branchInput);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImplement() {
    setError(null);
    try {
      const { operationId: opId } = await api.implement(featureId);
      setOperationId(opId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCompile() {
    if (!devRun) return;
    setError(null);
    try {
      const { operationId: opId } = await api.compile(devRun.id);
      setOperationId(opId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleVerify() {
    if (!devRun) return;
    setError(null);
    try {
      const { operationId: opId } = await api.verify(devRun.id);
      setOperationId(opId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePush() {
    if (!devRun) return;
    setError(null);
    try {
      const { operationId: opId } = await api.push(devRun.id);
      setOperationId(opId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove(comment) {
    if (!devRun) return;
    await api.approveDev(devRun.id, comment);
    await loadData();
    await refreshFeature(featureId);
  }

  async function handleRequestChanges(comment) {
    if (!devRun) return;
    const { operationId: opId } = await api.requestDevChanges(devRun.id, comment);
    setOperationId(opId);
    await loadData();
  }

  async function handleAddComment(content) {
    if (!devRun) return;
    await api.addDevComment(devRun.id, content);
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner color={C.blue} size={24} /></div>;
  if (error) return <ErrorMsg message={error} />;

  const currentStepIdx = stepIndex(activeStep);

  const summary = devRun?.summary ? (typeof devRun.summary === 'string' ? JSON.parse(devRun.summary) : devRun.summary) : null;
  const verifyLog = devRun?.verify ? (typeof devRun.verify === 'string' ? JSON.parse(devRun.verify) : devRun.verify) : null;

  return (
    <div>
      <PhaseHeader
        icon="⟨/⟩"
        title="Development Phase"
        subtitle="Branch → AI implements code → Compile → Verify architecture → Push → Review summary"
        color={C.blue}
      />

      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 22, flexWrap: 'wrap' }}>
        {STEPS.filter(s => s.id !== 'done').map((s, i) => {
          const idx = stepIndex(s.id);
          const isActive = activeStep === s.id;
          const isDone = currentStepIdx > idx;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                background: isActive ? C.purple + '20' : isDone ? C.green + '12' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? C.purple : isDone ? C.green : C.border}`,
                color: isActive ? C.lavender : isDone ? C.green : C.dim,
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {isDone ? '✓ ' : `${s.n}. `}{s.label}
            </button>
          );
        })}
      </div>

      <ErrorMsg message={error} />

      {/* Step 1: Create Branch */}
      {activeStep === 'branch' && (
        <Step n="1" title="Create Feature Branch" active>
          <Info>
            OpenClaw creates a git branch from the approved architecture. Branch name is auto-generated from the feature title.
          </Info>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 2 }}>
              <Lbl>Branch name</Lbl>
              <input
                value={branchInput}
                onChange={e => setBranchInput(e.target.value)}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 10px', fontSize: 11, color: C.muted, fontFamily: 'monospace', width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Lbl>Base branch</Lbl>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 10px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>
                {feature?.project_branch || 'main'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn label="▶  Create & Push Branch" color={C.purple} primary onClick={handleCreateBranch} />
          </div>
        </Step>
      )}

      {/* Step 2: Implement */}
      {activeStep === 'implement' && (
        <Step n="2" title="AI Code Implementation" active>
          <Info>
            OpenClaw runs <Mono>/dev-implement</Mono> — reads the approved architecture plan and implements all required changes across the codebase.
          </Info>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>
              {devRun?.branch_name || feature?.branch_name}
            </div>
            <Btn
              label={isRunning ? 'Implementing…' : '▶  Start Implementation'}
              color={C.blue}
              primary
              disabled={isRunning}
              onClick={handleImplement}
            />
          </div>
          {operationId && <StreamOutput operationId={operationId} onDone={onOpDone} />}
          {!isRunning && devRun?.step !== 'branch' && (
            <div style={{ marginTop: 12 }}>
              <Btn label="Next: Compile →" color={C.blue} onClick={() => setActiveStep('compile')} />
            </div>
          )}
        </Step>
      )}

      {/* Step 3: Compile */}
      {activeStep === 'compile' && (
        <Step n="3" title="Compile & Error Fix Loop" active>
          <Info>
            Runs the project's compile command, captures errors, and iteratively fixes them. Each fix re-runs compilation to verify.
          </Info>
          <div style={{ marginTop: 10 }}>
            <Btn
              label={isRunning ? 'Compiling…' : '▶  Run Compile'}
              color={C.blue}
              primary
              disabled={isRunning}
              onClick={handleCompile}
            />
          </div>
          {operationId && <StreamOutput operationId={operationId} onDone={onOpDone} />}
          {devRun?.compile_log && !operationId && (
            <div style={{ marginTop: 14 }}>
              <Lbl>Last Compile Log</Lbl>
              <div style={{ background: '#080714', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, maxHeight: 200, overflowY: 'auto' }}>
                {devRun.compile_log.split('\n').map((line, i) => (
                  <div key={i} style={{ color: line.includes('ERROR') || line.includes('error') ? C.red : line.includes('warn') ? C.yellow : C.muted, marginBottom: 2 }}>
                    {line}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <Btn label="Next: Verify Architecture →" color={C.blue} onClick={() => setActiveStep('verify')} />
              </div>
            </div>
          )}
        </Step>
      )}

      {/* Step 4: Verify */}
      {activeStep === 'verify' && (
        <Step n="4" title="Architecture Alignment Verification" active>
          <Info>
            OpenClaw runs <Mono>/dev-verify</Mono> — cross-checks implementation against the approved architecture plan.
          </Info>
          <div style={{ marginTop: 10 }}>
            <Btn
              label={isRunning ? 'Verifying…' : '▶  Verify Architecture'}
              color={C.blue}
              primary
              disabled={isRunning}
              onClick={handleVerify}
            />
          </div>
          {operationId && <StreamOutput operationId={operationId} onDone={onOpDone} />}
          {verifyLog && !operationId && (
            <div style={{ marginTop: 14 }}>
              <Lbl>Verification Results</Lbl>
              {Array.isArray(verifyLog.checks) ? verifyLog.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: c.ok ? C.green : C.red }}>{c.ok ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: c.ok ? C.muted : '#ff8787' }}>{c.label || c.check}</span>
                </div>
              )) : (
                <div style={{ fontSize: 11, color: C.muted }}>{JSON.stringify(verifyLog)}</div>
              )}
              <div style={{ marginTop: 10 }}>
                <Btn label="Next: Push & Summary →" color={C.blue} onClick={() => setActiveStep('push')} />
              </div>
            </div>
          )}
        </Step>
      )}

      {/* Step 5: Push & Summary */}
      {(activeStep === 'push' || activeStep === 'done') && (
        <Step n="5" title="Push & Development Summary" active={activeStep === 'push'} done={activeStep === 'done'}>
          {activeStep === 'push' && (
            <>
              <Info>Push all changes to <Mono>{devRun?.branch_name || feature?.branch_name}</Mono> and generate a structured change summary.</Info>
              <div style={{ marginTop: 10 }}>
                <Btn
                  label={isRunning ? 'Pushing…' : '▶  Push & Generate Summary'}
                  color={C.blue}
                  primary
                  disabled={isRunning}
                  onClick={handlePush}
                />
              </div>
              {operationId && <StreamOutput operationId={operationId} onDone={onOpDone} />}
            </>
          )}

          {/* Summary card */}
          {summary && (
            <Card style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.lavender, marginBottom: 10 }}>Development Summary</div>
              {Object.entries(summary).filter(([k]) => k !== 'raw' && k !== 'exitCode').map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{k.replace(/_/g, ' ')}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{String(v)}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Comments + approval gate */}
          {devRun && devRun.status !== 'done' && (
            <>
              <CommentThread
                comments={[]}
                onSubmit={handleAddComment}
                placeholder="Developer comments or change requests…"
              />
              <PhaseGate
                blockers={[]}
                approveLabel="✓  Approve → Code Review"
                rejectLabel="↺  Request Changes"
                approveColor={C.green}
                onApprove={handleApprove}
                onReject={handleRequestChanges}
              />
            </>
          )}

          {devRun?.status === 'done' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: C.green + '0d', border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green }}>
              ✓ Development approved — feature is now in Code Review phase
            </div>
          )}
        </Step>
      )}
    </div>
  );
}
