import { create } from 'zustand';
import { api } from '../api/client.js';

export const useAppStore = create((set, get) => ({
  // Data
  projects: [],
  features: [],
  settings: {},

  // Selections
  activeProjectId: null,
  activeFeatureId: null,
  activePhase: 'overview',  // overview | projects | features | architecture | development | codereview | testing | settings

  // Loading
  loadingProjects: false,
  loadingFeatures: false,

  // Error
  error: null,

  setPhase: (phase) => set({ activePhase: phase }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  loadSettings: async () => {
    try {
      const settings = await api.getSettings();
      set({ settings });
    } catch (err) {
      console.error('loadSettings:', err);
    }
  },

  saveSettings: async (data) => {
    const settings = await api.saveSettings(data);
    set({ settings });
  },

  loadProjects: async () => {
    set({ loadingProjects: true });
    try {
      const projects = await api.getProjects();
      set({ projects, loadingProjects: false });
    } catch (err) {
      set({ error: err.message, loadingProjects: false });
    }
  },

  createProject: async (data) => {
    const project = await api.createProject(data);
    set(state => ({ projects: [project, ...state.projects] }));
    return project;
  },

  deleteProject: async (id) => {
    await api.deleteProject(id);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
    }));
  },

  selectProject: async (projectId) => {
    set({ activeProjectId: projectId, activeFeatureId: null, activePhase: 'features', features: [] });
    if (projectId) {
      set({ loadingFeatures: true });
      try {
        const features = await api.getFeatures(projectId);
        set({ features, loadingFeatures: false });
      } catch (err) {
        set({ error: err.message, loadingFeatures: false });
      }
    }
  },

  loadFeatures: async () => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    set({ loadingFeatures: true });
    try {
      const features = await api.getFeatures(activeProjectId);
      set({ features, loadingFeatures: false });
    } catch (err) {
      set({ error: err.message, loadingFeatures: false });
    }
  },

  createFeature: async (title) => {
    const { activeProjectId } = get();
    const feature = await api.createFeature(activeProjectId, { title });
    set(state => ({ features: [feature, ...state.features] }));
    return feature;
  },

  selectFeature: (featureId) => {
    const { features } = get();
    const feature = features.find(f => f.id === featureId);
    set({
      activeFeatureId: featureId,
      activePhase: feature?.current_phase || 'architecture'
    });
  },

  refreshFeature: async (featureId) => {
    try {
      const feature = await api.getFeature(featureId);
      set(state => ({
        features: state.features.map(f => f.id === featureId ? feature : f)
      }));
      return feature;
    } catch (err) {
      console.error('refreshFeature:', err);
    }
  }
}));
