import React, { useState, useEffect } from 'react';
import {
  C, Card, Btn, RevTab, PhaseHeader, Step, SectionTitle,
  QCard, Tag, Lbl, Info, Note, Spinner, EmptyState, ErrorMsg, TextArea
} from '../ds/index.jsx';
import { api } from '../api/client.js';
import { useAppStore } from '../store/appStore.js';
import { useStreamStore } from '../store/streamStore.js';
import { FileUpload } from '../components/shared/FileUpload.jsx';
import { StreamOutput } from '../components/shared/StreamOutput.jsx';
import { MarkdownViewer } from '../components/shared/MarkdownViewer.jsx';
import { MermaidDiagram } from '../components/shared/MermaidDiagram.jsx';
import { CommentThread } from '../components/shared/CommentThread.jsx';
import { PhaseGate } from '../components/shared/PhaseGate.jsx';

function AnswerModal({ question, onClose, onSave }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!answer.trim()) return;
    setLoading(true);
    try { await onSave(question.id, answer.trim()); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#1a1830', border: `1px solid ${C.purple}40`, borderRadius: 12, padding: 24, width: 480, maxWidth: '90vw' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Answer AI Question</div>
        <div style={{ background: C.orange + '0d', border: `1px solid ${C.orange}30`, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>
          {question.question}
        </div>
        <TextArea value={answer} onChange={setAnswer} placeholder="Your answer…" rows={4} />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Btn label="Cancel" color={C.dim} onClick={onClose} />
          <Btn label={loading ? 'Saving…' : 'Save Answer'} color={C.green} primary disabled={!answer.trim() || loading} onClick={handleSave} />
        </div>
      </div>
    </div>
  );
}

export function ArchitecturePhase({ featureId }) {
  const [feature, setFeature] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [activeRevIdx, setActiveRevIdx] = useState(0);
  const [diagTab, setDiagTab] = useState(0);
  const [analyzeOpId, setAnalyzeOpId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answeringQ, setAnsweringQ] = useState(null);
  const { refreshFeature, settings } = useAppStore();
  const streams = useStreamStore(s => s.streams);

  async function loadData() {
    try {
      const [feat, revs] = await Promise.all([
        api.getFeature(featureId),
        api.getArchRevisions(featureId)
      ]);
      setFeature(feat);
      setRevisions(revs);
      if (revs.length > 0) setActiveRevIdx(revs.length - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [featureId]);

  async function handleUpload(file) {
    await api.uploadReqDoc(featureId, file);
    const feat = await api.getFeature(featureId);
    setFeature(feat);
  }

  async function handleAnalyze() {
    setError(null);
    try {
      const { operationId } = await api.analyzeArch(featureId);
      setAnalyzeOpId(operationId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReplan() {
    setError(null);
    try {
      const { operationId } = await api.replanArch(featureId);
      setAnalyzeOpId(operationId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onStreamDone() {
    await loadData();
    await refreshFeature(featureId);
    setAnalyzeOpId(null);
  }

  async function handleAnswerSave(qId, answer) {
    await api.answerQuestion(qId, answer);
    await loadData();
  }

  async function handleApprove(comment) {
    const rev = revisions[activeRevIdx];
    await api.approveArch(rev.id, comment);
    await loadData();
    await refreshFeature(featureId);
  }

  async function handleReject(comment) {
    const rev = revisions[activeRevIdx];
    const { operationId } = await api.rejectArch(rev.id, comment);
    setAnalyzeOpId(operationId);
    await loadData();
  }

  async function handleAddComment(content) {
    const rev = revisions[activeRevIdx];
    await api.addArchComment(rev.id, content);
    await loadData();
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner color={C.purple} size={24} /></div>;
  if (error) return <ErrorMsg message={error} />;

  const activeRev = revisions[activeRevIdx];
  const questions = activeRev?.questions || [];
  const unanswered = questions.filter(q => !q.is_answered);
  const isAnalyzing = analyzeOpId && streams[analyzeOpId]?.status === 'running';
  const maxMB = parseInt(settings?.file_size_limit_mb || '5', 10);

  const blockers = [];
  if (unanswered.length > 0) blockers.push(`${unanswered.length} unanswered question(s) — answer all before approving`);
  if (!activeRev) blockers.push('No architecture plan yet — analyze requirements first');

  return (
    <div>
      <PhaseHeader
        icon="⬡"
        title="Architecture Phase"
        subtitle="Upload requirements → AI Q&A → Architecture plan with diagrams → Architect review → Approve"
      />

      {/* Step 1: Requirement Upload */}
      <Step n="1" title="Requirement Document" done={!!feature?.req_doc_name}>
        <FileUpload
          onUpload={handleUpload}
          maxMB={maxMB}
          existingName={feature?.req_doc_name}
        />
        {feature?.req_doc_name && !revisions.length && (
          <div style={{ marginTop: 12 }}>
            <Btn
              label={isAnalyzing ? 'Analyzing…' : '▶  Analyze Requirements with OpenClaw'}
              color={C.purple}
              primary
              disabled={isAnalyzing}
              onClick={handleAnalyze}
            />
          </div>
        )}
      </Step>

      {/* Stream output */}
      {analyzeOpId && (
        <StreamOutput operationId={analyzeOpId} onDone={onStreamDone} />
      )}

      {/* Step 2: AI Questions */}
      {questions.length > 0 && (
        <Step n="2" title="AI Clarification Questions" done={unanswered.length === 0}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
            OpenClaw asks questions until requirements are fully justified.{' '}
            <span style={{ color: C.yellow, fontWeight: 600 }}>All must be answered before approving.</span>
          </p>
          {questions.map(q => (
            <QCard
              key={q.id}
              q={q}
              answered={!!q.is_answered}
              onAnswer={(q) => setAnsweringQ(q)}
            />
          ))}
        </Step>
      )}

      {/* Step 3: Architecture Plan Revisions */}
      {revisions.length > 0 && (
        <Step n="3" title="Architecture Plan — Revisions" active={!activeRev || activeRev.status !== 'approved'} done={activeRev?.status === 'approved'}>
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
            {revisions.length > 0 && (
              <Btn label="+ Re-analyze" color={C.purple} onClick={handleReplan} disabled={isAnalyzing} style={{ marginLeft: 'auto' }} />
            )}
          </div>

          {/* Revision metadata */}
          {activeRev && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: C.purple, fontWeight: 700, fontSize: 13 }}>Revision v{activeRev.version}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={activeRev.status === 'approved' ? C.green : activeRev.status === 'rejected' ? C.red : C.orange}>
                  {activeRev.status === 'approved' ? 'Approved' : activeRev.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                </Tag>
                <span style={{ fontSize: 11, color: C.dim }}>{activeRev.created_at?.slice(0, 10)}</span>
              </div>
            </div>
          )}

          {/* Plan content */}
          <MarkdownViewer content={activeRev?.plan_md} />

          {/* Diagrams */}
          {(activeRev?.sequence_diag || activeRev?.state_diag) && (
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {[['Sequence Diagram', !!activeRev.sequence_diag], ['State Chart', !!activeRev.state_diag]].map(([t, avail], i) => (
                  <button
                    key={i}
                    onClick={() => setDiagTab(i)}
                    style={{
                      background: diagTab === i ? C.blue + '18' : 'transparent',
                      border: `1px solid ${diagTab === i ? C.blue : C.border}`,
                      color: diagTab === i ? '#74b9ff' : C.dim,
                      padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    {t} {!avail && <span style={{ fontSize: 9, opacity: 0.5 }}>(none)</span>}
                  </button>
                ))}
              </div>
              <MermaidDiagram source={diagTab === 0 ? activeRev?.sequence_diag : activeRev?.state_diag} />
            </div>
          )}

          {/* Comments */}
          {activeRev && activeRev.status !== 'approved' && (
            <>
              <CommentThread
                comments={activeRev.comments || []}
                onSubmit={handleAddComment}
                placeholder="Architect comments on this revision…"
              />

              <PhaseGate
                blockers={blockers}
                approveLabel="✓  Approve → Development"
                rejectLabel="↺  Send for Revision"
                approveColor={C.green}
                onApprove={handleApprove}
                onReject={handleReject}
                requireCommentForReject
              />
            </>
          )}

          {activeRev?.status === 'approved' && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: C.green + '0d', border: `1px solid ${C.green}30`, borderRadius: 8, fontSize: 12, color: C.green }}>
              ✓ Architecture approved — feature is now in Development phase
            </div>
          )}
        </Step>
      )}

      {/* Answer modal */}
      {answeringQ && (
        <AnswerModal
          question={answeringQ}
          onClose={() => setAnsweringQ(null)}
          onSave={handleAnswerSave}
        />
      )}
    </div>
  );
}
