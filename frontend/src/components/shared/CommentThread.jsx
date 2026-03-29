import React, { useState } from 'react';
import { C, TextArea, Btn, Lbl } from '../../ds/index.jsx';

export function CommentThread({ comments = [], onSubmit, placeholder, submitLabel = 'Add Comment' }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {comments.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <Lbl>Comments</Lbl>
          {comments.map((c, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 7, padding: '8px 11px', marginBottom: 5
            }}>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{c.content}</div>
              <div style={{ fontSize: 9, color: C.dim, marginTop: 4 }}>{c.created_at?.slice(0, 16).replace('T', ' ')}</div>
            </div>
          ))}
        </div>
      )}
      <TextArea
        value={text}
        onChange={setText}
        placeholder={placeholder || 'Add a comment…'}
        rows={3}
      />
      <div style={{ marginTop: 8 }}>
        <Btn
          label={loading ? 'Saving…' : submitLabel}
          color={C.purple}
          disabled={!text.trim() || loading}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
