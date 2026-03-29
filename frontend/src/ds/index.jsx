// Design System — extracted and extended from openclaw-feature-lifecycle-plan.jsx
import React from 'react';

export const C = {
  bg: '#0f0e1a', card: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)',
  purple: '#7c6fff', green: '#3ecf8e', orange: '#ff9f43', red: '#ff6b6b',
  blue: '#54a0ff', lavender: '#a29bfe', text: '#e8e6ff', muted: '#9997bb', dim: '#6664a0',
  yellow: '#ffd43b',
};

export const Tag = ({ children, color }) => (
  <span style={{ background: (color || C.purple) + '18', border: `1px solid ${color || C.purple}35`, color: color || C.purple, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700 }}>{children}</span>
);

export const Mono = ({ children }) => (
  <code style={{ background: C.purple + '18', color: C.lavender, padding: '1px 5px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{children}</code>
);

export const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12, ...style }}>{children}</div>
);

export const Info = ({ children }) => (
  <div style={{ background: C.purple + '0a', border: `1px solid ${C.purple}25`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>{children}</div>
);

export const Note = ({ children }) => (
  <p style={{ fontSize: 11, color: C.purple, margin: '6px 0 0', opacity: 0.8 }}>ℹ {children}</p>
);

export const Lbl = ({ children }) => (
  <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{children}</div>
);

export const Btn = ({ label, color, primary, disabled, onClick, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: primary ? color : 'transparent',
      border: `1px solid ${color}`,
      color: primary ? '#0f0e1a' : color,
      padding: '8px 16px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontFamily: 'inherit',
      transition: 'opacity 0.15s',
      ...style
    }}
  >{label}</button>
);

export const RevTab = ({ version, active, onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? C.purple + '25' : 'transparent',
      border: `1px solid ${active ? C.purple : C.border}`,
      color: active ? C.lavender : C.dim,
      padding: '4px 14px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }}
  >{label || version}</button>
);

export const PhaseHeader = ({ icon, title, subtitle, color }) => (
  <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <span style={{ fontSize: 20, color: color || C.purple }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.text }}>{title}</h2>
    </div>
    <p style={{ margin: 0, fontSize: 12, color: C.muted, paddingLeft: 32 }}>{subtitle}</p>
  </div>
);

export const Step = ({ n, title, children, done, active }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: done ? C.green + '25' : active ? C.purple + '25' : C.purple + '18',
        border: `1px solid ${done ? C.green + '60' : active ? C.purple + '80' : C.purple + '40'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: done ? C.green : C.purple, fontWeight: 700, flexShrink: 0
      }}>{done ? '✓' : n}</div>
      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{title}</h4>
    </div>
    <div style={{ paddingLeft: 28 }}>{children}</div>
  </div>
);

export const SectionTitle = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
    <div style={{ width: 3, height: 14, background: C.purple, borderRadius: 2 }} />
    <span style={{ fontSize: 11, fontWeight: 700, color: '#c4c2e8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{children}</span>
  </div>
);

export const QCard = ({ q, answered, onAnswer }) => (
  <div style={{
    background: answered ? C.green + '0a' : C.orange + '0d',
    border: `1px solid ${answered ? C.green + '30' : C.orange + '40'}`,
    borderRadius: 8, padding: '9px 12px', marginBottom: 7, display: 'flex', gap: 10, alignItems: 'flex-start'
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: answered ? C.green : C.orange, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {answered ? '✓ Answered' : '⚑ AI Question'}
      </div>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: C.text, lineHeight: 1.6 }}>{q.question}</p>
      {answered && q.answer && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted, fontStyle: 'italic' }}>{q.answer}</p>
      )}
    </div>
    {!answered && (
      <button onClick={() => onAnswer(q)} style={{
        background: C.orange + '18', border: `1px solid ${C.orange}40`, color: C.orange,
        padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit'
      }}>Answer</button>
    )}
  </div>
);

export const ProgressBar = ({ label, pct, color }) => (
  <div style={{ marginTop: 10, marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 11, color: color || C.purple }}>{pct}%</span>
    </div>
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color || C.purple, borderRadius: 2, transition: 'width 0.3s' }} />
    </div>
  </div>
);

export const StatusDot = ({ status }) => {
  const colors = { active: C.purple, done: C.green, pending: C.dim, blocked: C.red, running: C.orange };
  return <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[status] || C.dim, flexShrink: 0 }} />;
};

export const Spinner = ({ color, size = 14 }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid ${(color || C.purple) + '30'}`,
    borderTopColor: color || C.purple,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0
  }} />
);

// Inject spinner keyframes once
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export const EmptyState = ({ icon, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: C.dim }}>
    {icon && <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>}
    <div style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 12 }}>{subtitle}</div>}
  </div>
);

export const Input = ({ value, onChange, placeholder, type = 'text', style }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
      color: C.text, fontSize: 12, padding: '7px 10px', fontFamily: 'inherit',
      outline: 'none', width: '100%', ...style
    }}
  />
);

export const TextArea = ({ value, onChange, placeholder, rows = 3, style }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      color: C.text, fontSize: 12, padding: '10px 12px', resize: 'vertical',
      fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', ...style
    }}
  />
);

export const Select = ({ value, onChange, options, style }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
      color: C.text, fontSize: 12, padding: '7px 10px', fontFamily: 'inherit',
      outline: 'none', width: '100%', cursor: 'pointer', ...style
    }}
  >
    {options.map(o => (
      <option key={o.value} value={o.value} style={{ background: '#1a1830' }}>{o.label}</option>
    ))}
  </select>
);

export const ErrorMsg = ({ message }) => message ? (
  <div style={{ color: C.red, fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
    <span>⚠</span> {message}
  </div>
) : null;
