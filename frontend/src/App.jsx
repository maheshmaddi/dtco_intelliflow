import React, { useEffect } from 'react';
import { C, Spinner } from './ds/index.jsx';
import { useAppStore } from './store/appStore.js';
import { Sidebar } from './components/layout/Sidebar.jsx';

// Panels
import { OverviewPanel } from './phases/OverviewPanel.jsx';
import { ProjectsPanel } from './phases/ProjectsPanel.jsx';
import { FeaturesPanel } from './phases/FeaturesPanel.jsx';
import { SettingsPanel } from './phases/SettingsPanel.jsx';
import { ArchitecturePhase } from './phases/ArchitecturePhase.jsx';
import { DevelopmentPhase } from './phases/DevelopmentPhase.jsx';
import { CodeReviewPhase } from './phases/CodeReviewPhase.jsx';
import { TestingPhase } from './phases/TestingPhase.jsx';

function TopBar() {
  const { activeProject, activeFeature, projects, features, activeProjectId, activeFeatureId, setPhase } = useAppStore();
  const project = projects.find(p => p.id === activeProjectId);
  const feature = features.find(f => f.id === activeFeatureId);

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, padding: '10px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.01)', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26,
          background: 'linear-gradient(135deg,#7c6fff,#54a0ff)',
          borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
        }}>⚙</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>OpenClaw Feature Lifecycle</div>
          <div style={{ fontSize: 10, color: C.dim }}>AI-Powered SDLC Tool</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {project && (
          <>
            <button
              onClick={() => setPhase('projects')}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: C.muted, fontFamily: 'monospace', cursor: 'pointer' }}
            >
              {project.name}
            </button>
            {feature && (
              <>
                <span style={{ color: C.dim, fontSize: 11 }}>›</span>
                <button
                  onClick={() => setPhase('features')}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: C.muted, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  {feature.title}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MainContent() {
  const { activePhase, activeFeatureId } = useAppStore();

  const panel = {
    overview:     <OverviewPanel />,
    projects:     <ProjectsPanel />,
    features:     <FeaturesPanel />,
    settings:     <SettingsPanel />,
    architecture: activeFeatureId ? <ArchitecturePhase featureId={activeFeatureId} /> : <FeaturesPanel />,
    development:  activeFeatureId ? <DevelopmentPhase featureId={activeFeatureId} /> : <FeaturesPanel />,
    codereview:   activeFeatureId ? <CodeReviewPhase featureId={activeFeatureId} /> : <FeaturesPanel />,
    testing:      activeFeatureId ? <TestingPhase featureId={activeFeatureId} /> : <FeaturesPanel />,
  }[activePhase] || <OverviewPanel />;

  return (
    <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 900 }}>
        {panel}
      </div>
    </div>
  );
}

export default function App() {
  const { loadProjects, loadSettings } = useAppStore();

  useEffect(() => {
    loadSettings();
    loadProjects();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}
