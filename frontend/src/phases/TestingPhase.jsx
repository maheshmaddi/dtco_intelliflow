import React, { useState, useEffect } from 'react';
import {
  C, Card, Btn, RevTab, PhaseHeader, Step, Info, Mono, Lbl,
  Tag, Spinner, EmptyState, ErrorMsg, ProgressBar
} from '../ds/index.jsx';
import { api } from '../api/client.js';
import { useAppStore } from '../store/appStore.js';
import { useStreamStore } from '../store/streamStore.js';
import { StreamOutput } from '../components/shared/StreamOutput.jsx';
import { CommentThread } from '../components/shared/CommentThread.jsx';
import { PhaseGate } from '../components/shared/PhaseGate.jsx';

const TYPE_COLORS = { Unit: C.blue, Integration: C.purple, E2E: C.green };
const STATUS_COLORS = { planned: C.dim, written: C.blue, passing: C.green, failing: C.red };

export function TestingPhase({ featureId }) {
  const [revisions, setRevisions] = useState([]);
  const [activeRevIdx, setActiveRevIdx] = useState(0);
  const [planOpId, setPlanOpId] = useState(null);
  const [implOpId, setImplOpId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshFeature } = useAppStore();
  const streams = useStreamStore(s => s.streams);

  async function loadData() {
    try {
      const revs = await api.getTestRevisions(featureId);
      setRevisions(revs);
      if (revs.length > 0) setActiveRevIdx(revs.length - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [featureId]);

  const activeRev = revisions[activeRevIdx];
  const cases = activeRev?.cases || [];
  const writtenCount = cases.filter(c => c.status === 'written' || c.status === 'passing').length;
  const isPlanRunning = planOpId && streams[planOpId]?.status === 'running';
  const isImplRunning = implOpId && streams[implOpId]?.status === 'running';

  async function handleGeneratePlan() {
    setError(null);
    try {
      const { operationId } = await api.generateTestPlan(featureId);
      setPlanOpId(operationId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onPlanDone() {
    setPlanOpId(null);
    await loadData();
  }

  async function handleImplement() {
    if (!activeRev) return;
    setError(null);
    try {
      const { operationId } = await api.implementTests(activeRev.id);
      setImplOpId(operationId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onImplDone() {
    setImplOpId(null);
    await loadData();
    await refreshFeature(featureId);
  }

  async function handleApprove(comment) {
    await api.approveTestPlan(activeRev.id, comment);
    await loadData();
  }

  async function handleRequestChanges(comment) {
    const { operationId } = await api.requestTestChanges(activeRev.id, comment);
    setPlanOpId(operationId);
    await loadData();
  }

  async function handleAddComment(content) {
    if (!activeRev) return;
    await api.addTestComment(activeRev.id, content);
    await loadData();
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner color={C.green} size={24} /></div>;

  return (
    <div>
      <PhaseHeader
        icon="✓"
        title="Testing Phase"
        subtitle="AI generates test plan from requirements + architecture → revisions → developer feedback → approve → write tests"
        color={C.green}
      />

      <ErrorMsg message={error} />

      {/* Step 1: Generate Test Plan */}
      <Step n="1" title="Test Case Plan — Revisions" done={activeRev?.status === 'approved'} active={!activeRev || activeRev.status !== 'approved'}>
        <Info>
          OpenClaw runs <Mono>/test-plan</Mono> using the requirement document and approved architecture plan as context. Same revision model as the Architecture phase.
        </Info>

        <div style={{ marginTop: 10, marginBottom: 14 }}>
          <Btn
            label={isPlanRunning ? 'Generating…' : revisions.length > 0 ? '↺  Regenerate Plan' : '▶  Generate Test Plan'}
            color={C.green}
            primary={revisions.length === 0}
            disabled={isPlanRunning}
            onClick={handleGeneratePlan}
          />
        </div>

        {planOpId && <StreamOutput operationId={planOpId} onDone={onPlanDone} />}

        {revisions.length > 0 && (
          <>
            {/* Revision tabs */}
            <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
              {revisions.map((r, i) => (
                <RevTab
                  key={r.id}
                  version={`v${r.version}`}
                  label={`v${r.version}${r.status === 'approved' ? ' ✓' : ''}`}
                  active={activeRevIdx === i}
                  onClick={() => setActiveRevIdx(i)}
                />
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.purple }}>{cases.length}</div>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Test Cases</div>
              </div>
              {activeRev?.coverage_est && (
                <div style={{ flex: 1, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{activeRev.coverage_est}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Est. Coverage</div>
                </div>
              )}
              <div style={{ flex: 1, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <Tag color={activeRev?.status === 'approved' ? C.green : C.orange}>
                  {activeRev?.status === 'approved' ? 'Approved' : 'Pending'}
                </Tag>
                <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{activeRev?.created_at?.slice(0, 10)}</div>
              </div>
            </div>

            {/* Test case table */}
            {cases.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>{['ID', 'Test Case', 'Type', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', color: C.green, padding: '8px 10px', borderBottom: `1px solid ${C.green}20` }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {cases.map((c, i) => (
                      <tr key={c.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '6px 10px', color: C.blue, fontFamily: 'monospace', fontSize: 10 }}>{c.case_id}</td>
                        <td style={{ padding: '6px 10px', color: C.muted }}>{c.name}</td>
                        <td style={{ padding: '6px 10px' }}>
                          {c.type && <Tag color={TYPE_COLORS[c.type] || C.dim}>{c.type}</Tag>}
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <Tag color={STATUS_COLORS[c.status] || C.dim}>{c.status}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Comments + approval gate */}
            {activeRev?.status !== 'approved' && (
              <>
                <CommentThread
                  comments={activeRev?.comments || []}
                  onSubmit={handleAddComment}
                  placeholder="Add feedback: missing scenarios, edge cases, priority changes…"
                />
                <PhaseGate
                  blockers={[]}
                  approveLabel="✓  Approve Test Plan"
                  rejectLabel="↺  Request Revision"
                  approveColor={C.green}
                  onApprove={handleApprove}
                  onReject={handleRequestChanges}
                />
              </>
            )}
          </>
        )}
      </Step>

      {/* Step 2: Write Tests */}
      {activeRev?.status === 'approved' && (
        <Step n="2" title="Write Module Tests" active={writtenCount < cases.length} done={writtenCount === cases.length && cases.length > 0}>
          <Info>
            After plan approval, OpenClaw runs <Mono>/test-implement</Mono> to generate actual test files matching each approved test case. Tests are committed to the feature branch.
          </Info>

          {writtenCount < cases.length && (
            <div style={{ marginTop: 10 }}>
              <Btn
                label={isImplRunning ? 'Writing Tests…' : '▶  Write Tests'}
                color={C.green}
                primary
                disabled={isImplRunning}
                onClick={handleImplement}
              />
            </div>
          )}

          {implOpId && <StreamOutput operationId={implOpId} onDone={onImplDone} />}

          {cases.length > 0 && (
            <ProgressBar
              label={`Writing tests… ${writtenCount} / ${cases.length} test cases written`}
              pct={cases.length > 0 ? Math.round((writtenCount / cases.length) * 100) : 0}
              color={C.green}
            />
          )}

          {writtenCount === cases.length && cases.length > 0 && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: C.green + '0d', border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green }}>
              ✓ All {cases.length} test cases written and committed to branch
            </div>
          )}
        </Step>
      )}
    </div>
  );
}
