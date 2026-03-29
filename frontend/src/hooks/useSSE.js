import { useEffect } from 'react';
import { useStreamStore } from '../store/streamStore.js';

export function useSSE(operationId, onDone) {
  const startStream = useStreamStore(s => s.startStream);
  const appendChunk = useStreamStore(s => s.appendChunk);
  const finishStream = useStreamStore(s => s.finishStream);
  const errorStream = useStreamStore(s => s.errorStream);

  useEffect(() => {
    if (!operationId) return;

    startStream(operationId);

    const es = new EventSource(`/api/openclaw/stream/${operationId}`);
    let retries = 0;
    const MAX_RETRIES = 4;

    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'connected') return; // heartbeat
        if (d.type === 'chunk') {
          appendChunk(operationId, d.text);
        } else if (d.type === 'done') {
          finishStream(operationId, d.result);
          es.close();
          if (onDone) onDone(d.result);
        } else if (d.type === 'error') {
          errorStream(operationId, d.message);
          es.close();
        }
      } catch (_) {}
    };

    es.onerror = () => {
      retries++;
      if (retries >= MAX_RETRIES) {
        errorStream(operationId, 'Connection failed after multiple retries');
        es.close();
      }
    };

    return () => es.close();
  }, [operationId]);
}
