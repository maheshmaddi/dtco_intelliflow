import React from 'react';
import { C, Card, Mono, Tag, SectionTitle } from '../ds/index.jsx';

export function OverviewPanel() {
  const flow = [
    { n: 1, label: 'Add Git Project', sub: 'Local path or clone', color: C.purple },
    { n: 2, label: 'Create Feature', sub: 'Name + req doc', color: C.purple },
    { n: 3, label: 'Architecture', sub: 'Q&A → Plan → Approve', color: C.purple },
    { n: 4, label: 'Development', sub: 'Branch → Code → Push', color: C.blue },
    { n: 5, label: 'Code Review', sub: 'Findings → Fix → Approve', color: C.red },
    { n: 6, label: 'Testing', sub: 'Plan → Approve → Tests', color: C.green },
  ];

  const cmds = [
    ['/arch-analyze',   'Architecture', 'Req doc + codebase → clarifying Qs → plan + diagrams'],
    ['/arch-replan',    'Architecture', 'Previous plan + comments → next revision'],
    ['/dev-implement',  'Development',  'Approved arch plan → code changes across codebase'],
    ['/dev-verify',     'Development',  'Cross-check implementation vs architecture plan'],
    ['/dev-summarize',  'Development',  'Structured summary of all changes made'],
    ['/review-analyze', 'Code Review',  'Branch diff → security, perf, quality, arch compliance findings'],
    ['/review-fix',     'Code Review',  'Auto-fix a specific finding by ID, re-compile & verify'],
    ['/test-plan',      'Testing',      'Generate test case plan from req doc + architecture'],
    ['/test-implement', 'Testing',      'Write actual test files for approved test plan'],
  ];
  const phaseColors = { Architecture: C.purple, Development: C.blue, 'Code Review': C.red, Testing: C.green };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>AI Feature Lifecycle</h2>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 28, lineHeight: 1.7 }}>
        OpenClaw-powered SDLC tool. Architecture → Development → Code Review → Testing phases with versioned revision history and human-in-the-loop approval gates.
      </p>

      <SectionTitle>End-to-End Flow</SectionTitle>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
        {flow.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ background: item.color + '12', border: `1px solid ${item.color}28`, borderRadius: 8, padding: '8px 11px', textAlign: 'center', minWidth: 95 }}>
              <div style={{ fontSize: 9, color: item.color, fontWeight: 700 }}>Step {item.n}</div>
              <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
              <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{item.sub}</div>
            </div>
            {i < flow.length - 1 && <span style={{ color: '#3a384f', fontSize: 14 }}>→</span>}
          </div>
        ))}
      </div>

      <SectionTitle>OpenClaw Custom Commands</SectionTitle>
      <Card style={{ marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>{['Command', 'Phase', 'Description'].map(h => (
              <th key={h} style={{ textAlign: 'left', color: C.purple, padding: '5px 10px', borderBottom: `1px solid ${C.purple}22` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {cmds.map(([cmd, phase, desc], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '6px 10px' }}><Mono>{cmd}</Mono></td>
                <td style={{ padding: '6px 10px' }}><Tag color={phaseColors[phase]}>{phase}</Tag></td>
                <td style={{ padding: '6px 10px', color: C.muted }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SectionTitle>Key Design Principles</SectionTitle>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { title: 'Human-in-the-Loop Gates', color: C.red, items: ['No phase advances without explicit Approve', 'All AI questions must be answered to unlock Approve', 'Reviewer can override findings with Won\'t Fix', 'Full revision history — immutable audit trail'] },
          { title: 'Versioned Everything', color: C.purple, items: ['Architecture plan: v1, v2… revisions', 'Code Review findings: per-pass versioning', 'Test case plan: v1, v2… revisions', 'All versions browsable at any time'] },
          { title: 'OpenClaw CLI Integration', color: C.blue, items: ['Runs as local CLI subprocess', 'Stdout/stderr streamed live via SSE', 'Context built from DB + uploaded docs', 'Configurable CLI path in Settings'] },
          { title: 'File Upload Guard', color: C.green, items: ['Max size configurable in Settings', 'Accepted: PDF, DOCX, TXT, MD', 'Stored per-feature on server disk', 'Re-upload triggers fresh analysis'] },
        ].map(({ title, color, items }) => (
          <div key={title} style={{ flex: '1 1 200px', background: color + '08', border: `1px solid ${color}25`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
            {items.map((it, i) => (
              <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 5, paddingLeft: 10, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color }}>›</span>{it}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
