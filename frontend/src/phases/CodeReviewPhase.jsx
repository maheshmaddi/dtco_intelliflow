import React, { useState, useEffect } from 'react';
import {
  C, Card, Btn, RevTab, PhaseHeader, Step, Info, Mono, Lbl,
  Tag, Spinner, EmptyState, ErrorMsg, Note
} from '../ds/index.jsx';
import { api } from '../api/client.js';
import { useAppStore } from '../store/appStore.js';
import { useStreamStore } from '../store/streamStore.js';
import { StreamOutput } from '../components/shared/StreamOutput.jsx';
import { CommentThread } from '../components/shared/CommentThread.jsx';
import { PhaseGate } from '../components/shared/PhaseGate.jsx';

const SEV_COLORS = { critical: C.red, warning: C.yellow, info: C.blue };
const SEV_BG = { critical: C.red + '0e', warning: C.yellow + '0a', info: C.blue + '0a' };

export function CodeReviewPhase({ featureId }) {
  const [revisions, setRevisions] = useState([]);
  const [activeRevIdx, setActiveRevIdx] = useState(0);
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [analyzeOpId, setAnalyzeOpId] = useState(null);
  const [fixOpIds, setFixOpIds] = useState({}); // findingId → operationId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshFeature } = useAppStore();
  const streams = useStreamStore(s => s.streams);

  async function loadData() {
    try {
      const revs = await api.getReviewRevisions(featureId);
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
  const findings = activeRev?.findings || [];
  const allFiles = [...new Set(findings.map(f => f.file).filter(Boolean))];
  const shownFindings = activeFile ? findings.filter(f => f.file === activeFile) : findings;

  const unresolvedCritical = findings.filter(f => f.severity === 'critical' && !f.resolved && !f.wont_fix);
  const isAnalyzing = analyzeOpId && streams[analyzeOpId]?.status === 'running';

  async function handleAnalyze() {
    setError(null);
    try {
      const { operationId } = await api.analyzeReview(featureId);
      setAnalyzeOpId(operationId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onAnalyzeDone() {
    setAnalyzeOpId(null);
    await loadData();
  }

  async function handleFix(finding) {
    const { operationId } = await api.fixFinding(finding.id);
    setFixOpIds(prev => ({ ...prev, [finding.id]: operationId }));
  }

  async function onFixDone(findingId) {
    setFixOpIds(prev => { const n = { ...prev }; delete n[findingId]; return n; });
    await loadData();
  }

  async function handleWontFix(finding) {
    const reason = prompt('Reason for Won\'t Fix:');
    if (reason === null) return;
    await api.updateFinding(finding.id, { wont_fix: true, wont_fix_reason: reason });
    await loadData();
  }

  async function handleApprove(comment) {
    await api.approveReview(activeRev.id, comment);
    await loadData();
    await refreshFeature(featureId);
  }

  async function handleRequestChanges(comment) {
    const { operationId } = await api.requestReviewChanges(activeRev.id, comment);
    setAnalyzeOpId(operationId);
    await loadData();
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner color={C.red} size={24} /></div>;

  const blockers = unresolvedCritical.length > 0
    ? [`${unresolvedCritical.length} critical finding(s) unresolved — fix or mark as Won't Fix`]
    : [];

  return (
    <div>
      <PhaseHeader
        icon="⊛"
        title="Code Review Phase"
        subtitle="OpenClaw analyzes branch diff → AI findings with severity → Fix loop → Reviewer approves"
        color={C.red}
      />

      <ErrorMsg message={error} />

      {/* Trigger review */}
      <Step n="1" title="Trigger AI Review" done={revisions.length > 0}>
        <Info>
          OpenClaw runs <Mono>/review-analyze</Mono> on the feature branch diff. Cross-checks architecture plan, security, performance, code quality, and documentation.
        </Info>
        <div style={{ marginTop: 10 }}>
          <Btn
            label={isAnalyzing ? 'Analyzing…' : revisions.length > 0 ? '↺  Re-analyze' : '▶  Start Code Review'}
            color={C.red}
            primary={revisions.length === 0}
            disabled={isAnalyzing}
            onClick={handleAnalyze}
          />
        </div>
        {analyzeOpId && <StreamOutput operationId={analyzeOpId} onDone={onAnalyzeDone} />}
      </Step>

      {/* Review findings */}
      {revisions.length > 0 && (
        <Step n="2" title="Review Findings — Revisions" active={activeRev?.status !== 'approved'} done={activeRev?.status === 'approved'}>
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              ['Findings', findings.length, C.muted],
              ['Critical', findings.filter(f => f.severity === 'critical').length, C.red],
              ['Resolved', findings.filter(f => f.resolved || f.wont_fix).length, C.green],
            ].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <Lbl>{l}</Lbl>
                <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* File filter */}
            {allFiles.length > 0 && (
              <div style={{ width: 140, flexShrink: 0 }}>
                <Lbl>Files Reviewed</Lbl>
                <button
                  onClick={() => setActiveFile(null)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '6px 9px', borderRadius: 6, marginBottom: 3, display: 'block',
                    background: !activeFile ? C.purple + '18' : 'transparent',
                    border: `1px solid ${!activeFile ? C.purple + '40' : 'transparent'}`,
                    color: !activeFile ? C.lavender : C.dim, fontSize: 10, cursor: 'pointer', fontFamily: 'monospace'
                  }}
                >
                  All files
                </button>
                {allFiles.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFile(f)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '6px 9px', borderRadius: 6, marginBottom: 3, display: 'block',
                      background: activeFile === f ? C.purple + '18' : 'transparent',
                      border: `1px solid ${activeFile === f ? C.purple + '40' : 'transparent'}`,
                      color: activeFile === f ? C.lavender : C.dim, fontSize: 10, cursor: 'pointer',
                      fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Findings list */}
            <div style={{ flex: 1 }}>
              <Lbl>Findings</Lbl>
              {shownFindings.length === 0 && (
                <EmptyState icon="✓" title="No findings" subtitle="All checks passed" />
              )}
              {shownFindings.map(f => {
                const fixOpId = fixOpIds[f.id];
                const isFixing = fixOpId && streams[fixOpId]?.status === 'running';
                const isResolved = f.resolved || f.wont_fix;

                return (
                  <div key={f.id} style={{ marginBottom: 8 }}>
                    <div
                      onClick={() => setExpandedFinding(expandedFinding === f.id ? null : f.id)}
                      style={{
                        background: isResolved ? C.green + '06' : SEV_BG[f.severity] || C.card,
                        borderLeft: `3px solid ${isResolved ? C.green : SEV_COLORS[f.severity] || C.muted}`,
                        border: `1px solid ${isResolved ? C.green + '20' : (SEV_COLORS[f.severity] || C.muted) + '25'}`,
                        borderRadius: 7, padding: '8px 11px', cursor: 'pointer',
                        opacity: isResolved ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: isResolved ? C.green : SEV_COLORS[f.severity],
                          background: (isResolved ? C.green : SEV_COLORS[f.severity]) + '20',
                          padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase'
                        }}>
                          {isResolved ? (f.wont_fix ? "won't fix" : 'resolved') : f.severity}
                        </span>
                        <code style={{ fontSize: 10, color: C.lavender, background: C.purple + '18', padding: '1px 5px', borderRadius: 4 }}>{f.finding_id}</code>
                        <span style={{ fontSize: 11, color: C.text, flex: 1 }}>{f.title}</span>
                        <span style={{ fontSize: 9, color: C.dim }}>{f.category}</span>
                        <span style={{ fontSize: 9, color: C.dim }}>{expandedFinding === f.id ? '▲' : '▼'}</span>
                      </div>

                      {expandedFinding === f.id && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                          {f.file && (
                            <div style={{ fontSize: 10, color: C.dim, marginBottom: 4 }}>
                              <Mono>{f.file}</Mono>{f.line ? ` line ${f.line}` : ''}
                            </div>
                          )}
                          {f.suggestion && (
                            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>
                              💡 {f.suggestion}
                            </div>
                          )}
                          {f.wont_fix && f.wont_fix_reason && (
                            <div style={{ fontSize: 11, color: C.orange, marginBottom: 6 }}>
                              Won't Fix: {f.wont_fix_reason}
                            </div>
                          )}
                          {!isResolved && activeRev?.status !== 'approved' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Btn
                                label={isFixing ? 'Fixing…' : '⚡ Auto-fix'}
                                color={C.purple}
                                disabled={isFixing}
                                onClick={(e) => { e.stopPropagation(); handleFix(f); }}
                              />
                              <Btn
                                label="Won't Fix"
                                color={C.dim}
                                onClick={(e) => { e.stopPropagation(); handleWontFix(f); }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fix stream output */}
                    {fixOpId && (
                      <StreamOutput
                        operationId={fixOpId}
                        onDone={() => onFixDone(f.id)}
                        minHeight={80}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval gate */}
          {activeRev?.status !== 'approved' && (
            <PhaseGate
              blockers={blockers}
              approveLabel="✓  Approve → Testing"
              rejectLabel="↺  Request Another Pass"
              approveColor={C.green}
              onApprove={handleApprove}
              onReject={handleRequestChanges}
            />
          )}

          {activeRev?.status === 'approved' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: C.green + '0d', border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green }}>
              ✓ Code review approved — feature is now in Testing phase
            </div>
          )}
        </Step>
      )}
    </div>
  );
}
