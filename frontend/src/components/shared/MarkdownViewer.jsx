import React from 'react';
import ReactMarkdown from 'react-markdown';
import { C } from '../../ds/index.jsx';

export function MarkdownViewer({ content }) {
  if (!content) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: '12px 14px',
        fontSize: 11, color: C.dim, fontStyle: 'italic'
      }}>
        No plan content yet — trigger analysis to generate.
      </div>
    );
  }

  return (
    <div style={{
      fontSize: 12, color: C.muted, lineHeight: 1.8,
      background: 'rgba(255,255,255,0.015)', borderRadius: 8, padding: '14px 16px'
    }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 10, marginTop: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ color: C.lavender, fontSize: 14, fontWeight: 700, marginBottom: 8, marginTop: 14 }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ color: C.purple, fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 10 }}>{children}</h3>,
          p: ({ children }) => <p style={{ marginBottom: 8, color: C.muted }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 3, color: C.muted }}>{children}</li>,
          code: ({ inline, children }) => inline
            ? <code style={{ background: C.purple + '18', color: C.lavender, padding: '1px 5px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{children}</code>
            : <pre style={{ background: '#080714', border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 12px', overflow: 'auto', marginBottom: 8 }}>
                <code style={{ color: C.muted, fontSize: 11, fontFamily: 'monospace' }}>{children}</code>
              </pre>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: `3px solid ${C.purple}`, paddingLeft: 12, marginLeft: 0, color: C.dim, fontStyle: 'italic' }}>{children}</blockquote>,
          strong: ({ children }) => <strong style={{ color: C.text, fontWeight: 700 }}>{children}</strong>,
          a: ({ href, children }) => <a href={href} style={{ color: C.blue }} target="_blank" rel="noreferrer">{children}</a>,
          hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />,
          table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 }}>{children}</table>,
          th: ({ children }) => <th style={{ textAlign: 'left', color: C.purple, padding: '5px 8px', borderBottom: `1px solid ${C.purple}22` }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '5px 8px', color: C.muted, borderBottom: `1px solid ${C.border}` }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
