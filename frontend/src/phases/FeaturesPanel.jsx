import React, { useState } from 'react';
import { C, Card, Btn, Input, Lbl, PhaseHeader, EmptyState, Tag, Spinner } from '../ds/index.jsx';
import { useAppStore } from '../store/appStore.js';

const PHASE_COLORS = {
  architecture: C.purple,
  development: C.blue,
  codereview: C.red,
  testing: C.green,
  done: C.green
};

const PHASE_LABELS = {
  architecture: 'Architecture',
  development: 'Development',
  codereview: 'Code Review',
  testing: 'Testing',
  done: 'Done'
};

export function FeaturesPanel() {
  const { features, loadingFeatures, createFeature, selectFeature, activeProjectId, projects } = useAppStore();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const project = projects.find(p => p.id === activeProjectId);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const feature = await createFeature(title.trim());
      setTitle('');
      setShowForm(false);
      selectFeature(feature.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PhaseHeader
        icon="◫"
        title={`Features — ${project?.name || 'Project'}`}
        subtitle="Each feature goes through Architecture → Development → Code Review → Testing phases."
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.muted }}>{features.length} feature{features.length !== 1 ? 's' : ''}</div>
        <Btn label={showForm ? 'Cancel' : '+ New Feature'} color={C.purple} onClick={() => setShowForm(v => !v)} />
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Create Feature</div>
          <form onSubmit={handleCreate}>
            <Lbl>Feature Title *</Lbl>
            <Input
              value={title}
              onChange={setTitle}
              placeholder="e.g. User authentication with OAuth"
            />
            {error && <div style={{ color: C.red, fontSize: 11, marginTop: 6 }}>⚠ {error}</div>}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Btn
                label={loading ? 'Creating…' : 'Create Feature'}
                color={C.purple}
                primary
                disabled={!title.trim() || loading}
                onClick={handleCreate}
              />
            </div>
          </form>
        </Card>
      )}

      {loadingFeatures ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner color={C.purple} size={20} /></div>
      ) : features.length === 0 ? (
        <EmptyState icon="✨" title="No features yet" subtitle="Create a feature to start the AI-powered development lifecycle" />
      ) : (
        <div>
          {features.map(f => (
            <Card
              key={f.id}
              style={{ cursor: 'pointer', marginBottom: 8, transition: 'border-color 0.15s' }}
              onClick={() => selectFeature(f.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tag color={PHASE_COLORS[f.current_phase] || C.purple}>
                      {PHASE_LABELS[f.current_phase] || f.current_phase}
                    </Tag>
                    {f.branch_name && (
                      <span style={{ fontSize: 10, color: C.dim, fontFamily: 'monospace' }}>{f.branch_name}</span>
                    )}
                  </div>
                  {f.req_doc_name && (
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 5 }}>📄 {f.req_doc_name}</div>
                  )}
                </div>
                <Btn label="Open" color={C.purple} onClick={(e) => { e.stopPropagation(); selectFeature(f.id); }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
