import React, { useEffect, useRef } from 'react';
import { C, Spinner } from '../../ds/index.jsx';
import { useStreamStore } from '../../store/streamStore.js';
import { useSSE } from '../../hooks/useSSE.js';

function colorLine(text) {
  if (!text) return C.muted;
  const t = text.toLowerCase();
  if (t.includes('error') || t.startsWith('✗') || t.includes('failed') || t.includes('[stderr]')) return C.red;
  if (t.startsWith('✓') || t.includes('success') || t.includes('completed')) return C.green;
  if (t.startsWith('→') || t.startsWith('fixing') || t.includes('warning')) return C.yellow;
  if (t.startsWith('+') || t.includes('created')) return C.green;
  if (t.startsWith('~') || t.startsWith('$') || t.includes('modified')) return C.blue;
  return C.muted;
}

export function StreamOutput({ operationId, onDone, minHeight = 140 }) {
  const containerRef = useRef(null);
  const stream = useStreamStore(s => s.streams[operationId]);

  useSSE(operationId, onDone);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [stream?.chunks?.length]);

  if (!stream) return null;

  const { chunks, status } = stream;

  return (
    <div style={{
      background: '#080714',
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 14px',
      fontFamily: 'monospace',
      fontSize: 11,
      minHeight,
      maxHeight: 320,
      overflowY: 'auto',
      marginTop: 10
    }} ref={containerRef}>
      {chunks.length === 0 && status === 'running' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.dim }}>
          <Spinner color={C.purple} size={12} />
          <span>Waiting for OpenClaw output…</span>
        </div>
      )}
      {chunks.map((line, i) => (
        <div key={i} style={{ color: colorLine(line), marginBottom: 2, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {line}
        </div>
      ))}
      {status === 'running' && chunks.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: C.dim }}>
          <Spinner color={C.purple} size={10} />
          <span style={{ fontSize: 10 }}>Running…</span>
        </div>
      )}
      {status === 'done' && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}`, color: C.green, fontSize: 10 }}>
          ✓ Completed
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}`, color: C.red, fontSize: 10 }}>
          ✗ Operation failed
        </div>
      )}
    </div>
  );
}
