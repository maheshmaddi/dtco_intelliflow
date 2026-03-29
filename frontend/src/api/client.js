const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const e = new Error(err.message || 'Request failed');
    e.status = res.status;
    throw e;
  }
  return res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),

  upload(path, file) {
    const fd = new FormData();
    fd.append('file', file);
    return request('POST', path, fd);
  },

  // Settings
  getSettings: () => request('GET', '/settings'),
  saveSettings: (data) => request('PATCH', '/settings', data),

  // Projects
  getProjects: () => request('GET', '/projects'),
  createProject: (data) => request('POST', '/projects', data),
  updateProject: (id, data) => request('PATCH', `/projects/${id}`, data),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),

  // Features
  getFeatures: (projectId) => request('GET', `/projects/${projectId}/features`),
  createFeature: (projectId, data) => request('POST', `/projects/${projectId}/features`, data),
  getFeature: (id) => request('GET', `/features/${id}`),
  uploadReqDoc: (featureId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('POST', `/features/${featureId}/upload-req-doc`, fd);
  },

  // Architecture
  getArchRevisions: (featureId) => request('GET', `/arch/features/${featureId}/revisions`),
  analyzeArch: (featureId) => request('POST', `/arch/features/${featureId}/analyze`),
  replanArch: (featureId) => request('POST', `/arch/features/${featureId}/replan`),
  answerQuestion: (qId, answer) => request('PATCH', `/arch/questions/${qId}`, { answer }),
  approveArch: (revId, comment) => request('POST', `/arch/revisions/${revId}/approve`, { comment }),
  rejectArch: (revId, comment) => request('POST', `/arch/revisions/${revId}/reject`, { comment }),
  addArchComment: (revId, content) => request('POST', `/arch/revisions/${revId}/comments`, { content }),

  // Development
  getDevRun: (featureId) => request('GET', `/dev/features/${featureId}/run`),
  createBranch: (featureId, branchName) => request('POST', `/dev/features/${featureId}/branch`, { branch_name: branchName }),
  implement: (featureId) => request('POST', `/dev/features/${featureId}/implement`),
  compile: (runId) => request('POST', `/dev/runs/${runId}/compile`),
  verify: (runId) => request('POST', `/dev/runs/${runId}/verify`),
  push: (runId) => request('POST', `/dev/runs/${runId}/push`),
  approveDev: (runId, comment) => request('POST', `/dev/runs/${runId}/approve`, { comment }),
  requestDevChanges: (runId, comment) => request('POST', `/dev/runs/${runId}/request-changes`, { comment }),
  addDevComment: (runId, content) => request('POST', `/dev/runs/${runId}/comments`, { content }),

  // Code Review
  getReviewRevisions: (featureId) => request('GET', `/review/features/${featureId}/revisions`),
  analyzeReview: (featureId) => request('POST', `/review/features/${featureId}/analyze`),
  fixFinding: (findingId) => request('POST', `/review/findings/${findingId}/fix`),
  updateFinding: (findingId, data) => request('PATCH', `/review/findings/${findingId}`, data),
  approveReview: (revId, comment) => request('POST', `/review/revisions/${revId}/approve`, { comment }),
  requestReviewChanges: (revId, comment) => request('POST', `/review/revisions/${revId}/request-changes`, { comment }),

  // Testing
  getTestRevisions: (featureId) => request('GET', `/test/features/${featureId}/revisions`),
  generateTestPlan: (featureId) => request('POST', `/test/features/${featureId}/plan`),
  implementTests: (revId) => request('POST', `/test/revisions/${revId}/implement`),
  approveTestPlan: (revId, comment) => request('POST', `/test/revisions/${revId}/approve`, { comment }),
  requestTestChanges: (revId, comment) => request('POST', `/test/revisions/${revId}/request-changes`, { comment }),
  addTestComment: (revId, content) => request('POST', `/test/revisions/${revId}/comments`, { content }),

  // OpenClaw
  openclawHealth: () => request('GET', '/openclaw/health'),
};
