import React, { useState } from 'react';
import { C, Card, Btn, Input, Lbl, PhaseHeader, EmptyState, ErrorMsg, Spinner } from '../ds/index.jsx';
import { useAppStore } from '../store/appStore.js';

function AddProjectForm({ onCreated }) {
  const [name, setName] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [compileCmd, setCompileCmd] = useState('npm run build');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createProject } = useAppStore();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !localPath.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const p = await createProject({ name: name.trim(), local_path: localPath.trim(), git_url: gitUrl.trim() || undefined, branch, compile_cmd: compileCmd });
      onCreated(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Add Git Project</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <Lbl>Project Name *</Lbl>
            <Input value={name} onChange={setName} placeholder="My App" />
          </div>
          <div>
            <Lbl>Local Path * (absolute path to repo)</Lbl>
            <Input value={localPath} onChange={setLocalPath} placeholder="/home/user/my-app" />
          </div>
          <div>
            <Lbl>Git URL (optional — will clone to Local Path if provided)</Lbl>
            <Input value={gitUrl} onChange={setGitUrl} placeholder="https://github.com/user/repo.git" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Lbl>Default Branch</Lbl>
              <Input value={branch} onChange={setBranch} placeholder="main" />
            </div>
            <div style={{ flex: 2 }}>
              <Lbl>Compile Command</Lbl>
              <Input value={compileCmd} onChange={setCompileCmd} placeholder="npm run build" />
            </div>
          </div>
        </div>
        <ErrorMsg message={error} />
        <div style={{ marginTop: 14 }}>
          <Btn
            label={loading ? 'Adding…' : '+ Add Project'}
            color={C.purple}
            primary
            disabled={!name.trim() || !localPath.trim() || loading}
            onClick={handleSubmit}
          />
        </div>
      </form>
    </Card>
  );
}

export function ProjectsPanel() {
  const { projects, loadingProjects, selectProject, deleteProject } = useAppStore();
  const [showForm, setShowForm] = useState(projects.length === 0);

  function handleCreated(project) {
    setShowForm(false);
    selectProject(project.id);
  }

  return (
    <div>
      <PhaseHeader icon="⊞" title="Projects" subtitle="Add your Git repositories. Each project can have multiple AI-managed features." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.muted }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
        <Btn label={showForm ? 'Cancel' : '+ Add Project'} color={C.purple} onClick={() => setShowForm(v => !v)} />
      </div>

      {showForm && <AddProjectForm onCreated={handleCreated} />}

      {loadingProjects ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner color={C.purple} size={20} /></div>
      ) : projects.length === 0 ? (
        <EmptyState icon="📁" title="No projects yet" subtitle="Add a Git project to get started" />
      ) : (
        <div>
          {projects.map(p => (
            <Card key={p.id} style={{ cursor: 'pointer', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }} onClick={() => selectProject(p.id)}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: 'monospace', marginBottom: 2 }}>{p.local_path}</div>
                  {p.git_url && <div style={{ fontSize: 10, color: C.dim }}>{p.git_url}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: C.dim }}>branch: <span style={{ color: C.blue }}>{p.branch}</span></span>
                    <span style={{ fontSize: 10, color: C.dim }}>build: <span style={{ color: C.muted }}>{p.compile_cmd}</span></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn label="Open" color={C.purple} onClick={() => selectProject(p.id)} />
                  <Btn label="Delete" color={C.red} onClick={(e) => { e.stopPropagation(); if (confirm('Delete project?')) deleteProject(p.id); }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
