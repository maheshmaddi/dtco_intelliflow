import React, { useState } from 'react';
import { C, Btn, TextArea, ErrorMsg } from '../../ds/index.jsx';

export function PhaseGate({
  blockers = [],
  approveLabel = '✓  Approve',
  rejectLabel = '↺  Send for Revision',
  approveColor,
  onApprove,
  onReject,
  requireCommentForReject = false
}) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const canApprove = blockers.length === 0;

  async function handle(action) {
    if (action === 'approve' && !canApprove) return;
    if (action === 'reject' && requireCommentForReject && !comment.trim()) {
      setError('Please provide a comment explaining the revision request.');
      return;
    }
    setError(null);
    setLoading(action);
    try {
      if (action === 'approve') await onApprove(comment.trim() || undefined);
      else await onReject(comment.trim() || undefined);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
      {blockers.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {blockers.map((b, i) => (
            <div key={i} style={{ color: C.red, fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>⚠</span> {b}
            </div>
          ))}
        </div>
      )}

      <TextArea
        value={comment}
        onChange={setComment}
        placeholder={`Comments${requireCommentForReject && !canApprove ? ' (required for revision request)' : ' (optional)'}…`}
        rows={2}
        style={{ marginBottom: 10 }}
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {onReject && (
          <Btn
            label={loading === 'reject' ? 'Sending…' : rejectLabel}
            color={C.orange}
            disabled={!!loading}
            onClick={() => handle('reject')}
          />
        )}
        {onApprove && (
          <Btn
            label={loading === 'approve' ? 'Approving…' : approveLabel}
            color={approveColor || C.green}
            primary
            disabled={!canApprove || !!loading}
            onClick={() => handle('approve')}
          />
        )}
      </div>

      <ErrorMsg message={error} />
    </div>
  );
}
