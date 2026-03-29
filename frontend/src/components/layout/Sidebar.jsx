import React from 'react';
import { C, Lbl, StatusDot } from '../../ds/index.jsx';
import { useAppStore } from '../../store/appStore.js';

const PHASES = [
  { id: 'overview',      label: 'Overview',      icon: '◈', color: C.purple },
  { id: 'architecture',  label: 'Architecture',  icon: '⬡', color: C.purple },
  { id: 'development',   label: 'Development',   icon: '⟨/⟩', color: C.blue },
  { id: 'codereview',    label: 'Code Review',   icon: '⊛', color: C.red },
  { id: 'testing',       label: 'Testing',       icon: '✓', color: C.green },
];

function getPhaseStatus(phaseId, feature) {
  if (!feature) return 'pending';
  const order = ['architecture', 'development', 'codereview', 'testing'];
  const currentIdx = order.indexOf(feature.current_phase);
  const phaseIdx = order.indexOf(phaseId);
  if (phaseId === 'overview') return 'active';
  if (phaseIdx < 0) return 'pending';
  if (phaseIdx < currentIdx) return 'done';
  if (phaseIdx === currentIdx) return 'active';
  return 'pending';
}

export function Sidebar() {
  const { activePhase, setPhase, projects, activeProjectId, features, activeFeatureId, selectProject, selectFeature } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeFeature = features.find(f => f.id === activeFeatureId);

  return (
    <div style={{
      width: 210, borderRight: `1px solid ${C.border}`, padding: '16px 10px',
      flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
      overflowY: 'auto'
    }}>
      {/* Project selector */}
      <div style={{ marginBottom: 16 }}>
        <Lbl>Project</Lbl>
        <button
          onClick={() => setPhase('projects')}
          style={{
            width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8,
            border: `1px solid ${activePhase === 'projects' ? C.purple : C.border}`,
            background: activePhase === 'projects' ? C.purple + '12' : C.card,
            cursor: 'pointer', color: activeProject ? C.text : C.dim, fontSize: 11,
            fontFamily: 'inherit', fontWeight: activeProject ? 600 : 400
          }}
        >
          {activeProject ? activeProject.name : '+ Add / Select Project'}
        </button>
      </div>

      {/* Feature selector */}
      {activeProject && (
        <div style={{ marginBottom: 16 }}>
          <Lbl>Feature</Lbl>
          <button
            onClick={() => setPhase('features')}
            style={{
              width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8,
              border: `1px solid ${activePhase === 'features' ? C.purple : C.border}`,
              background: activePhase === 'features' ? C.purple + '12' : C.card,
              cursor: 'pointer', color: activeFeature ? C.text : C.dim, fontSize: 11,
              fontFamily: 'inherit', fontWeight: activeFeature ? 600 : 400,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
          >
            {activeFeature ? activeFeature.title : '+ Create / Select Feature'}
          </button>
        </div>
      )}

      {/* Phase nav */}
      {activeFeature && (
        <div style={{ marginBottom: 4 }}>
          <Lbl>Phases</Lbl>
          {PHASES.map(p => {
            const isActive = activePhase === p.id;
            const status = getPhaseStatus(p.id, activeFeature);
            return (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: isActive ? p.color + '18' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  fontFamily: 'inherit'
                }}
              >
                <span style={{ fontSize: 13, color: isActive ? p.color : C.dim }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? C.text : C.dim, flex: 1 }}>
                  {p.label}
                </span>
                <StatusDot status={status} />
              </button>
            );
          })}
        </div>
      )}

      {/* Overview (always visible) */}
      {!activeFeature && (
        <div style={{ marginBottom: 4 }}>
          <button
            onClick={() => setPhase('overview')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: activePhase === 'overview' ? C.purple + '18' : 'transparent',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
            }}
          >
            <span style={{ fontSize: 13, color: C.purple }}>◈</span>
            <span style={{ fontSize: 12, fontWeight: activePhase === 'overview' ? 700 : 400, color: activePhase === 'overview' ? C.text : C.dim }}>
              Overview
            </span>
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <Lbl>Legend</Lbl>
        {[['active', 'In Progress'], ['done', 'Completed'], ['pending', 'Not Started']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, paddingLeft: 6 }}>
            <StatusDot status={k} />
            <span style={{ fontSize: 10, color: C.dim }}>{v}</span>
          </div>
        ))}

        {/* Settings */}
        <button
          onClick={() => setPhase('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 8, border: 'none', marginTop: 8,
            background: activePhase === 'settings' ? C.purple + '18' : 'transparent',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
          }}
        >
          <span style={{ fontSize: 13, color: C.dim }}>⚙</span>
          <span style={{ fontSize: 12, color: activePhase === 'settings' ? C.text : C.dim }}>Settings</span>
        </button>
      </div>
    </div>
  );
}
