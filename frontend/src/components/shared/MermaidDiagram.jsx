import React, { useEffect, useRef, useState } from 'react';
import { C } from '../../ds/index.jsx';

let mermaidInitialized = false;

async function getMermaid() {
  const m = (await import('mermaid')).default;
  if (!mermaidInitialized) {
    m.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#7c6fff',
        primaryTextColor: '#e8e6ff',
        primaryBorderColor: '#7c6fff44',
        lineColor: '#9997bb',
        secondaryColor: 'rgba(255,255,255,0.04)',
        tertiaryColor: '#0f0e1a',
        background: '#0f0e1a',
        mainBkg: '#1a1830',
        nodeBorder: '#7c6fff44',
        clusterBkg: 'rgba(124,111,255,0.08)',
        titleColor: '#e8e6ff',
        edgeLabelBackground: '#0f0e1a',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
      }
    });
    mermaidInitialized = true;
  }
  return m;
}

let diagramCounter = 0;

export function MermaidDiagram({ source }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [id] = useState(() => `mermaid-${++diagramCounter}`);

  useEffect(() => {
    if (!source || !containerRef.current) return;
    setError(null);

    getMermaid().then(async (m) => {
      try {
        const { svg } = await m.render(id, source);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.removeAttribute('height');
          }
        }
      } catch (err) {
        setError(err.message);
      }
    });
  }, [source, id]);

  if (!source) {
    return (
      <div style={{
        height: 90, background: C.blue + '06', border: `1px dashed ${C.blue}25`,
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.blue, fontSize: 11, opacity: 0.6
      }}>
        No diagram available
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ color: C.red, fontSize: 11, marginBottom: 6 }}>
          Diagram parse error: {error}
          <pre style={{ color: C.dim, fontSize: 10, marginTop: 4, background: '#080714', padding: 8, borderRadius: 4, overflow: 'auto' }}>
            {source}
          </pre>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          background: C.blue + '06', border: `1px solid ${C.blue}20`,
          borderRadius: 8, padding: 16, overflow: 'auto'
        }}
      />
    </div>
  );
}
