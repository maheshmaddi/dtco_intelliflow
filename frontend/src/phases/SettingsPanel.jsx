import React, { useState, useEffect } from 'react';
import { C, Card, Btn, Input, Lbl, PhaseHeader, SectionTitle, ErrorMsg, Tag } from '../ds/index.jsx';
import { useAppStore } from '../store/appStore.js';
import { api } from '../api/client.js';

export function SettingsPanel() {
  const { settings, saveSettings, activeProjectId, projects } = useAppStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  const [form, setForm] = useState({
    openclaw_cmd: '',
    file_size_limit_mb: '5',
    default_branch: 'main',
    review_lenses: []
  });
  const [compileCmd, setCompileCmd] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const ALL_LENSES = ['Architecture Compliance', 'Security Patterns', 'Performance', 'Code Quality', 'Documentation', 'Test Coverage'];

  useEffect(() => {
    if (settings) {
      setForm({
        openclaw_cmd: settings.openclaw_cmd || 'openclaw',
        file_size_limit_mb: settings.file_size_limit_mb || '5',
        default_branch: settings.default_branch || 'main',
        review_lenses: JSON.parse(settings.review_lenses || '[]')
      });
    }
  }, [settings]);

  useEffect(() => {
    if (activeProject) setCompileCmd(activeProject.compile_cmd || 'npm run build');
  }, [activeProject]);

  function toggleLens(lens) {
    setForm(f => ({
      ...f,
      review_lenses: f.review_lenses.includes(lens)
        ? f.review_lenses.filter(l => l !== lens)
        : [...f.review_lenses, lens]
    }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await saveSettings({
        openclaw_cmd: form.openclaw_cmd,
        file_size_limit_mb: form.file_size_limit_mb,
        default_branch: form.default_branch,
        review_lenses: JSON.stringify(form.review_lenses)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProject() {
    if (!activeProject) return;
    setSavingProject(true);
    try {
      await api.updateProject(activeProject.id, { compile_cmd: compileCmd });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProject(false);
    }
  }

  async function testConnection() {
    setHealthLoading(true);
    setHealthStatus(null);
    try {
      const result = await api.openclawHealth();
      setHealthStatus({ ok: true, message: result.output || 'Connected' });
    } catch (err) {
      setHealthStatus({ ok: false, message: err.message });
    } finally {
      setHealthLoading(false);
    }
  }

  return (
    <div>
      <PhaseHeader icon="⚙" title="Settings" subtitle="Configure OpenClaw integration, file limits, and review preferences." />

      <SectionTitle>OpenClaw CLI</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Lbl>OpenClaw CLI Command / Path</Lbl>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                value={form.openclaw_cmd}
                onChange={v => setForm(f => ({ ...f, openclaw_cmd: v }))}
                placeholder="openclaw"
                style={{ flex: 1 }}
              />
              <Btn
                label={healthLoading ? 'Testing…' : 'Test Connection'}
                color={C.blue}
                disabled={healthLoading}
                onClick={testConnection}
              />
            </div>
            {healthStatus && (
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 6,
                background: healthStatus.ok ? C.green + '0d' : C.red + '0d',
                border: `1px solid ${healthStatus.ok ? C.green + '30' : C.red + '30'}`,
                fontSize: 11, color: healthStatus.ok ? C.green : C.red
              }}>
                {healthStatus.ok ? '✓' : '✗'} {healthStatus.message}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6 }}>
            OpenClaw must be running on this machine. The app spawns it as a subprocess, passing context via <code style={{ color: C.lavender }}>--context-file</code>.
            Set the full path if <code style={{ color: C.lavender }}>openclaw</code> is not in your <code style={{ color: C.lavender }}>$PATH</code>.
          </div>
        </div>
      </Card>

      <SectionTitle>File Upload</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <Lbl>Maximum Requirement Document Size (MB)</Lbl>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="range" min={1} max={50} value={parseInt(form.file_size_limit_mb)}
            onChange={e => setForm(f => ({ ...f, file_size_limit_mb: e.target.value }))}
            style={{ flex: 1, accentColor: C.purple }}
          />
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
            padding: '5px 12px', fontSize: 12, color: C.text, minWidth: 60, textAlign: 'center'
          }}>
            {form.file_size_limit_mb} MB
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>
          Accepted file types: PDF, DOCX, TXT, MD
        </div>
      </Card>

      <SectionTitle>Git Defaults</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <Lbl>Default Base Branch</Lbl>
        <Input
          value={form.default_branch}
          onChange={v => setForm(f => ({ ...f, default_branch: v }))}
          placeholder="main"
        />
      </Card>

      <SectionTitle>Code Review Lenses</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>
          Select which aspects OpenClaw should analyze during code review:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_LENSES.map(lens => {
            const active = form.review_lenses.includes(lens);
            return (
              <button
                key={lens}
                onClick={() => toggleLens(lens)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? C.purple + '25' : 'transparent',
                  border: `1px solid ${active ? C.purple : C.border}`,
                  color: active ? C.lavender : C.dim,
                  transition: 'all 0.15s'
                }}
              >
                {active ? '✓ ' : ''}{lens}
              </button>
            );
          })}
        </div>
      </Card>

      {activeProject && (
        <>
          <SectionTitle>Project: {activeProject.name}</SectionTitle>
          <Card style={{ marginBottom: 20 }}>
            <Lbl>Compile Command (overrides global default for this project)</Lbl>
            <Input value={compileCmd} onChange={setCompileCmd} placeholder="npm run build" />
            <div style={{ marginTop: 10 }}>
              <Btn
                label={savingProject ? 'Saving…' : 'Save Project Settings'}
                color={C.blue}
                disabled={savingProject}
                onClick={handleSaveProject}
              />
            </div>
          </Card>
        </>
      )}

      <ErrorMsg message={error} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Btn
          label={saving ? 'Saving…' : 'Save Settings'}
          color={C.green}
          primary
          disabled={saving}
          onClick={handleSave}
        />
        {saved && <span style={{ color: C.green, fontSize: 12 }}>✓ Saved</span>}
      </div>
    </div>
  );
}
