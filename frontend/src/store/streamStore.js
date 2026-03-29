import { create } from 'zustand';

export const useStreamStore = create((set, get) => ({
  streams: {}, // operationId → { chunks, status, result }

  startStream: (operationId) => {
    set(state => ({
      streams: {
        ...state.streams,
        [operationId]: { chunks: [], status: 'running', result: null }
      }
    }));
  },

  appendChunk: (operationId, text) => {
    set(state => {
      const stream = state.streams[operationId];
      if (!stream) return state;
      return {
        streams: {
          ...state.streams,
          [operationId]: { ...stream, chunks: [...stream.chunks, text] }
        }
      };
    });
  },

  finishStream: (operationId, result) => {
    set(state => {
      const stream = state.streams[operationId];
      if (!stream) return state;
      return {
        streams: {
          ...state.streams,
          [operationId]: { ...stream, status: 'done', result }
        }
      };
    });
  },

  errorStream: (operationId, message) => {
    set(state => {
      const stream = state.streams[operationId];
      if (!stream) return state;
      return {
        streams: {
          ...state.streams,
          [operationId]: { ...stream, status: 'error', chunks: [...(stream.chunks || []), `ERROR: ${message}`] }
        }
      };
    });
  },

  clearStream: (operationId) => {
    set(state => {
      const { [operationId]: _, ...rest } = state.streams;
      return { streams: rest };
    });
  },

  getStream: (operationId) => get().streams[operationId],
}));
